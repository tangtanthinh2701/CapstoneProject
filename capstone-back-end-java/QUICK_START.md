# 🚀 Quick Start Guide - Khắc phục lỗi 403 Forbidden

## ❌ Vấn đề: 
```json
{
    "status": 403,
    "error": "Forbidden",
    "message": "Forbidden",
    "path": "/api/admin/users"
}
```

## ✅ Nguyên nhân:
- Khi **register**, user mặc định có role `USER` (không phải `ADMIN`)
- Endpoint `/api/admin/**` chỉ cho phép role `ADMIN` truy cập
- Bạn cần tạo ADMIN account trước khi test

## 🔧 Giải pháp (Chọn 1 trong 2):

### **Cách 1: Chạy SQL Script (KHUYẾN NGHỊ)**

1. Mở terminal/command prompt
2. Chạy lệnh:
```bash
psql -U postgres -d capstoneproject -f create-admin-account.sql
```

3. Nếu lệnh trên không chạy được, copy toàn bộ nội dung file `create-admin-account.sql` và paste vào PostgreSQL client

### **Cách 2: Chạy trực tiếp trong PostgreSQL**

```sql
-- Kết nối database
\c capstoneproject

-- Tạo ADMIN
INSERT INTO users (id, username, password, fullname, phone_number, email, role, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'System Administrator',
  '0900000000',
  'admin@example.com',
  'ADMIN',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
```

## 🎯 Sau khi tạo ADMIN:

1. **Login với ADMIN account:**
```json
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin123!"
}
```

2. **Copy JWT token từ response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "...",
  "role": "ADMIN"  // ← Kiểm tra role phải là ADMIN
}
```

3. **Gọi API với token:**
```http
GET http://localhost:8080/api/admin/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ✅ Kết quả thành công:
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [...]
}
```

## 📝 Lưu ý:
- ✅ **ADMIN** → Có quyền truy cập `/api/admin/**`
- ❌ **USER** → KHÔNG có quyền truy cập `/api/admin/**` (sẽ bị 403)
- ✅ **USER** → Có quyền truy cập `/api/user/**`, `/api/projects/public`, etc.

## 🔐 Accounts đã tạo sẵn:
| Username | Password | Role | Mô tả |
|----------|----------|------|-------|
| `admin` | `Admin123!` | ADMIN | Quản trị viên |
| `user01` | `Admin123!` | USER | Người dùng thường |
