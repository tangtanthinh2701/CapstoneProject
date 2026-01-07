CREATE
DATABASE capstoneproject;
\c
capstoneproject;

CREATE
EXTENSION IF NOT EXISTS "uuid-ossp";
SELECT *
FROM pg_extension
WHERE extname = 'uuid-ossp';
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
CREATE TYPE CONTRACT_CATEGORY AS ENUM ('ENTERPRISE_PROJECT', 'FARM_SERVICE', 'PARTNER_SERVICE');
CREATE TYPE CONTRACT_STATUS AS ENUM ('DRAFT','PENDING','ACTIVE','EXPIRING_SOON','EXPIRED','RENEWED','COMPLETED','TERMINATED','CANCELLED');


CREATE TABLE users
(
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fullname      VARCHAR(100)     DEFAULT '',
    username      varchar(100) NOT NULL,
    password      VARCHAR(100) NOT NULL,
    phone_number  VARCHAR(10)  NOT NULL,
    email         VARCHAR(100)     DEFAULT '',
    address       VARCHAR(200)     DEFAULT '',
    sex           BOOLEAN          DEFAULT FALSE,
    created_at    TIMESTAMPTZ      DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ      DEFAULT CURRENT_TIMESTAMP,
    is_active     BOOLEAN          DEFAULT TRUE,
    date_of_birth DATE,
    CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
) ,
    				   CONSTRAINT check_phone_format CHECK (phone_number ~ '^[0-9]{10,15}$' OR phone_number IS NULL)
);

CREATE TABLE tokens
(
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token           VARCHAR(255) UNIQUE NOT NULL,
    token_type      VARCHAR(50)         NOT NULL,
    expiration_date TIMESTAMP,
    revoked         BOOLEAN             NOT NULL,
    expired         BOOLEAN             NOT NULL,
    user_id         UUID                NOT NULL REFERENCES users (id) ON DELETE CASCADE
);

-- Bảng loại cây (Tree Species)
CREATE TABLE tree_species
(
    id                     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name                   VARCHAR(255)   NOT NULL,
    scientific_name        VARCHAR(255),
    carbon_absorption_rate NUMERIC(10, 4) NOT NULL, -- Hệ số k_i (kg CO2/cây/năm)
    description            TEXT,
    image_url              VARCHAR(500),
    created_at             TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMPTZ,
    deleted_at             TIMESTAMPTZ
);

-- Bảng dự án
CREATE TABLE projects
(
    id                      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code                    VARCHAR(50) UNIQUE NOT NULL, -- Mã dự án
    name                    VARCHAR(255)       NOT NULL,
    description             TEXT,
    project_status          VARCHAR(20)    DEFAULT 'PLANNING',
    manager_id              UUID               REFERENCES users (id) ON DELETE SET NULL,
    is_public               BOOLEAN        DEFAULT TRUE, -- Dự án công khai cho doanh nghiệp mua
    budget                  NUMERIC(15, 2),              -- Ngân sách tổng
    target_consumed_carbon  NUMERIC(15, 2) DEFAULT 0,    -- Lượng CO2 đã hấp thụ (kg) (tổng số target của phase)
    current_consumed_carbon NUMERIC(15, 2) DEFAULT 0,    -- Lượng CO2 đã hấp thụ hiện tại (kg) (tính từ cây)
    created_at              TIMESTAMPTZ    DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ    DEFAULT CURRENT_TIMESTAMP,
);

-- Bảng đối tác dự án
CREATE TABLE partners
(
    id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    partner_name TEXT NOT NULL,
    img_url      VARCHAR(500)
);

-- Bảng liên kết dự án và đối tác
CREATE TABLE project_partners
(
    id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    partner_id INTEGER NOT NULL REFERENCES partners (id) ON DELETE CASCADE,
    role       VARCHAR(100), -- Vai trò của đối tác trong dự án
    notes      TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, partner_id)
);

