CREATE DATABASE capstoneproject;
\c capstoneproject;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';
-- CREATE TYPE PROJECT_STATUS AS ENUM (
--     'PLANNING',      -- Lên kế hoạch
--     'PLANTING',      -- Đang trồng
--     'GROWING',       -- Sinh trưởng
--     'MATURE',        -- Trưởng thành
--     'HARVESTING',    -- Thu hoạch
--     'COMPLETED'      -- Hoàn thành
-- );
--
-- CREATE TYPE PHASE_STATUS AS ENUM (
--     'PLANNING',      -- Lên kế hoạch
--     'PLANTING',      -- Đang trồng
--     'GROWING',       -- Sinh trưởng
--     'MATURE',        -- Trưởng thành
--     'HARVESTING',    -- Thu hoạch
--     'COMPLETED'      -- Hoàn thành
-- );
--
-- CREATE TYPE CONTRACT_TYPE AS ENUM (
--     'INVESTMENT',        -- Đầu tư ban đầu (trồng cây)
--     'OWNERSHIP',         -- Sở hữu cây (nhận tín chỉ)
--     'SPONSORSHIP',       -- Tài trợ (không sở hữu)
--     'CARBON_CREDIT_ONLY' -- Chỉ mua tín chỉ, không sở hữu cây
-- );
--
-- CREATE TYPE CONTRACT_STATUS AS ENUM (
--     'DRAFT',            -- Nháp
--     'PENDING',          -- Chờ duyệt
--     'ACTIVE',           -- Đang hiệu lực
--     'EXPIRING_SOON',    -- Sắp hết hạn (30 ngày)
--     'EXPIRED',          -- Đã hết hạn
--     'RENEWED',          -- Đã gia hạn
--     'COMPLETED',        -- Hoàn thành
--     'TERMINATED',       -- Chấm dứt sớm
--     'CANCELLED'         -- Hủy bỏ
-- );
--
-- CREATE TYPE OWNERSHIP_STATUS AS ENUM (
--     'ACTIVE',           -- Đang sở hữu
--     'EXPIRED',          -- Hết hạn sở hữu
--     'TRANSFERRED',      -- Đã chuyển nhượng
--     'TERMINATED'        -- Chấm dứt
-- );
-- CREATE TYPE CREDIT_STATUS AS ENUM ('AVAILABLE', 'SOLD_OUT');
-- CREATE TYPE TRANSACTION_STATUS AS ENUM ('PURCHASED', 'RETIRED');
-- CREATE TYPE PAYMENT_STATUS AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       fullname VARCHAR(100) DEFAULT '',
                       username varchar(100) NOT NULL,
                       password VARCHAR(100) NOT NULL,
                       phone_number VARCHAR(10) NOT NULL,
                       email VARCHAR(100) DEFAULT '',
                       address VARCHAR(200) DEFAULT '',
                       created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                       is_active BOOLEAN DEFAULT TRUE,
                       date_of_birth DATE,
                       facebook_account_id INT DEFAULT 0,
                       google_account_id INT DEFAULT 0
                       CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    				   CONSTRAINT check_phone_format CHECK (phone_number ~ '^[0-9]{10,15}$' OR phone_number IS NULL)
);

