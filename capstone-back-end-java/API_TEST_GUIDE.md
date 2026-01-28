# 📘 Complete API Test Guide - Carbon Credit Management System

**Base URL:** `http://localhost:8088`

---

## ⚠️ QUAN TRỌNG: Setup ADMIN Account

**Trước khi test**, bạn cần tạo ADMIN account bằng cách chạy file:
```bash
psql -U postgres -d capstoneproject -f create-admin-account.sql
```

Hoặc copy nội dung file `create-admin-account.sql` và chạy trực tiếp trong PostgreSQL.

**Mật khẩu mặc định:**
- Admin: `admin` / `Admin123!`
- User: `user01` / `Admin123!`

---

## 🔐 1. Authentication (`/api/auth`)

### Register
```
POST /api/auth/register
```
```json
{
  "username": "user01",
  "password": "Password123!",
  "fullname": "Nguyen Van A",
  "email": "user01@example.com",
  "phoneNumber": "0912345678",
  "address": "123 Le Loi, Ho Chi Minh City",
  "dateOfBirth": "1995-05-20",
  "sex": true,
  "role": "USER"
}
```
*(Valid roles: `USER`, `FARMER`. `ADMIN` cannot be registered here)*

### Login
```
POST /api/auth/login
```
```json
{
  "username": "user01",
  "password": "Password123!"
}
```

### Forgot Password (Send OTP)
```
POST /api/auth/forgot-password
```
```json
{
  "email": "user01@example.com"
}
```
**Note:** A 6-digit OTP will be sent to the email and stored in server memory for 10 minutes.

### Verify OTP & Reset Password
```
POST /api/auth/verify-otp
```
```json
{
  "email": "user01@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123!"
}
```
**Note:** The OTP will be validated server-side. After successful verification, the password will be reset and the OTP will be removed from storage.

### Logout
```
POST /api/auth/logout
Headers: Authorization: Bearer {token}
```

---

## 👤 2. User Management

### [ADMIN] Get All Users
```
GET /api/admin/users?page=0&size=10&role=USER&isActive=true&keyword=Nguyen
```

### [ADMIN] Create User
```
POST /api/admin/users?role=USER
```
```json
{
  "username": "newuser",
  "password": "Password123!",
  "fullname": "New User",
  "email": "newuser@example.com",
  "phoneNumber": "0987654321"
}
```

### [ADMIN] Update User Role
```
PUT /api/admin/users/{userId}/role?role=ADMIN
```
*(Query param `role` is required. Values: `ADMIN`, `USER`)*

### [ADMIN] Update User Status (Lock/Unlock)
```
PUT /api/admin/users/{userId}/status?isActive=false
```
*(Query param `isActive` is required. Values: `true` (active), `false` (locked))*

### [USER] Get My Profile
```
GET /api/user/profile
```

### [USER] Update My Profile
```
PUT /api/user/profile
```
```json
{
  "fullname": "My New Name",
  "phoneNumber": "0912345678",
  "address": "New Address"
}
```

### [USER] Change Password
```
POST /api/user/change-password
```
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

---

## 📁 3. Project Management (`/api/projects`)

### [ADMIN/USER] Create Project
```
POST /api/projects/create-projects
```
```json
{
  "name": "Central Highlands Reforestation",
  "description": "Planting indigenous trees in Dak Lak.",
  "phases": [
    {
      "phaseNumber": 1,
      "phaseName": "Phase 1: Nursery Preparation",
      "description": "Growing saplings",
      "phaseStatus": "PLANNING",
      "plannedStartDate": "2026-06-01",
      "plannedEndDate": "2026-12-31",
      "actualStartDate": "2026-06-01",
      "budget": 150000.00,
      "targetCo2Kg": 50000.00
    }
  ]
}
```

### Get My Projects (USER) / All Projects (ADMIN)
```
GET /api/projects?page=0&size=10&sortBy=createdAt&sortDir=desc
```

### Search Projects
```
GET /api/projects/search?keyword=forest&page=0&size=10
```

### Get Project by ID
```
GET /api/projects/{id}
```