-- Bảng vòng đời dự án
CREATE TABLE project_phases
(
    id                      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id              INTEGER     NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    phase_order             INTEGER     NOT NULL,           -- Giai đoạn thứ mấy
    phase_name              VARCHAR(255),
    description             TEXT,
    phase_status            VARCHAR(20) NOT NULL DEFAULT 'PLANNING',
    expected_start_date     DATE,
    expected_end_date       DATE,
    actual_start_date       DATE        NOT NULL,
    actual_end_date         DATE,
    budget                  NUMERIC(15, 2),                 -- Ngân sách cho giai đoạn này
    actual_cost             NUMERIC(15, 2)       DEFAULT 0, -- Chi phí thực tế (tính từ cây)
    target_consumed_carbon  NUMERIC(15, 2)       DEFAULT 0, -- Lượng CO2 đã hấp thụ (kg)
    current_consumed_carbon NUMERIC(15, 2)       DEFAULT 0, -- Lượng CO2 đã hấp thụ hiện tại (kg) (tính từ cây)
    notes                   TEXT,
    created_by              UUID REFERENCES users (id),
    created_at              TIMESTAMPTZ          DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ          DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, phase_order)
);

-- -- Bảng hình ảnh dự án
-- CREATE TABLE project_images
-- (
--     id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     project_id    INTEGER      NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
--     phase_id      INTEGER      REFERENCES project_phases (id) ON DELETE SET NULL,
--     image_url     VARCHAR(500) NOT NULL,
--     thumbnail_url VARCHAR(500),
--     caption       TEXT,
--     -- Metadata
--     taken_date    DATE,
--     image_type    VARCHAR(50), -- 'BEFORE', 'DURING', 'AFTER', 'DRONE', 'GROUND'
--     is_featured   BOOLEAN     DEFAULT FALSE,
--     uploaded_by   UUID REFERENCES users (id),
--     created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
-- );

