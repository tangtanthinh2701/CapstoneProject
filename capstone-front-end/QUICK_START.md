# 🚀 QUICK START GUIDE

## Hướng dẫn chạy và test hệ thống

### Bước 1: Kiểm tra Backend

Đảm bảo backend đang chạy tại `http://localhost:8088`

```bash
# Test backend health
curl http://localhost:8088/api/health
```

### Bước 2: Cài đặt & Chạy Frontend

```bash
cd D:\CapstoneProject\capstone-front-end

# Install dependencies (nếu chưa)
npm install

# Start dev server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173` (hoặc port khác)

### Bước 3: Test Login

#### Test với ADMIN account:
```
URL: http://localhost:5173/login
Username: admin
Password: admin123
```

**Expected:**
- ✅ Login thành công
- ✅ Token được lưu vào localStorage
- ✅ Redirect đến `/dashboard`
- ✅ Dashboard hiển thị stats của ADMIN (total users, projects, contracts...)

#### Test với USER account:
```
Username: user1
Password: user123
```

**Expected:**
- ✅ Login thành công
- ✅ Redirect đến `/home`
- ✅ Dashboard hiển thị thông tin cá nhân

### Bước 4: Kiểm tra localStorage

Sau khi login, mở DevTools → Application → Local Storage:

```javascript
// Expected keys:
token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
userId: "uuid-string"
username: "admin" hoặc "user1"
role: "ADMIN" hoặc "USER"
fullname: "..." (optional)
email: "..." (optional)
```

### Bước 5: Test API Calls

Mở DevTools → Network tab và xem các API calls:

**ADMIN Dashboard:**
```
GET http://localhost:8088/api/dashboard/admin/summary
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Expected Response:
{
  "success": true,
  "data": {
    "totalUsers": 10,
    "totalProjects": 5,
    "totalContracts": 20,
    ...
  }
}
```

**USER Dashboard:**
```
GET http://localhost:8088/api/dashboard/my-dashboard
Headers:
  Authorization: Bearer {token}
```

### Bước 6: Test Logout

Click logout button

**Expected:**
- ✅ localStorage được clear
- ✅ Redirect đến `/login`
- ✅ Không thể access protected routes

### Bước 7: Test Role-based Access

**Scenario 1:** Login as USER, try to access `/dashboard`
```
Expected: Should see USER dashboard, not ADMIN dashboard
```

**Scenario 2:** Login as ADMIN, access `/dashboard`
```
Expected: Should see ADMIN dashboard with full statistics
```

## 🧪 API Testing với Postman

### 1. Login
```http
POST http://localhost:8088/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "userId": "uuid",
    "username": "admin",
    "role": "ADMIN"
  },
  "message": "Dang nhap thanh cong"
}
```

Copy token để dùng cho các request khác.

### 2. Get Admin Dashboard
```http
GET http://localhost:8088/api/dashboard/admin/summary
Authorization: Bearer {token}
```

### 3. Get Public Projects
```http
GET http://localhost:8088/api/projects/public?page=0&size=10
Authorization: Bearer {token}
```

### 4. Create Project (ADMIN only)
```http
POST http://localhost:8088/api/projects/create-projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectName": "Du an test",
  "description": "Mo ta du an test",
  "location": "Ha Noi",
  "totalAreaHa": 100,
  "startDate": "2026-01-22",
  "expectedEndDate": "2027-01-22",
  "isPublic": true,
  "phases": [
    {
      "phaseOrder": 1,
      "phaseName": "Giai doan 1",
      "description": "Chuẩn bi",
      "phaseStatus": "NOT_STARTED",
      "plannedStartDate": "2026-01-22",
      "plannedEndDate": "2026-06-22",
      "targetCo2Kg": 1000
    }
  ]
}
```

### 5. Get Available Carbon Credits
```http
GET http://localhost:8088/api/carbon-credits/available?page=0&size=10
Authorization: Bearer {token}
```

### 6. Purchase Carbon Credits (USER)
```http
POST http://localhost:8088/api/carbon-credits/purchase
Authorization: Bearer {token}
Content-Type: application/json

{
  "creditId": 1,
  "quantity": 10,
  "notes": "Mua 10 tin chi de bu tru CO2"
}
```

## 🔍 Troubleshooting

### Lỗi: "Token khong ton tai"
**Nguyên nhân:** Chưa login hoặc token đã expired
**Giải pháp:** Login lại

### Lỗi: "Network Error" hoặc "Failed to fetch"
**Nguyên nhân:** Backend không chạy hoặc CORS issue
**Giải pháp:** 
1. Check backend running: `http://localhost:8088`
2. Check CORS settings trong backend
3. Check baseUrl trong `src/utils/apiClient.ts`

### Lỗi: "Chi admin moi co quyen..."
**Nguyên nhân:** USER đang cố gọi ADMIN API
**Giải pháp:** Đảm bảo role đúng hoặc không hiển thị feature cho USER

### Dashboard trống
**Nguyên nhân:** Backend chưa có data hoặc API response khác format
**Giải pháp:**
1. Check API response trong Network tab
2. Verify data structure match với frontend expectations
3. Add mock data nếu cần

### Lỗi encoding (chữ lỗi font)
**Nguyên nhân:** File chưa được sửa
**Giải pháp:** Chạy script `python fix_simple.py`

## 📋 Checklist Testing

### Authentication ✅
- [x] Login ADMIN → Dashboard ADMIN
- [x] Login USER → Home/Dashboard USER
- [x] Logout → Clear data, redirect
- [x] Token saved to localStorage
- [x] Remember me works

### Dashboard ✅
- [x] ADMIN dashboard shows system stats
- [x] USER dashboard shows personal data
- [x] Loading state works
- [x] Error handling works

### API Integration ✅
- [x] All API calls use new structure
- [x] Auth headers auto added
- [x] 401 errors auto redirect
- [x] Response format consistent

### Next Testing (Cần làm)
- [ ] Project CRUD operations
- [ ] Contract flow (create → submit → approve/reject)
- [ ] Carbon credit purchase flow
- [ ] VNPay payment integration
- [ ] Notifications
- [ ] WebSocket real-time updates

## 🎯 Development Workflow

### Khi cập nhật thêm components:

1. **Read API specification** từ FINAL_REPORT.md
2. **Import appropriate API functions** từ models/*.api.ts
3. **Check role requirements** - ADMIN or USER or Both
4. **Implement UI** với role-based rendering
5. **Test thoroughly**

### Example: Cập nhật ProjectPage

```typescript
import { useState, useEffect } from 'react';
import { isAdmin } from '../../utils/apiClient';
import { getPublicProjects, createProject } from '../../models/project.api';

export default function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const userRole = localStorage.getItem('role');
  
  useEffect(() => {
    loadProjects();
  }, []);
  
  const loadProjects = async () => {
    const response = await getPublicProjects(0, 10);
    setProjects(response.data);
  };
  
  const handleCreate = async (data) => {
    if (!isAdmin()) {
      alert('Chi admin moi co quyen tao du an');
      return;
    }
    await createProject(data);
    loadProjects(); // Reload
  };
  
  return (
    <div>
      {/* Project list */}
      
      {/* Show create button only for ADMIN */}
      {isAdmin() && (
        <button onClick={() => setShowCreateModal(true)}>
          Tao du an moi
        </button>
      )}
    </div>
  );
}
```

## 📞 Support

Nếu gặp vấn đề:
1. Check FINAL_REPORT.md cho API documentation
2. Check console log trong browser DevTools
3. Check Network tab cho API responses
4. Verify backend is running và có data

---

**Happy coding! 🚀**

