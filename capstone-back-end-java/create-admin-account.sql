-- =====================================================
-- Script để tạo ADMIN account đầu tiên
-- =====================================================

-- Xóa admin cũ nếu có (optional)
DELETE FROM users WHERE username = 'admin';

-- Tạo ADMIN account
-- Username: admin
-- Password: Admin123!
INSERT INTO users (
    id, 
    username, 
    password, 
    fullname, 
    phone_number, 
    email, 
    role, 
    is_active, 
    created_at, 
    updated_at
)
VALUES (
    gen_random_uuid(),
    'admin',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- BCrypt hash của "Admin123!"
    'System Administrator',
    '0900000000',
    'admin@example.com',
    'ADMIN',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Kiểm tra kết quả
SELECT id, username, fullname, role, is_active 
FROM users 
WHERE username = 'admin';

-- =====================================================
-- Hướng dẫn sử dụng:
-- =====================================================
-- 1. Kết nối vào PostgreSQL database
-- 2. Chọn database: \c capstoneproject
-- 3. Chạy script này
-- 4. Login với:
--    - Username: admin
--    - Password: Admin123!
-- =====================================================

-- TẠO THÊM USER THƯỜNG ĐỂ TEST (Optional)
INSERT INTO users (
    id, 
    username, 
    password, 
    fullname, 
    phone_number, 
    email, 
    role, 
    is_active, 
    created_at, 
    updated_at
)
VALUES (
    gen_random_uuid(),
    'user01',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- Password: Admin123!
    'Test User',
    '0912345678',
    'user01@example.com',
    'USER',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

SELECT * FROM users ORDER BY created_at DESC;