CREATE TABLE tokens (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        token VARCHAR(255) UNIQUE NOT NULL,
                        token_type VARCHAR(50) NOT NULL,
                        expiration_date TIMESTAMP,
                        revoked BOOLEAN NOT NULL,
                        expired BOOLEAN NOT NULL,
                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE social_accounts (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         provider VARCHAR(20) NOT NULL,
                         provider_id VARCHAR(50) NOT NULL,
                         email VARCHAR(150) NOT NULL,
                         name VARCHAR(100) NOT NULL,
                         user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng loại cây (Tree Species)
CREATE TABLE tree_species (
                        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        scientific_name VARCHAR(255),
                        carbon_absorption_rate NUMERIC(10, 4) NOT NULL, -- Hệ số k_i (kg CO2/cây/năm)
                        description TEXT,
                        image_url VARCHAR(500),
                        typical_height NUMERIC(10, 2), -- Chiều cao điển hình (m)
                        typical_diameter NUMERIC(10, 2), -- Đường kính thân điển hình (cm)
                        typical_lifespan INTEGER, -- Tuổi thọ (năm)
                        growth_rate VARCHAR(50), -- 'SLOW', 'MEDIUM', 'FAST'
                        climate_zones TEXT[], -- Vùng khí hậu phù hợp
                        soil_types TEXT[], -- Loại đất phù hợp
                        water_requirement VARCHAR(50), -- 'LOW', 'MEDIUM', 'HIGH'
                        sunlight_requirement VARCHAR(50), -- 'FULL_SUN', 'PARTIAL_SHADE', 'SHADE'
                        wood_value NUMERIC(15, 2), -- Giá trị gỗ (VNĐ/m³)
                        fruit_value NUMERIC(15, 2), -- Giá trị quả/lá (VNĐ/kg)
                        has_commercial_value BOOLEAN DEFAULT FALSE,
                        is_active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bảng dự án
CREATE TABLE projects (
                          id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                          code VARCHAR(50) UNIQUE NOT NULL, -- Mã dự án
                          name VARCHAR(255) NOT NULL,
                          description TEXT,
                          location_text TEXT,
                          latitude NUMERIC(10, 8),
                          longitude NUMERIC(11, 8),
                          area NUMERIC(12, 2) NOT NULL CHECK (area > 0), -- Diện tích (m²)
                          area_unit VARCHAR(10) DEFAULT 'm2', -- m2 hoặc ha
                          usable_area NUMERIC(12, 2), -- Diện tích sử dụng thực tế
                          planting_date DATE NOT NULL,
                          total_trees_planned INTEGER NOT NULL CHECK (total_trees_planned > 0),
                          total_trees_actual INTEGER DEFAULT 0,
                          planting_density NUMERIC(10, 2), -- Mật độ (cây/ha)
                          project_status VARCHAR(20) DEFAULT 'PLANNING',
                          manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
                          partner_organizations TEXT[], -- Các tổ chức đối tác
                          is_public BOOLEAN DEFAULT TRUE, -- Dự án công khai cho doanh nghiệp mua
                          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                          CONSTRAINT check_planting_date CHECK (planting_date <= CURRENT_DATE),
                          CONSTRAINT check_area CHECK (usable_area IS NULL OR usable_area <= area)
);

-- Bảng liên kết dự án và loại cây (nhiều loại cây trong 1 dự án)
CREATE TABLE tree_species_on_phases (
                          id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                          phase_id INTEGER NOT NULL REFERENCES project_phases(id) ON DELETE CASCADE,
                          tree_species_id INTEGER NOT NULL REFERENCES tree_species(id) ON DELETE RESTRICT,
                          quantity_planned INTEGER NOT NULL CHECK (quantity_planned > 0),
                          quantity_actual INTEGER DEFAULT 0 CHECK (quantity_actual >= 0),
                          quantity_died INTEGER DEFAULT 0 CHECK (quantity_died >= 0),
                          cost_per_tree NUMERIC(15, 2), -- Giá mua giống/cây
                          planting_cost NUMERIC(15, 2), -- Chi phí trồng
                          maintenance_cost_yearly NUMERIC(15, 2), -- Chi phí chăm sóc/năm
                          notes TEXT,
                          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                          UNIQUE(phase_id, tree_species_id),
                          -- Constraint: quantity_died không được lớn hơn quantity_actual
                          CONSTRAINT check_died_trees CHECK (quantity_died <= quantity_actual)
);

-- Bảng vòng đời dự án
CREATE TABLE project_phases (
                          id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                          project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                          phase_number INTEGER NOT NULL, -- Giai đoạn thứ mấy
                          phase_name VARCHAR(255),
                          description TEXT,
                          phase_status VARCHAR(20) NOT NULL DEFAULT 'PLANNING',
                          start_date DATE NOT NULL,
                          end_date DATE,
                          expected_duration_days INTEGER, -- Dự kiến bao nhiêu ngày
                          actual_duration_days INTEGER, -- Thực tế bao nhiêu ngày
                          budget NUMERIC(15, 2), -- Ngân sách cho giai đoạn này
                          actual_cost NUMERIC(15, 2) DEFAULT 0, -- Chi phí thực tế
                          notes TEXT,
                          created_by UUID REFERENCES users(id),
                          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                          UNIQUE(project_id, phase_number)
);

-- Bảng tổng hợp số lượng cây theo dự án
CREATE TABLE project_tree_summary (
                        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                        tree_species_id INTEGER NOT NULL REFERENCES tree_species(id) ON DELETE CASCADE,
                        -- Tổng số lượng từ tất cả các phases
                        total_planned INTEGER NOT NULL DEFAULT 0,
                        total_actual INTEGER NOT NULL DEFAULT 0,
                        total_died INTEGER NOT NULL DEFAULT 0,
                        total_alive INTEGER GENERATED ALWAYS AS (total_actual - total_died) STORED,
                        -- Diện tích
                        total_area NUMERIC(12, 2),
                        -- Tổng chi phí
                        total_investment NUMERIC(15, 2) DEFAULT 0,
                        last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(project_id, tree_species_id)
);

-- Bảng hình ảnh dự án
CREATE TABLE project_images (
                                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                                phase_id INTEGER REFERENCES project_phases(id) ON DELETE SET NULL,
                                image_url VARCHAR(500) NOT NULL,
                                thumbnail_url VARCHAR(500),
                                caption TEXT,
                                -- Metadata
                                taken_date DATE,
                                latitude NUMERIC(10, 8),
                                longitude NUMERIC(11, 8),
                                image_type VARCHAR(50), -- 'BEFORE', 'DURING', 'AFTER', 'DRONE', 'GROUND'
                                is_featured BOOLEAN DEFAULT FALSE,
                                display_order INTEGER DEFAULT 0,
                                uploaded_by UUID REFERENCES users(id),
                                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bảng dữ liệu sinh trưởng hàng năm
CREATE TABLE annual_growth_data (
                                    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                                    tree_species_id INTEGER NOT NULL REFERENCES tree_species(id) ON DELETE RESTRICT,
                                    report_year INTEGER NOT NULL,
                                    trees_alive INTEGER NOT NULL CHECK (trees_alive >= 0),
                                    avg_height NUMERIC(10, 2), -- cm
                                    avg_canopy_diameter NUMERIC(10, 2), -- cm
                                    avg_trunk_diameter NUMERIC(10, 2), -- DBH - Diameter at Breast Height (cm)
                                    survival_rate NUMERIC(5, 4) CHECK (survival_rate >= 0 AND survival_rate <= 1), -- 0.0 - 1.0
                                    health_status VARCHAR(50), -- 'EXCELLENT', 'GOOD', 'FAIR', 'POOR'
                                    diseases TEXT, -- Ghi chú về bệnh hại
                                    co2_absorbed NUMERIC(15, 2), -- Tự động tính (kg)
                                    notes TEXT,
                                    recorded_by UUID REFERENCES users(id),
                                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                                    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                                    CONSTRAINT check_report_year CHECK (report_year >= 1900 AND report_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
                                    UNIQUE(project_id, tree_species_id, report_year)
);

-- Bảng hợp đồng doanh nghiệp
CREATE TABLE contracts (
                           id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                           contract_code VARCHAR(50) UNIQUE NOT NULL,
                           project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
                           enterprise_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                           contract_type VARCHAR(50) NOT NULL DEFAULT 'OWNERSHIP',
                           num_trees INTEGER CHECK (num_trees > 0),
                           area NUMERIC(12, 2) CHECK (area > 0),
                           unit_price NUMERIC(15, 2) NOT NULL,
                           total_amount NUMERIC(15, 2) NOT NULL,
                           contract_term_years INTEGER, -- Thời hạn hợp đồng (năm)
                           start_date DATE,
                           end_date DATE,
                           -- Cơ chế gia hạn
                           auto_renewal BOOLEAN DEFAULT FALSE, -- Tự động gia hạn
                           renewal_term_years INTEGER, -- Thời hạn gia hạn mặc định
                           renewal_notice_days INTEGER DEFAULT 30, -- Thông báo trước bao nhiêu ngày
                           max_renewals INTEGER, -- Số lần gia hạn tối đa (NULL = không giới hạn)
                           renewal_count INTEGER DEFAULT 0, -- Đã gia hạn bao nhiêu lần
                           -- Điều khoản đặc biệt
                           carbon_credit_sharing NUMERIC(5, 2) DEFAULT 100.00, -- % tín chỉ carbon được hưởng (0-100)
                           harvest_rights BOOLEAN DEFAULT FALSE, -- Quyền thu hoạch gỗ
                           transfer_allowed BOOLEAN DEFAULT FALSE, -- Cho phép chuyển nhượng
                           early_termination_penalty NUMERIC(15, 2), -- Phí phạt chấm dứt sớm
                           payment_date DATE,
                           contract_status VARCHAR(50) DEFAULT 'PENDING',
                           termination_reason TEXT,
                           terminated_at TIMESTAMPTZ,
                           contract_file_url VARCHAR(500),
                           approved_by UUID REFERENCES users(id),
                           approved_at TIMESTAMPTZ,
                           notes TEXT,
                           created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                           CONSTRAINT check_dates CHECK (end_date > start_date),
                           CONSTRAINT check_carbon_sharing CHECK (carbon_credit_sharing >= 0 AND carbon_credit_sharing <= 100)
);

-- BẢNG QUYỀN SỞ HỮU CÂY (Tree Ownership)
CREATE TABLE tree_ownership (
                                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
                                project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
                                tree_species_id INTEGER REFERENCES tree_species(id),
                                owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                                -- Số lượng sở hữu
                                num_trees INTEGER NOT NULL CHECK (num_trees > 0),
                                area NUMERIC(12, 2) CHECK (area > 0),

                                -- Thời hạn sở hữu
                                ownership_start_date DATE NOT NULL,
                                ownership_end_date DATE NOT NULL,

                                -- Quyền lợi
                                carbon_credit_percentage NUMERIC(5, 2) DEFAULT 100.00, -- % tín chỉ được hưởng
                                harvest_rights BOOLEAN DEFAULT FALSE,

                                -- Status
                                status VARCHAR(20) DEFAULT 'ACTIVE',

                                -- Tracking
                                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                                CONSTRAINT check_ownership_dates CHECK (ownership_end_date > ownership_start_date)
);

-- BẢNG LỊCH SỬ GIA HẠN HỢP ĐỒNG
CREATE TABLE contract_renewals (
                    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                    original_contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
                    new_contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
                    renewal_number INTEGER NOT NULL, -- Lần gia hạn thứ mấy
                    renewal_term_years INTEGER NOT NULL,
                    old_end_date DATE NOT NULL,
                    new_start_date DATE NOT NULL,
                    new_end_date DATE NOT NULL,
                    renewal_amount NUMERIC(15, 2), -- Phí gia hạn
                    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
                    requested_by UUID REFERENCES users(id),
                    requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                    approved_by UUID REFERENCES users(id),
                    approved_at TIMESTAMPTZ,
                    notes TEXT,
                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- BẢNG CHUYỂN NHƯỢNG HỢP ĐỒNG/QUYỀN SỞ HỮU
CREATE TABLE ownership_transfers (
                    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                    -- Chuyển nhượng gì
                    contract_id INTEGER REFERENCES contracts(id),
                    ownership_id INTEGER REFERENCES tree_ownership(id),
                    -- Từ ai sang ai
                    from_user_id UUID NOT NULL REFERENCES users(id),
                    to_user_id UUID NOT NULL REFERENCES users(id),
                    -- Số lượng chuyển nhượng
                    num_trees INTEGER CHECK (num_trees > 0),
                    transfer_price NUMERIC(15, 2),
                    -- Status
                    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLETED, REJECTED
                    transfer_date DATE,
                    approved_by UUID REFERENCES users(id),
                    approved_at TIMESTAMPTZ,
                    notes TEXT,
                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT check_transfer_reference CHECK (
                            (contract_id IS NOT NULL AND ownership_id IS NULL) OR
                            (contract_id IS NULL AND ownership_id IS NOT NULL)
                    )
);

-- BẢNG THÔNG BÁO GIA HẠN
CREATE TABLE renewal_notifications (
                    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                    contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
                    enterprise_id UUID NOT NULL REFERENCES users(id),
                    notification_type VARCHAR(50), -- 'EXPIRING_SOON', 'EXPIRED', 'AUTO_RENEWED'
                    notification_date DATE NOT NULL,
                    days_until_expiry INTEGER,
                    is_read BOOLEAN DEFAULT FALSE,
                    is_sent BOOLEAN DEFAULT FALSE, -- Đã gửi email chưa
                    sent_at TIMESTAMPTZ,
                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bảng tín chỉ carbon
CREATE TABLE carbon_credits (
                                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                credit_code VARCHAR(50) UNIQUE NOT NULL,
                                project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
                                report_year INTEGER NOT NULL,
                                total_co2_tons NUMERIC(15, 2) NOT NULL CHECK (total_co2_tons > 0), -- Tổng CO2 (tấn)
                                credits_issued INTEGER NOT NULL CHECK (credits_issued > 0), -- Số tín chỉ phát hành
                                credits_sold INTEGER DEFAULT 0 CHECK (credits_sold >= 0),
                                credits_retired INTEGER DEFAULT 0 CHECK (credits_retired >= 0),
                                credits_available INTEGER NOT NULL CHECK (credits_available >= 0),
                                price_per_credit NUMERIC(15, 2),
                                credits_status VARCHAR(50) DEFAULT 'AVAILABLE',
                                verification_standard VARCHAR(100), -- VCS, Gold Standard, etc.
                                certificate_url VARCHAR(500),
                                issued_by UUID REFERENCES users(id),
                                issued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                                expires_at TIMESTAMPTZ,
                                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                                CONSTRAINT check_credits_balance CHECK (credits_sold + credits_retired <= credits_issued)
);

-- BẢNG PHÂN PHỐI TÍN CHỈ CARBON
CREATE TABLE carbon_credit_allocations (
                                id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                credit_id INTEGER NOT NULL REFERENCES carbon_credits(id) ON DELETE RESTRICT,
                                ownership_id INTEGER NOT NULL REFERENCES tree_ownership(id) ON DELETE RESTRICT,
                                -- Số lượng tín chỉ được phân bổ
                                allocated_credits INTEGER NOT NULL CHECK (allocated_credits > 0),
                                percentage NUMERIC(5, 2) NOT NULL, -- % tín chỉ được hưởng
                                -- Thông tin người nhận
                                owner_id UUID NOT NULL REFERENCES users(id),
                                -- Status
                                status VARCHAR(50) DEFAULT 'ALLOCATED', -- ALLOCATED, CLAIMED, SOLD, RETIRED
                                claimed_at TIMESTAMPTZ,
                                notes TEXT,
                                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bảng giao dịch tín chỉ
CREATE TABLE credit_transactions (
                                     id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                     transaction_code VARCHAR(50) UNIQUE NOT NULL,
                                     credit_id INTEGER NOT NULL REFERENCES carbon_credits(id) ON DELETE RESTRICT,
                                     enterprise_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                                     quantity INTEGER NOT NULL CHECK (quantity > 0),
                                     unit_price NUMERIC(15, 2) NOT NULL,
                                     total_amount NUMERIC(15, 2) NOT NULL,
                                     transaction_status VARCHAR(50) DEFAULT 'PURCHASED',
                                     certificate_url VARCHAR(500),
                                     retirement_reason TEXT,
                                     purchased_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                                     retired_at TIMESTAMPTZ,
                                     created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bảng lịch sử thanh toán
CREATE TABLE payments (
                          id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                          payment_code VARCHAR(50) UNIQUE NOT NULL,
                          contract_id INTEGER REFERENCES contracts(id) ON DELETE RESTRICT,
                          credit_transaction_id INTEGER REFERENCES credit_transactions(id) ON DELETE RESTRICT,
                          payer_id UUID NOT NULL REFERENCES users(id),
                          amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
                          payment_method VARCHAR(50), -- 'BANK_TRANSFER', 'CREDIT_CARD', 'E_WALLET'
                          payment_status VARCHAR(50) DEFAULT 'PENDING',
                          transaction_id VARCHAR(255), -- ID từ payment gateway
                          bank_name VARCHAR(100),
                          account_number VARCHAR(50),
                          paid_at TIMESTAMPTZ,
                          notes TEXT,
                          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                          CONSTRAINT check_payment_reference CHECK (
                              (contract_id IS NOT NULL AND credit_transaction_id IS NULL) OR
                              (contract_id IS NULL AND credit_transaction_id IS NOT NULL)
                              )
);