### [ADMIN/USER] Update Project
```
PUT /api/projects/{id}
```
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "projectStatus": "ACTIVE"
}
```

### [ADMIN/USER] Delete Project
```
DELETE /api/projects/{id}
```

### [ADMIN/USER] Add Phase to Project
```
POST /api/projects/{projectId}/phases
```
```json
{
  "phaseNumber": 2,
  "phaseName": "Phase 2: Planting",
  "description": "Main planting phase",
  "phaseStatus": "PLANNING",
  "plannedStartDate": "2027-01-01",
  "plannedEndDate": "2027-06-30",
  "budget": 200000.00,
  "targetCo2Kg": 100000.00
}
```

### Get Project Phases
```
GET /api/projects/{projectId}/phases
```

### [ADMIN/USER] Update Project Phase
```
PUT /api/projects/{projectId}/phases/{phaseId}
```

### [ADMIN/USER] Delete Project Phase
```
DELETE /api/projects/{projectId}/phases/{phaseId}
```

### [ADMIN/USER] Recalculate Project Stats
*   **Recalculates budget and CO2 totals from phases**
```
POST /api/projects/{projectId}/recalculate
```

### [ADMIN] Recalculate All Projects
```
POST /api/projects/recalculate-all
```


### [ADMIN] Add Partner to Project
```
POST /api/projects/{projectId}/partners
```
```json
{
  "partnerUserId": "uuid-of-partner-user",
  "partnerRole": "INVESTOR",
  "contributionAmount": 100000.00,
  "notes": "Main investor for Phase 1"
}
```
> **Valid partnerRole values:** `INVESTOR`, `TECHNICAL_PARTNER`, `LAND_OWNER`, `VERIFIER`, `SPONSOR`, `CONSULTANT`, `GOVERNMENT`, `NGO`, `OTHER`

### [ADMIN] Remove Partner from Project
```
DELETE /api/projects/{projectId}/partners/{partnerUserId}
```

---

## 🚜 4. Farm Management (`/api/farms`)

### [ADMIN/FARMER] Create Farm
```
POST /api/farms
```
```json
{
  "name": "Dak Lak Highlands Farm",
  "description": "Main farm in central highlands",
  "location": "Buon Ma Thuot, Dak Lak",
  "area": 250.0,
  "usableArea": 230.0,
  "farmStatus": "ACTIVE"
}
```
*   **Note:** Latitude and longitude are **automatically fetched** based on the `location` address string (via Nominatim API) and cannot be entered manually.
*   **Note:** Environmental data (`soilType`, `climateZone`, `avgRainfall`, `avgTemperature`) are **automatically fetched** from climate APIs based on location coordinates.

### Get All Farms
```
GET /api/farms?page=0&size=10
```

### [FARMER] Get My Farms
```
GET /api/farms/my-farms?page=0&size=10
```

### Get Farm by ID
```
GET /api/farms/{id}
```

### [ADMIN/FARMER] Update Farm
```
PUT /api/farms/{id}
```
*   **Note:** Farmers can only update farms they created.

### [ADMIN/FARMER] Delete Farm
```
DELETE /api/farms/{id}
```
*   **Note:** Farmers can only delete farms they created.

### Weather Data Integration
*   The system automatically triggers a weather data sync when a farm is updated or when specific environmental records are created.
*   Uses **Open-Meteo API** to fetch real-time temperature, humidity, and precipitation based on the farm's `latitude` and `longitude`.

---

## 🌳 5. Tree Species (`/api/tree-species`)

### [ADMIN] Create Tree Species
```
POST /api/tree-species
```
```json
{
  "name": "Keo Lai",
  "scientificName": "Acacia hybrid",
  "baseCarbonRate": 15.5,
  "description": "Fast-growing hybrid acacia"
}
```

### Get All Tree Species (ADMIN/FARMER/USER)
```
GET /api/tree-species?page=0&size=10
```

### [ADMIN] Update Tree Species
```
PUT /api/tree-species/{id}
```

### [ADMIN] Delete Tree Species
```
DELETE /api/tree-species/{id}
```


### [NEW] Carbon Sequestration Calculator
```
POST /api/tree-species/calculator
```
```json
{
  "treeSpeciesId": 1,
  "quantity": 1000,
  "years": 10,
  "environmentFactor": 1.0
}
```
*   **Response:** Provides a detailed yearly breakdown and total estimated CO2 (Tons) and potential Carbon Credits.

---

## 🌱 6. Tree Batches (`/api/tree-batches`)

### [ADMIN/FARMER] Create Tree Batch
```
POST /api/tree-batches
```
```json
{
  "farmId": 1,
  "treeSpeciesId": 1,
  "phaseId": 1,
  "quantityPlanted": 10000,
  "plantingDate": "2026-07-01",
  "plantingAreaM2": 500.0,
  "supplierName": "Local Nursery",
  "unitCost": 3.5,
  "batchStatus": "ACTIVE",
  "notes": "First batch of Keo Lai"
}
```

### Get All Tree Batches
```
GET /api/tree-batches?page=0&size=10
```

### [USER] Get My Assigned Tree Batches (via project)
```
GET /api/user/allocations?page=0&size=10
```

---

## 📈 7. Tree Growth Records (`/api/tree-growth-records`)

### [ADMIN/FARMER] Create Growth Record
```
POST /api/tree-growth-records
```
```json
{
  "batchId": 1,
  "recordedDate": "2026-12-31",
  "quantityDead": 50,
  "avgHeightCm": 150.0,
  "avgTrunkDiameterCm": 5.0,
  "avgCanopyDiameterCm": 80.0,
  "healthStatus": "HEALTHY",
  "healthNotes": "Trees growing well"
}
```

### [ADMIN] Calculate CO2 for Record
```
POST /api/tree-growth-records/{id}/calculate-co2
```

### Get CO2 Summary by Batch
```
GET /api/tree-growth-records/batch/{batchId}/total-co2
```

### [NEW] Tree Health Alerts (WebSocket)
*   When a record is created with `healthStatus` as **UNHEALTHY** or **STRESSED**, a real-time notification is sent via:
    *   **Topic:** `/topic/alerts` (Admins)
    *   **User Queue:** `/user/queue/notifications` (Farmer)

---

## 📜 8. Contracts (`/api/contracts`)

### [USER] Create Contract
```
POST /api/contracts
```
```json
{
  "projectId": 1,
  "contractType": "OWNERSHIP",
  "unitPrice": 100.0,
  "totalAmount": 25000.0,
  "startDate": "2026-01-01",
  "endDate": "2031-01-01",
  "contractTermYears": 5,
  "autoRenewal": true,
  "maxRenewals": 2,
  "transferAllowed": true,
  "harvestRights": true
}
```
> **Valid contractType values:** `OWNERSHIP`, `INVESTMENT`, `SERVICE`, `CREDIT_PURCHASE`

### [ADMIN] Get All Contracts
```
GET /api/contracts?page=0&size=10
```

### [USER] Get My Contracts
```
GET /api/contracts/my-contracts?page=0&size=10
```

### [ADMIN] Approve Contract (WebSocket enabled)
```
POST /api/contracts/{id}/approve
```
```json
{
  "notes": "Documents verified successfully"
}
```

### [ADMIN] Reject Contract
```
POST /api/contracts/{id}/reject?reason=Missing%20documentation
```

### [ADMIN] Terminate Contract
```
POST /api/contracts/{id}/terminate
```
```json
{
  "reason": "Breach of contract terms",
  "earlyTerminationFee": 5000.0
}
```

### [USER] Request Renewal
```
POST /api/contracts/renewals
```
```json
{
  "contractId": 1,
  "newStartDate": "2031-01-02",
  "newEndDate": "2036-01-01",
  "renewalFee": 5000.0,
  "updatedTerms": "Extended for 5 more years"
}
```

### [ADMIN] Approve Renewal
```
POST /api/contracts/renewals/{renewalId}/approve
```
```json
{
  "notes": "Renewal approved"
}
```

---

## 🔄 9. Contract Transfers (`/api/contract-transfers`)

### [USER] Create Transfer Request
```
POST /api/contract-transfers
```
```json
{
  "contractId": 1,
  "toUserId": "uuid-of-recipient",
  "transferPercentage": 100.0,
  "transferPrice": 28000.0,
  "notes": "Transferring due to business merger"
}
```

### [ADMIN] Approve Transfer
```
POST /api/contract-transfers/{id}/approve
```
```json
{
  "notes": "Transfer approved"
}
```

---

## 💎 10. Carbon Credits (`/api/carbon-credits`)

### [ADMIN] Mint Credits
```
POST /api/carbon-credits
```
```json
{
  "projectId": 1,
  "issuanceYear": 2026,
  "totalCo2Tons": 500.0,
  "creditsIssued": 500,
  "basePricePerCredit": 18.5,
  "currentPricePerCredit": 18.5,
  "verificationStandard": "VCS",
  "origins": [
    { "farmId": 1, "batchId": 1, "quantity": 300 },
    { "farmId": 2, "batchId": 5, "quantity": 200 }
  ]
}
```

### [ADMIN] Verify Credits
```
POST /api/carbon-credits/{id}/verify
```

### Get Available Credits
```
GET /api/carbon-credits?status=AVAILABLE&page=0&size=10
```

### [USER] Purchase Credits
```
POST /api/carbon-credits/purchase
```
```json
{
  "creditId": 1,
  "quantity": 100
}
```

### [USER] Retire Credits
```
POST /api/carbon-credits/retire
```
```json
{
  "creditId": 1,
  "quantity": 50,
  "reason": "Offsetting 2026 annual carbon footprint"
}
```

### Get Credit Summary
```
GET /api/carbon-credits/summary
```

### [NEW] User Specific Credit Info
```
GET /api/carbon-credits/my-balance
```
*   **Returns:** Total credits active in the user's wallet.

```
GET /api/carbon-credits/my-allocations
```
*   **Returns:** List of credits allocated through projects/contracts.

```
GET /api/carbon-credits/my-transactions
```
*   **Returns:** History of purchases and retirements.

---

## 💳 11. Payments (`/api/payments`)

### [USER] Create VNPay Payment
```
POST /api/payments/vnpay/create-payment?amount=5000000&bankCode=NCB&orderInfo=TestPayment
```

### VNPay Return Callback
```
GET /api/payments/vnpay-return?vnp_TxnRef=xxx&vnp_ResponseCode=00&...
```

### VNPay IPN (Server-to-Server)
```
GET /api/payments/vnpay-ipn?...
```

### [USER] Get My Payment History
```
GET /api/payments/my-payments?page=0&size=10
```

---

## 💬 12. AI Chatbot (`/api/chat`)

### Create Session
```
POST /api/chat/sessions
```

### Send Message
```
POST /api/chat/sessions/{sessionCode}/messages
```
```json
{
  "content": "Tell me about reforestation projects"
}
```

### Get Session Messages
```
GET /api/chat/sessions/{sessionCode}/messages
```

---

## 📊 13. Dashboard & Reports

### [ADMIN] Admin Dashboard
```
GET /api/dashboard/admin/summary
```

### [USER] User Dashboard
```
GET /api/user/dashboard
```

### [ADMIN] Export CO2 Report (Excel)
```
GET /api/reports/co2/export/excel?startDate=2026-01-01&endDate=2026-12-31
```

### [ADMIN] Export CO2 Report (PDF)
```
GET /api/reports/co2/export/pdf?projectId=1
```

---

## 🔔 14. Notifications (`/api/notifications`)

### Get My Notifications
```
GET /api/notifications?page=0&size=10
```

### Mark as Read
```
POST /api/notifications/{id}/read
```

### Mark All as Read
```
POST /api/notifications/read-all
```

---

## 🔑 Authorization Notes

- All endpoints except `/api/auth/**` and `/api/projects/public` require JWT Bearer token
- **ADMIN** role required for: Create/Update/Delete operations, Approvals, Reports
- **USER** role can: View public data, Create contracts, Purchase/Retire credits

---

## 🌐 WebSocket Endpoints

### Contract Approval Notifications
```
ws://localhost:8080/ws/approvals
Topic: /topic/approvals
User Queue: /user/queue/notifications
```

### Real-time Notifications
```
ws://localhost:8080/ws/notifications
Topic: /user/queue/notifications
```