-- Bảng dữ liệu sinh trưởng hàng năm
-- CREATE TABLE annual_growth_data
-- (
--     id                  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     project_id          INTEGER NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
--     tree_species_id     INTEGER NOT NULL REFERENCES tree_species (id) ON DELETE RESTRICT,
--     report_year         INTEGER NOT NULL,
--     trees_alive         INTEGER NOT NULL CHECK (trees_alive >= 0),
--     avg_height          NUMERIC(10, 2),                                                  -- cm
--     avg_canopy_diameter NUMERIC(10, 2),                                                  -- cm
--     avg_trunk_diameter  NUMERIC(10, 2),                                                  -- DBH - Diameter at Breast Height (cm)
--     survival_rate       NUMERIC(5, 4) CHECK (survival_rate >= 0 AND survival_rate <= 1), -- 0.0 - 1.0
--     health_status       VARCHAR(50),                                                     -- 'EXCELLENT', 'GOOD', 'FAIR', 'POOR'
--     diseases            TEXT,                                                            -- Ghi chú về bệnh hại
--     co2_absorbed        NUMERIC(15, 2),                                                  -- Tự động tính (kg)
--     notes               TEXT,
--     recorded_by         UUID REFERENCES users (id),
--     created_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
--     updated_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
--     CONSTRAINT check_report_year CHECK (report_year >= 1900 AND report_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
--     UNIQUE (project_id, tree_species_id, report_year)
-- );

-- Bảng Farm (Khu vực trồng trong dự án)
CREATE TABLE farms
(
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code            VARCHAR(50)    NOT NULL,      -- Mã khu vực (VD: FARM-001)
    name            VARCHAR(255)   NOT NULL,
    description     TEXT,
    -- Vị trí địa lý
    location        VARCHAR(500),                 -- Địa chỉ
    latitude        NUMERIC(10, 8),
    longitude       NUMERIC(11, 8),
    -- Diện tích
    area            NUMERIC(12, 2) NOT NULL,      -- Tổng diện tích (m²)
    usable_area     NUMERIC(12, 2),               -- Diện tích trồng thực tế (m²)
    -- Thống kê cây (cron job)
    total_trees     INTEGER     DEFAULT 0,        -- Tổng số cây trong farm (đã trồng kể cả cây sống hay chết)
    alive_trees     INTEGER     DEFAULT 0,        -- Số cây còn sống
    dead_trees      INTEGER     DEFAULT 0,        -- Số cây đã chết
    -- Thông tin môi trường
    soil_type       VARCHAR(100),                 -- Loại đất
    climate_zone    VARCHAR(100),                 -- Vùng khí hậu
    avg_rainfall    NUMERIC(10, 2),               -- Lượng mưa TB (mm/năm)
    avg_temperature NUMERIC(5, 2),                -- Nhiệt độ TB (°C)
    -- Status
    farm_status     VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, CLOSED
    planting_date   DATE,                         -- Ngày bắt đầu trồng
    -- Tracking
    created_by      UUID REFERENCES users (id),
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT unique_farm_code_per_project UNIQUE (code),
    CONSTRAINT check_usable_area CHECK (usable_area IS NULL OR usable_area <= area)
);

-- Bảng theo dõi việc mua cây từ farm cho phase
CREATE TABLE phase_tree_purchases
(
    id                        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    phase_id                  INTEGER        NOT NULL REFERENCES project_phases (id) ON DELETE CASCADE,
    farm_id                   INTEGER        NOT NULL REFERENCES farms (id) ON DELETE RESTRICT,
    tree_species_id           INTEGER        NOT NULL REFERENCES tree_species (id) ON DELETE RESTRICT,

    -- Số lượng mua
    quantity                  INTEGER        NOT NULL CHECK (quantity > 0),
    unit_price                NUMERIC(15, 2) NOT NULL,          -- Giá mỗi cây
    total_price               NUMERIC(15, 2) NOT NULL,          -- Tổng tiền

    -- Carbon từ lô cây này
    estimated_carbon_per_tree NUMERIC(10, 4) NOT NULL,          -- CO2 ước tính/cây (kg)
    total_estimated_carbon    NUMERIC(15, 4) NOT NULL,          -- Tổng CO2 ước tính (kg)
    actual_carbon_absorbed    NUMERIC(15, 4) DEFAULT 0,         -- CO2 thực tế đã hấp thụ (kg)

    -- Trạng thái
    purchase_status           VARCHAR(20)    DEFAULT 'PENDING', -- PENDING, APPROVED, DELIVERED, CANCELLED
    purchase_date             DATE,
    delivery_date             DATE,

    -- Tracking
    notes                     TEXT,
    created_by                UUID REFERENCES users (id),
    approved_by               UUID REFERENCES users (id),
    created_at                TIMESTAMPTZ    DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMPTZ    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_phase_farm_species UNIQUE (phase_id, farm_id, tree_species_id, purchase_date)
);

-- Bảng quỹ carbon dư (Carbon Reserve)
CREATE TABLE carbon_reserve
(
    id                 INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id         INTEGER        NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    source_phase_id    INTEGER        REFERENCES project_phases (id) ON DELETE SET NULL,

    -- Số carbon dư
    carbon_amount      NUMERIC(15, 4) NOT NULL CHECK (carbon_amount > 0), -- kg CO2
    remaining_amount   NUMERIC(15, 4) NOT NULL CHECK (remaining_amount >= 0),

    -- Trạng thái
    status             VARCHAR(20) DEFAULT 'AVAILABLE',                   -- AVAILABLE, ALLOCATED, EXPIRED
    source_description TEXT,                                              -- Mô tả nguồn gốc

    -- Tracking
    created_at         TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at         TIMESTAMPTZ                                        -- Ngày hết hạn (nếu có)
);

-- Bảng phân bổ carbon từ quỹ dư
CREATE TABLE carbon_reserve_allocations
(
    id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reserve_id       INTEGER        NOT NULL REFERENCES carbon_reserve (id) ON DELETE CASCADE,
    target_phase_id  INTEGER        NOT NULL REFERENCES project_phases (id) ON DELETE CASCADE,

    allocated_amount NUMERIC(15, 4) NOT NULL CHECK (allocated_amount > 0),
    allocation_date  DATE           NOT NULL,
    notes            TEXT,

    allocated_by     UUID REFERENCES users (id),
    created_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bảng liên kết dự án và farm
CREATE TABLE project_farms
(
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id  INTEGER NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    farm_id     INTEGER NOT NULL REFERENCES farms (id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users (id),
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, farm_id)
);

-- Bảng Trees (Từng đánh giá trung bình chất lượng cây trong farm)
CREATE TABLE trees_farm
(
    id                          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    farm_id                     INTEGER NOT NULL REFERENCES farms (id) ON DELETE CASCADE,
    tree_species_id             INTEGER NOT NULL REFERENCES tree_species (id) ON DELETE RESTRICT,
    number_trees                INTEGER NOT NULL DEFAULT 1,         -- Số cây giống ban đầu
    latitude                    NUMERIC(10, 8),
    longitude                   NUMERIC(11, 8),
    -- Ngày trồng
    planting_date               DATE    NOT NULL,
    -- Thông tin hiện tại (cập nhật từ growth_records trung bình của các cây cùng một loại)
    current_avg_height          NUMERIC(10, 2)   DEFAULT 0,         -- Chiều cao hiện tại (cm)
    current_avg_trunk_diameter  NUMERIC(10, 2)   DEFAULT 0,         -- Đường kính thân (cm) - DBH
    current_avg_canopy_diameter NUMERIC(10, 2)   DEFAULT 0,         -- Đường kính tán (cm)
    current_avg_health_status   VARCHAR(20)      DEFAULT 'HEALTHY', -- HEALTHY, DISEASED, DYING, DEAD
    -- CO2 hấp thụ (tính toán từ công thức)
    total_co2_absorbed          NUMERIC(15, 4)   DEFAULT 0,         -- Tổng CO2 đã hấp thụ (kg)
    -- Status
    tree_status                 VARCHAR(20)      DEFAULT 'ALIVE',   -- ALIVE, DEAD, REMOVED, TRANSPLANTED
    available_trees             INTEGER          DEFAULT 0,         -- Số cây còn lại có thể bán
    -- Tracking
    created_by                  UUID REFERENCES users (id),
    created_at                  TIMESTAMPTZ      DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMPTZ      DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_farm UNIQUE (farm_id)
);

-- Bảng yếu tố môi trường theo từng khoảng thời gian cho farm (để tự động hóa chỉ số carbon)
CREATE TABLE farm_environment_factors
(
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    farm_id         INTEGER NOT NULL REFERENCES farms (id) ON DELETE CASCADE,
    from_date       DATE    NOT NULL,
    to_date         DATE    NOT NULL,
    rainfall_factor NUMERIC(6, 3) DEFAULT 1.0,
    temp_factor     NUMERIC(6, 3) DEFAULT 1.0,
    soil_factor     NUMERIC(6, 3) DEFAULT 1.0,
    overall_factor  NUMERIC(6, 3) DEFAULT 1.0, -- = rainfall * temp * soil
    calculated_by   UUID REFERENCES users (id),
    created_at      TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_range CHECK (to_date > from_date)
);

-- Bảng hợp đồng doanh nghiệp
CREATE TABLE contracts
(
    id                        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contract_code             VARCHAR(50) UNIQUE NOT NULL,
    project_id                INTEGER            NOT NULL REFERENCES projects (id) ON DELETE RESTRICT,
    contract_category         CONTRACT_CATEGORY  NOT NULL DEFAULT 'ENTERPRISE_PROJECT',
    contract_type             VARCHAR(50)        NOT NULL DEFAULT 'OWNERSHIP',
    -- OWNERSHIP / INVESTMENT / CARBON_CREDIT_ONLY / SERVICE...
    unit_price                NUMERIC(15, 2)     NOT NULL,
    total_amount              NUMERIC(15, 2)     NOT NULL,
    contract_term_years       INTEGER,
    start_date                DATE,
    end_date                  DATE,
    -- Cơ chế gia hạn
    auto_renewal              BOOLEAN                     DEFAULT FALSE,
    renewal_term_years        INTEGER,
    renewal_notice_days       INTEGER                     DEFAULT 30,
    max_renewals              INTEGER,
    renewal_count             INTEGER                     DEFAULT 0,

    -- Điều khoản carbon / quyền lợi
    content                   JSONB, -- Xử lý theo factory pattern (FE)
    harvest_rights            BOOLEAN                     DEFAULT FALSE,
    transfer_allowed          BOOLEAN                     DEFAULT FALSE,

    -- Điều khoản chấm dứt
    early_termination_penalty NUMERIC(15, 2),
    termination_reason        TEXT,
    terminated_at             TIMESTAMPTZ,
    contract_status           CONTRACT_STATUS             DEFAULT 'PENDING',
    payment_date              DATE,
    contract_file_url         VARCHAR(500),
    approved_by               UUID REFERENCES users (id),
    approved_at               TIMESTAMPTZ,
    notes                     TEXT,

    -- Dành cho contract dịch vụ
    service_scope             TEXT,
    kpi_requirements          JSONB,

    created_at                TIMESTAMPTZ                 DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMPTZ                 DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date > start_date)
);

-- CREATE TABLE contract_parties (
--                                   id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--                                   contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
--
--                                   party_role  VARCHAR(50) NOT NULL,
--     -- PROJECT_OWNER, ENTERPRISE, FARMER, PARTNER, VERIFIER...
--
--                                   party_type  PARTY_TYPE NOT NULL,
--                                   user_id     UUID REFERENCES users(id) ON DELETE RESTRICT,
--                                   partner_id  INTEGER REFERENCES partners(id) ON DELETE RESTRICT,
--
--                                   created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
--
--                                   CONSTRAINT check_party_reference CHECK (
--                                       (party_type = 'USER' AND user_id IS NOT NULL AND partner_id IS NULL) OR
--                                       (party_type = 'PARTNER' AND partner_id IS NOT NULL AND user_id IS NULL)
--                                       ),
--
--                                   UNIQUE(contract_id, party_role)
-- );
--
-- CREATE INDEX idx_contract_parties_contract ON contract_parties(contract_id);
-- CREATE INDEX idx_contract_parties_user ON contract_parties(user_id);
-- CREATE INDEX idx_contract_parties_partner ON contract_parties(partner_id);

-- BẢNG QUYỀN SỞ HỮU Oxi(Oxi Ownership)
CREATE TABLE oxi_ownership
(
    id                       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contract_id              INTEGER NOT NULL REFERENCES contracts (id) ON DELETE RESTRICT,
    project_id               INTEGER NOT NULL REFERENCES projects (id) ON DELETE RESTRICT,
    tree_species_id          INTEGER REFERENCES tree_species (id),
    owner_id                 UUID    NOT NULL REFERENCES users (id) ON DELETE RESTRICT,

    -- Thời hạn sở hữu
    ownership_start_date     DATE    NOT NULL,
    ownership_end_date       DATE    NOT NULL,

    -- Quyền lợi
    carbon_credit_percentage NUMERIC(5, 2) DEFAULT 100.00, -- % tín chỉ được hưởng

    -- Status
    status                   VARCHAR(20)   DEFAULT 'ACTIVE',

    -- Tracking
    created_at               TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_ownership_dates CHECK (ownership_end_date > ownership_start_date)
);

-- BẢNG LỊCH SỬ GIA HẠN HỢP ĐỒNG
CREATE TABLE contract_renewals
(
    id                   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    original_contract_id INTEGER NOT NULL REFERENCES contracts (id) ON DELETE CASCADE,
    new_contract_id      INTEGER REFERENCES contracts (id) ON DELETE CASCADE,
    renewal_number       INTEGER NOT NULL,              -- Lần gia hạn thứ mấy
    renewal_term_years   INTEGER NOT NULL,
    old_end_date         DATE    NOT NULL,
    new_start_date       DATE    NOT NULL,
    new_end_date         DATE    NOT NULL,
    renewal_amount       NUMERIC(15, 2),                -- Phí gia hạn
    status               VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    requested_by         UUID REFERENCES users (id),
    requested_at         TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    approved_by          UUID REFERENCES users (id),
    approved_at          TIMESTAMPTZ,
    notes                TEXT,
    created_at           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- BẢNG CHUYỂN NHƯỢNG HỢP ĐỒNG/QUYỀN SỞ HỮU
CREATE TABLE ownership_transfers
(
    id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    -- Chuyển nhượng gì
    contract_id    INTEGER REFERENCES contracts (id),
    ownership_id   INTEGER REFERENCES oxi_ownership (id),
    -- Từ ai sang ai
    from_user_id   UUID NOT NULL REFERENCES users (id),
    to_user_id     UUID NOT NULL REFERENCES users (id),
    -- Số lượng chuyển nhượng
    carbon_credit  NUMERIC(5, 2) DEFAULT 100.00,
    transfer_price NUMERIC(15, 2),
    -- Status
    status         VARCHAR(50)   DEFAULT 'PENDING', -- PENDING, COMPLETED, REJECTED
    transfer_date  DATE,
    approved_by    UUID REFERENCES users (id),
    approved_at    TIMESTAMPTZ,
    notes          TEXT,
    created_at     TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_transfer_reference CHECK (
        (contract_id IS NOT NULL AND ownership_id IS NULL) OR
        (contract_id IS NULL AND ownership_id IS NOT NULL)
        )
);

-- Bảng tín chỉ carbon
CREATE TABLE carbon_credits
(
    id                    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    credit_code           VARCHAR(50) UNIQUE NOT NULL,
    project_id            INTEGER            NOT NULL REFERENCES projects (id) ON DELETE RESTRICT,
    report_year           INTEGER            NOT NULL,
    total_co2_tons        NUMERIC(15, 2)     NOT NULL CHECK (total_co2_tons > 0), -- Tổng CO2 (tấn)
    credits_issued        INTEGER            NOT NULL CHECK (credits_issued > 0), -- Số tín chỉ phát hành
    credits_sold          INTEGER     DEFAULT 0 CHECK (credits_sold >= 0),
    credits_retired       INTEGER     DEFAULT 0 CHECK (credits_retired >= 0),
    credits_available     INTEGER            NOT NULL CHECK (credits_available >= 0),
    price_per_credit      NUMERIC(15, 2),
    credits_status        VARCHAR(50) DEFAULT 'AVAILABLE',
    verification_standard VARCHAR(100),                                           -- VCS, Gold Standard, etc.
    certificate_url       VARCHAR(500),
    issued_by             UUID REFERENCES users (id),
    issued_at             TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at            TIMESTAMPTZ,
    created_at            TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_credits_balance CHECK (credits_sold + credits_retired <= credits_issued)
);

-- BẢNG PHÂN PHỐI TÍN CHỈ CARBON
CREATE TABLE carbon_credit_allocations
(
    id                INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    credit_id         INTEGER       NOT NULL REFERENCES carbon_credits (id) ON DELETE RESTRICT,
    ownership_id      INTEGER       NOT NULL REFERENCES oxi_ownership (id) ON DELETE RESTRICT,
    -- Số lượng tín chỉ được phân bổ
    allocated_credits INTEGER       NOT NULL CHECK (allocated_credits > 0),
    percentage        NUMERIC(5, 2) NOT NULL,          -- % tín chỉ được hưởng
    -- Thông tin người nhận
    owner_id          UUID          NOT NULL REFERENCES users (id),
    -- Status
    status            VARCHAR(50) DEFAULT 'ALLOCATED', -- ALLOCATED, CLAIMED, SOLD, RETIRED
    claimed_at        TIMESTAMPTZ,
    notes             TEXT,
    created_at        TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bảng giao dịch tín chỉ
CREATE TABLE credit_transactions
(
    id                 INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    transaction_code   VARCHAR(50) UNIQUE NOT NULL,
    credit_id          INTEGER            NOT NULL REFERENCES carbon_credits (id) ON DELETE RESTRICT,
    enterprise_id      UUID               NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    quantity           INTEGER            NOT NULL CHECK (quantity > 0),
    unit_price         NUMERIC(15, 2)     NOT NULL,
    total_amount       NUMERIC(15, 2)     NOT NULL,
    transaction_status VARCHAR(50) DEFAULT 'PURCHASED',
    certificate_url    VARCHAR(500),
    retirement_reason  TEXT,
    purchased_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    retired_at         TIMESTAMPTZ,
    created_at         TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bảng lịch sử thanh toán
CREATE TABLE payments
(
    id                    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    payment_code          VARCHAR(50) UNIQUE NOT NULL,
    contract_id           INTEGER REFERENCES contracts (id) ON DELETE RESTRICT,
    credit_transaction_id INTEGER REFERENCES credit_transactions (id) ON DELETE RESTRICT,
    payer_id              UUID               NOT NULL REFERENCES users (id),
    amount                NUMERIC(15, 2)     NOT NULL CHECK (amount > 0),
    payment_method        VARCHAR(50),  -- 'BANK_TRANSFER', 'CREDIT_CARD', 'E_WALLET'
    payment_status        VARCHAR(50) DEFAULT 'PENDING',
    transaction_id        VARCHAR(255), -- ID từ payment gateway
    bank_name             VARCHAR(100),
    account_number        VARCHAR(50),
    paid_at               TIMESTAMPTZ,
    notes                 TEXT,
    created_at            TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_payment_reference CHECK (
        (contract_id IS NOT NULL AND credit_transaction_id IS NULL) OR
        (contract_id IS NULL AND credit_transaction_id IS NOT NULL)
        )
);
