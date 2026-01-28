CREATE
DATABASE capstoneproject;
\c
capstoneproject;

CREATE
EXTENSION IF NOT EXISTS "uuid-ossp";
SELECT *
FROM pg_extension
WHERE extname = 'uuid-ossp';
CREATE TABLE users
(
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      varchar(100) NOT NULL,
    password      VARCHAR(100) NOT NULL,
    fullname      VARCHAR(100)     DEFAULT '',
    phone_number  VARCHAR(10)  NOT NULL,
    email         VARCHAR(100)     DEFAULT '',
    address       VARCHAR(200)     DEFAULT '',
    sex           BOOLEAN          DEFAULT FALSE,
    date_of_birth DATE,
    role          VARCHAR(20) DEFAULT 'USER', -- ADMIN: Quản trị viên | USER: Người dùng (doanh nghiệp/cá nhân) | FARMER: Nông dân
    is_active     BOOLEAN          DEFAULT TRUE,
    created_at    TIMESTAMPTZ      DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ      DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_email_format CHECK
    (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT check_phone_format CHECK
    (phone_number ~ '^[0-9]{10,15}$' OR phone_number IS NULL)
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
    base_carbon_rate       NUMERIC(10, 4) NOT NULL, -- Hệ số k_i (kg CO2/cây/năm) ở điều kiện chuẩn
    description            TEXT,
    image_url              VARCHAR(500),
    created_at             TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMPTZ,
    deleted_at             TIMESTAMPTZ
);

-- Bảng Farm (Khu vực trồng trong dự án)
CREATE TABLE farms
(
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code            VARCHAR(50)    NOT NULL,      -- Mã khu vực (VD: FARM-001)
    name            VARCHAR(255)   NOT NULL,
    description     TEXT,
    -- Vị trí địa lý
    location        VARCHAR(500),                 -- Địa chỉ
    latitude        NUMERIC(10, 8),               -- Vĩ độ: trường này không nên nhập tay thay vào đó sẽ tự động lấy từ API bản đồ khi nhập location
    longitude       NUMERIC(11, 8),               -- Kinh độ: trường này không nên nhập tay thay vào đó sẽ tự động lấy từ API bản đồ khi nhập location
    -- Diện tích
    area            NUMERIC(12, 2) NOT NULL,      -- Tổng diện tích (m²)
    usable_area     NUMERIC(12, 2),               -- Diện tích trồng thực tế (m²)
    -- Thông tin môi trường
    soil_type       VARCHAR(100),                 -- Loại đất
    climate_zone    VARCHAR(100),                 -- Vùng khí hậu
    avg_rainfall    NUMERIC(10, 2),               -- Lượng mưa TB (mm/năm)
    avg_temperature NUMERIC(5, 2),                -- Nhiệt độ TB (°C)
    -- Status
    farm_status     VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, CLOSED
    -- Tracking
    created_by      UUID REFERENCES users (id),
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT unique_farm_code UNIQUE (code),
    CONSTRAINT check_usable_area CHECK (usable_area IS NULL OR usable_area <= area)
);

-- Bảng yếu tố môi trường theo từng khoảng thời gian cho farm (để tự động hóa chỉ số carbon)
CREATE TABLE farm_environment_records
(
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    farm_id         INTEGER NOT NULL REFERENCES farms (id) ON DELETE CASCADE,
    recorded_date   DATE NOT NULL,
    rainfall_mm NUMERIC(6, 3) DEFAULT 1.0,
    temperature_c     NUMERIC(6, 3) DEFAULT 1.0,
    soil_ph     NUMERIC(6, 3) DEFAULT 1.0,
    soil_moisture_percent NUMERIC(5, 2),

    -- Calculated factors
    rainfall_factor NUMERIC(6, 3) DEFAULT 1.0,    -- Hệ số điều chỉnh lượng mưa được tinh toán từ rainfall_mm
    temperature_factor NUMERIC(6, 3) DEFAULT 1.0,   -- Hệ số điều chỉnh nhiệt độ được tính toán từ temperature_c
    soil_factor NUMERIC(6, 3) DEFAULT 1.0,          -- Hệ số điều chỉnh đất được tính toán từ soil_ph và soil_moisture_percent
    overall_factor NUMERIC(6, 3) DEFAULT 1.0,       -- Tích của các hệ số trên

    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(farm_id, recorded_date)
);

-- Bảng dự án
CREATE TABLE projects
(
    id                      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code                    VARCHAR(50) UNIQUE NOT NULL, -- Mã dự án
    name                    VARCHAR(255)       NOT NULL,
    description             TEXT,

    -- Management
    manager_id              UUID           REFERENCES users (id) ON DELETE SET NULL,
    project_status          VARCHAR(20)    DEFAULT 'PLANNING', -- PLANNING, ACTIVE, COMPLETED, CANCELLED

    -- Financials
    total_budget NUMERIC(15, 2),            -- Ngân sách tổng
    actual_cost NUMERIC(15, 2) DEFAULT 0,   -- Chi phí thực tế

    -- Carbon targets (tính từ phases)
    target_co2_kg NUMERIC(15, 2) DEFAULT 0, -- Lượng CO2 đã hấp thụ (kg) (tổng số target của phase)
    actual_co2_kg NUMERIC(15, 2) DEFAULT 0, -- Lượng CO2 đã hấp thụ hiện tại (kg) (tính từ cây)

    -- Tracking
    created_at              TIMESTAMPTZ    DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ    DEFAULT CURRENT_TIMESTAMP
);

-- Bảng vòng đời dự án
CREATE TABLE project_phases
(
    id                     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id             INTEGER     NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    phase_number           INTEGER     NOT NULL,           -- Giai đoạn thứ mấy
    phase_name             VARCHAR(255),
    description            TEXT,

    -- Status
    phase_status           VARCHAR(20) NOT NULL DEFAULT 'PLANNING', --'PLANNING', 'PLANTING', 'GROWING', 'MATURE', 'HARVESTING', 'COMPLETED'

    -- Timeline
    planned_start_date     DATE,
    planned_end_date       DATE,
    actual_start_date      DATE        NOT NULL,
    actual_end_date        DATE,

    -- Financials
    budget NUMERIC(15, 2),                          -- Ngân sách cho giai đoạn này
    actual_cost NUMERIC(15, 2) DEFAULT 0,           -- Chi phí thực tế (tính từ cây)

    -- Carbon
    target_co2_kg NUMERIC(15, 2) DEFAULT 0,         -- Lượng CO2 hướng tới (kg) (tổng số target của phase)
    actual_co2_kg NUMERIC(15, 2) DEFAULT 0,         -- Lượng CO2 đã hấp thụ hiện tại (kg) (tính từ cây)

    -- Tracking
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(project_id, phase_number)
);

CREATE TABLE project_farms (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    UNIQUE(project_id, farm_id)
);

-- Bảng liên kết dự án và đối tác (partner giờ là user)
CREATE TABLE project_partners
(
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    partner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner_role VARCHAR(100) NOT NULL, -- INVESTOR, TECHNICAL_SUPPORT, VERIFIER, etc.
    contribution_amount NUMERIC(15, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, partner_user_id, partner_role)
);

-- Bảng lô cây (thông tin gốc - không thay đổi)
CREATE TABLE tree_batches
(
    id                    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    batch_code            VARCHAR(50) UNIQUE NOT NULL,
    farm_id               INTEGER            NOT NULL REFERENCES farms (id) ON DELETE RESTRICT,
    tree_species_id       INTEGER            NOT NULL REFERENCES tree_species (id) ON DELETE RESTRICT,
    phase_id              INTEGER            REFERENCES project_phases (id) ON DELETE SET NULL,

    -- Planting info (thông tin ban đầu)
    quantity_planted      INTEGER            NOT NULL CHECK (quantity_planted > 0),
    planting_date         DATE               NOT NULL,
    planting_area_m2      NUMERIC(12, 2),

    -- Supplier/Cost info
    supplier_name         VARCHAR(255),    -- Nhà cung cấp cây giống (name_farms): farms
    unit_cost             NUMERIC(15, 2),
    total_cost            NUMERIC(15, 2),  -- unit_cost * quantity_planted

    -- Status
    batch_status          VARCHAR(20)    DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, REMOVED

    -- Tracking
    notes                 TEXT,
    created_by            UUID REFERENCES users (id),
    created_at            TIMESTAMPTZ    DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMPTZ    DEFAULT CURRENT_TIMESTAMP
);

-- Bảng ghi nhận sinh trưởng theo thời gian
-- Current status = record mới nhất (ORDER BY recorded_date DESC LIMIT 1)
CREATE TABLE tree_growth_records
(
    id                     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    batch_id               INTEGER NOT NULL REFERENCES tree_batches (id) ON DELETE CASCADE,
    recorded_date          DATE    NOT NULL,

    -- Tree count
    quantity_alive         INTEGER NOT NULL,  -- quantity_planted - quantity_dead
    quantity_dead          INTEGER DEFAULT 0,

    -- Measurements (trung bình của batch)
    avg_height_cm          NUMERIC(10, 2),
    avg_trunk_diameter_cm  NUMERIC(10, 2),
    avg_canopy_diameter_cm NUMERIC(10, 2),
    health_status          VARCHAR(20) DEFAULT 'HEALTHY', -- HEALTHY, DISEASED, STRESSED

    -- CO2 calculation (tính từ công thức)
    co2_absorbed_kg        NUMERIC(15, 4) DEFAULT 0,
    environment_factor     NUMERIC(6, 3)  DEFAULT 1.0,

    -- Notes
    health_notes           TEXT,

    -- Tracking
    recorded_by            UUID REFERENCES users (id),
    created_at             TIMESTAMPTZ    DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (batch_id, recorded_date)
);

-- View để lấy trạng thái hiện tại của mỗi batch (optional - dùng trong query)
-- CREATE VIEW tree_batches_current_status AS
-- SELECT
--     b.*,
--     r.quantity_alive,
--     r.quantity_dead,
--     r.avg_height_cm,
--     r.avg_trunk_diameter_cm,
--     r.co2_absorbed_kg,
--     r.recorded_date as last_recorded_date
-- FROM tree_batches b
-- LEFT JOIN LATERAL (
--     SELECT * FROM tree_growth_records
--     WHERE batch_id = b.id
--     ORDER BY recorded_date DESC
--     LIMIT 1
-- ) r ON true;

CREATE TABLE contracts
(
    id                       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contract_code            VARCHAR(50) UNIQUE NOT NULL,
    project_id               INTEGER            NOT NULL REFERENCES projects (id) ON DELETE RESTRICT,

    -- Contract type
    contract_type            VARCHAR(50)        NOT NULL, -- OWNERSHIP, INVESTMENT, SERVICE, CREDIT_PURCHASE

    -- Parties
    party_a_id               UUID REFERENCES users (id),  -- User ký hợp đồng với dự án (CREDIT_PURCHASE/INVESTMENT/SERVICE)
    party_b_id               UUID REFERENCES users (id),  -- OWNERSHIP

    -- Financial terms
    total_value              NUMERIC(15, 2)     NOT NULL,   -- Giá trị hợp đồng
    payment_terms            TEXT,

    -- Timeline
    start_date               DATE               NOT NULL,
    end_date                 DATE,
    duration_years           INTEGER,     --- end_date - start_date

    -- Renewal terms
    is_renewable             BOOLEAN     DEFAULT FALSE,
    renewal_terms            TEXT,
    max_renewals             INTEGER,
    current_renewal_count    INTEGER     DEFAULT 0,

    -- Terms & Conditions
    terms_and_conditions     TEXT,
    special_clauses          JSONB,          -- Nếu có

    -- Rights (for OWNERSHIP type)
    carbon_credit_percentage NUMERIC(5, 2),               -- % tín chỉ được hưởng
    harvest_rights           BOOLEAN     DEFAULT FALSE,    -- Quyền thu hoạch (thân gỗ, nông sản)
    transfer_allowed         BOOLEAN     DEFAULT FALSE,    -- Cho phép chuyển nhượng

    -- Status
    contract_status          VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, PENDING, ACTIVE, EXPIRED, TERMINATED

    -- Approval
    approved_by              UUID REFERENCES users (id),
    approved_at              TIMESTAMPTZ,

    -- Termination
    terminated_at            TIMESTAMPTZ,
    termination_reason       TEXT,
    early_termination_fee    NUMERIC(15, 2),

    -- Documents
    contract_file_url        VARCHAR(500),

    -- Tracking
    notes                    TEXT,
    created_at               TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contract_renewals
(
    id                   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    original_contract_id INTEGER NOT NULL REFERENCES contracts (id) ON DELETE CASCADE,
    renewal_number       INTEGER NOT NULL,

    -- New terms
    new_start_date       DATE    NOT NULL,
    new_end_date         DATE    NOT NULL,
    renewal_fee          NUMERIC(15, 2),
    updated_terms        TEXT,

    -- Status
    renewal_status       VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED

    -- Approval
    requested_by         UUID REFERENCES users (id),
    requested_at         TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    approved_by          UUID REFERENCES users (id),
    approved_at          TIMESTAMPTZ,
    notes                TEXT,
    created_at           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contract_transfers
(
    id                  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contract_id         INTEGER       NOT NULL REFERENCES contracts (id) ON DELETE RESTRICT,

    -- Transfer details
    from_user_id        UUID          NOT NULL REFERENCES users (id),
    to_user_id          UUID          NOT NULL REFERENCES users (id),
    transfer_percentage NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    transfer_price      NUMERIC(15, 2),

    -- Status
    transfer_status     VARCHAR(20)            DEFAULT 'PENDING',
    transfer_date       DATE,

    -- Approval
    approved_by         UUID REFERENCES users (id),
    approved_at         TIMESTAMPTZ,

    notes               TEXT,
    created_at          TIMESTAMPTZ            DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE carbon_credits
(
    id                       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    credit_code              VARCHAR(50) UNIQUE NOT NULL,
    project_id               INTEGER            NOT NULL REFERENCES projects (id) ON DELETE RESTRICT,
    origins                  JSONB,
    -- Issuance details
    issuance_year            INTEGER            NOT NULL,
    total_co2_tons           NUMERIC(15, 2)     NOT NULL,
    credits_issued           INTEGER            NOT NULL,     -- 1 credit = 1 ton CO2

    -- Pricing
    base_price_per_credit    NUMERIC(15, 2),
    current_price_per_credit NUMERIC(15, 2),

    -- Status tracking
    credits_available        INTEGER     NOT NULL,
    credits_allocated        INTEGER     DEFAULT 0,
    credits_sold             INTEGER     DEFAULT 0,
    credits_retired          INTEGER     DEFAULT 0,

    credit_status            VARCHAR(20) DEFAULT 'AVAILABLE', -- AVAILABLE, PARTIALLY_SOLD, SOLD_OUT, RETIRED

    -- Verification
    verification_standard    VARCHAR(100),                    -- VCS, Gold Standard, etc.
    verification_date        DATE,
    certificate_url          VARCHAR(500),
    verifier_user_id         UUID REFERENCES users (id),      -- User với role VERIFIER trong dự án, hoặc admin

    -- Expiry
    issued_at                TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at               TIMESTAMPTZ,

    -- Tracking
    issued_by                UUID REFERENCES users (id),
    created_at               TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_credits_balance CHECK (
        credits_allocated + credits_sold + credits_retired <= credits_issued
    )
);

CREATE TABLE credit_allocations
(
    id                    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    credit_id             INTEGER       NOT NULL REFERENCES carbon_credits (id) ON DELETE RESTRICT,
    contract_id           INTEGER       NOT NULL REFERENCES contracts (id) ON DELETE RESTRICT,
    owner_id              UUID          NOT NULL REFERENCES users (id),

    -- Allocation
    allocated_credits     INTEGER       NOT NULL CHECK (allocated_credits > 0),
    allocation_percentage NUMERIC(5, 2) NOT NULL,

    -- Status
    allocation_status     VARCHAR(20) DEFAULT 'ALLOCATED', -- ALLOCATED, CLAIMED, TRANSFERRED, SOLD
    allocated_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    claimed_at            TIMESTAMPTZ,      -- Khi owner claim tín chỉ

    notes                 TEXT,
    created_at            TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE credit_transactions
(
    id                         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    transaction_code           VARCHAR(50) UNIQUE NOT NULL,
    credit_id                  INTEGER            NOT NULL REFERENCES carbon_credits (id) ON DELETE RESTRICT,
    purchase_details           JSONB,
    -- Parties
    seller_id                  UUID REFERENCES users (id),
    buyer_id                   UUID               NOT NULL REFERENCES users (id),

    -- Transaction details
    quantity                   INTEGER            NOT NULL CHECK (quantity > 0),
    unit_price                 NUMERIC(15, 2)     NOT NULL,
    total_amount               NUMERIC(15, 2)     NOT NULL,

    -- Type
    transaction_type           VARCHAR(20)        NOT NULL, -- PURCHASE, RETIREMENT

    -- Status
    transaction_status         VARCHAR(20) DEFAULT 'COMPLETED', -- COMPLETED, PENDING, PURCHASED, RETIRED, CANCELLED

    -- Retirement (if applicable)
    retirement_reason          TEXT,
    retirement_certificate_url VARCHAR(500),

    -- Dates
    transaction_date           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    retired_at                 TIMESTAMPTZ,

    notes                      TEXT,
    created_at                 TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments
(
    id                    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    payment_code          VARCHAR(50) UNIQUE NOT NULL,

    -- Reference (either contract or credit transaction)
    contract_id           INTEGER REFERENCES contracts (id),
    credit_transaction_id INTEGER REFERENCES credit_transactions (id),

    -- Parties
    payer_id              UUID NOT NULL REFERENCES users (id),
    payee_id              UUID REFERENCES users (id),

    -- Amount
    amount                NUMERIC(15, 2)     NOT NULL CHECK (amount > 0),
    currency              VARCHAR(3)  DEFAULT 'VND',

    -- Payment method
    payment_method        VARCHAR(50)        NOT NULL,   -- VNPAY, BANK_TRANSFER, CREDIT_CARD, E_WALLET
    payment_gateway       VARCHAR(50),                   -- VNPAY, MOMO, ZALOPAY...
    transaction_ref       VARCHAR(255),                  -- Mã giao dịch từ cổng thanh toán

    -- VNPay specific
    vnp_txn_ref           VARCHAR(100),                  -- Mã đơn hàng VNPay
    vnp_transaction_no    VARCHAR(100),                  -- Mã giao dịch VNPay
    vnp_response_code     VARCHAR(10),                   -- Mã phản hồi VNPay
    vnp_bank_code         VARCHAR(50),                   -- Mã ngân hàng

    -- Bank details (if applicable)
    bank_name             VARCHAR(100),
    account_number        VARCHAR(50),
    account_holder        VARCHAR(255),

    -- Status
    payment_status        VARCHAR(20) DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED, REFUNDED, CANCELLED

    -- Dates
    payment_date          TIMESTAMPTZ,
    completed_at          TIMESTAMPTZ,

    notes                 TEXT,
    created_at            TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_payment_reference CHECK (
        (contract_id IS NOT NULL AND credit_transaction_id IS NULL) OR
        (contract_id IS NULL AND credit_transaction_id IS NOT NULL) OR
        (contract_id IS NULL AND credit_transaction_id IS NULL) -- Cho phép payment độc lập
        )
);

-- =============================================
-- NOTIFICATIONS (Real-time với WebSocket)
-- =============================================
CREATE TABLE notifications
(
    id                INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- Recipient
    user_id           UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    -- Content
    title             VARCHAR(255) NOT NULL,
    message           TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- CONTRACT_SUBMITTED, CONTRACT_APPROVED, CONTRACT_REJECTED,
                                            -- RENEWAL_REQUESTED, RENEWAL_APPROVED, TRANSFER_REQUESTED,
                                            -- PAYMENT_RECEIVED, CREDIT_ALLOCATED, SYSTEM

    -- Reference (optional - để link đến entity liên quan)
    reference_type    VARCHAR(50),          -- CONTRACT, PAYMENT, CREDIT, PROJECT...
    reference_id      INTEGER,

    -- Status
    is_read           BOOLEAN DEFAULT FALSE,
    read_at           TIMESTAMPTZ,

    -- Metadata
    metadata          JSONB,                -- Thông tin bổ sung (VD: contract_code, amount...)

    -- Tracking
    created_at        TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- =============================================
-- AI CHATBOT
-- =============================================

-- Bảng lưu phiên chat
CREATE TABLE chat_sessions
(
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_code    VARCHAR(50) UNIQUE NOT NULL,
    user_id         UUID REFERENCES users (id) ON DELETE SET NULL, -- NULL nếu là guest

    -- Session info
    session_status  VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, CLOSED, EXPIRED

    -- Context (để AI nhớ context)
    context_summary TEXT,                         -- Tóm tắt context của cuộc hội thoại

    -- Tracking
    started_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    closed_at       TIMESTAMPTZ,

    -- Metadata
    user_agent      VARCHAR(500),
    ip_address      VARCHAR(50)
);

-- Bảng lưu tin nhắn chat
CREATE TABLE chat_messages
(
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_id      INTEGER NOT NULL REFERENCES chat_sessions (id) ON DELETE CASCADE,

    -- Message
    role            VARCHAR(20) NOT NULL,         -- USER, ASSISTANT, SYSTEM
    content         TEXT NOT NULL,

    -- AI specific
    model_used      VARCHAR(100),                 -- gpt-4, gpt-3.5-turbo, gemini...
    tokens_used     INTEGER,
    response_time_ms INTEGER,

    -- Reference (nếu AI trả lời về project/credit cụ thể)
    referenced_projects JSONB,                    -- [{id: 1, name: "...", score: 0.95}]
    referenced_credits  JSONB,

    -- Feedback
    is_helpful      BOOLEAN,                      -- User đánh giá câu trả lời
    feedback_note   TEXT,

    -- Tracking
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, created_at);

-- Bảng FAQ (để AI tham khảo)
CREATE TABLE faqs
(
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category        VARCHAR(100) NOT NULL,        -- PROJECT, CREDIT, PAYMENT, CONTRACT, GENERAL
    question        TEXT NOT NULL,
    answer          TEXT NOT NULL,
    keywords        TEXT[],                       -- Từ khóa để tìm kiếm
    priority        INTEGER DEFAULT 0,            -- Độ ưu tiên hiển thị
    is_active       BOOLEAN DEFAULT TRUE,
    view_count      INTEGER DEFAULT 0,
    helpful_count   INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_faqs_category ON faqs(category) WHERE is_active = TRUE;
CREATE INDEX idx_faqs_keywords ON faqs USING GIN(keywords) WHERE is_active = TRUE;

