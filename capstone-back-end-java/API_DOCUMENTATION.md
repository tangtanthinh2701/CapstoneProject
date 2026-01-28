# API DOCUMENTATION - CARBON CREDIT MARKETPLACE
## Compliance Carbon Market (ETS + Carbon Offsetting)

**Base URL:** `http://localhost:8088/api`  
**API Version:** 1.0  
**Last Updated:** January 27, 2026

---

## 📋 TABLE OF CONTENTS

1. [Authentication APIs](#1-authentication-apis)
2. [Farm Management APIs](#2-farm-management-apis)
3. [Project Management APIs](#3-project-management-apis)
4. [Tree Batch APIs](#4-tree-batch-apis)
5. [Tree Growth Record APIs](#5-tree-growth-record-apis)
6. [Carbon Credit APIs](#6-carbon-credit-apis)
7. [Contract APIs](#7-contract-apis)
8. [Payment APIs](#8-payment-apis)
9. [Notification APIs](#9-notification-apis)
10. [AI Chatbot APIs](#10-ai-chatbot-apis)

---

## 🔐 AUTHENTICATION

### Headers Required
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

---

## 1. AUTHENTICATION APIs

### 1.1. Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "farmer_john",
  "password": "Password@123",
  "fullname": "Nguyễn Văn A",
  "email": "john@example.com",
  "phoneNumber": "0912345678",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "sex": true,
  "dateOfBirth": "1990-05-15",
  "role": "FARMER"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "farmer_john",
    "fullname": "Nguyễn Văn A",
    "role": "FARMER",
    "isActive": true,
    "createdAt": "2026-01-27T10:00:00Z"
  }
}
```

### 1.2. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "username": "farmer_john",
  "password": "Password@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 2592000,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "farmer_john",
      "fullname": "Nguyễn Văn A",
      "role": "FARMER"
    }
  }
}
```

### 1.3. Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "farmer_john",
    "fullname": "Nguyễn Văn A",
    "email": "john@example.com",
    "phoneNumber": "0912345678",
    "role": "FARMER",
    "isActive": true
  }
}
```

---

## 2. FARM MANAGEMENT APIs

### 2.1. Create Farm (FARMER/ADMIN only)
**POST** `/farms`

**Request Body:**
```json
{
  "name": "Trang trại Thông Đà Lạt",
  "description": "Trồng thông chuyên canh trên cao nguyên Đà Lạt",
  "location": "Xã Xuân Trường, Đà Lạt, Lâm Đồng",
  "area": 50000.00,
  "usableArea": 45000.00
}
```

**Note:** 
- `latitude`, `longitude` sẽ tự động lấy từ `location` qua Geocoding API
- `soilType`, `climateZone`, `avgRainfall`, `avgTemperature` sẽ tự động lấy từ Weather & Soil APIs

**Response (201):**
```json
{
  "success": true,
  "message": "Farm created successfully",
  "data": {
    "id": 1,
    "code": "FARM-1737965400000",
    "name": "Trang trại Thông Đà Lạt",
    "description": "Trồng thông chuyên canh trên cao nguyên Đà Lạt",
    "location": "Đà Lạt, Lâm Đồng, Vietnam",
    "latitude": 11.940419,
    "longitude": 108.458313,
    "area": 50000.00,
    "usableArea": 45000.00,
    "soilType": "Acrisols (Đất phù sa chua)",
    "climateZone": "Subtropical Highland",
    "avgRainfall": 1800.50,
    "avgTemperature": 18.50,
    "farmStatus": "ACTIVE",
    "totalBatches": 0,
    "totalTrees": 0,
    "createdBy": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-01-27T10:30:00Z",
    "updatedAt": "2026-01-27T10:30:00Z"
  }
}
```

### 2.2. Get All Farms (Paginated)
**GET** `/farms?page=0&size=10&sort=createdAt,desc`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "code": "FARM-1737965400000",
        "name": "Trang trại Thông Đà Lạt",
        "location": "Đà Lạt, Lâm Đồng",
        "area": 50000.00,
        "farmStatus": "ACTIVE",
        "totalBatches": 5,
        "totalTrees": 10000
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10
    },
    "totalElements": 1,
    "totalPages": 1
  }
}
```

### 2.3. Get Farm By ID
**GET** `/farms/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "FARM-1737965400000",
    "name": "Trang trại Thông Đà Lạt",
    "description": "Trồng thông chuyên canh trên cao nguyên Đà Lạt",
    "location": "Đà Lạt, Lâm Đồng, Vietnam",
    "latitude": 11.940419,
    "longitude": 108.458313,
    "area": 50000.00,
    "usableArea": 45000.00,
    "soilType": "Acrisols (Đất phù sa chua)",
    "climateZone": "Subtropical Highland",
    "avgRainfall": 1800.50,
    "avgTemperature": 18.50,
    "farmStatus": "ACTIVE",
    "totalBatches": 5,
    "totalTrees": 10000,
    "createdAt": "2026-01-27T10:30:00Z"
  }
}
```

### 2.4. Update Farm
**PUT** `/farms/{id}`

**Request Body:**
```json
{
  "name": "Trang trại Thông Đà Lạt - Mở rộng",
  "description": "Mở rộng thêm 10 hecta",
  "area": 60000.00,
  "usableArea": 55000.00
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Farm updated successfully",
  "data": {
    "id": 1,
    "name": "Trang trại Thông Đà Lạt - Mở rộng",
    "area": 60000.00,
    "updatedAt": "2026-01-27T11:00:00Z"
  }
}
```

### 2.5. Delete Farm (Soft Delete)
**DELETE** `/farms/{id}`

**Response (200):**
```json
{
  "success": true,
  "message": "Farm deleted successfully"
}
```

### 2.6. Get My Farms (FARMER only)
**GET** `/farms/my-farms?page=0&size=10`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "code": "FARM-1737965400000",
        "name": "Trang trại Thông Đà Lạt",
        "farmStatus": "ACTIVE",
        "totalBatches": 5,
        "totalTrees": 10000
      }
    ],
    "totalElements": 1
  }
}
```

### 2.7. Search Farms
**GET** `/farms/search?keyword=đà lạt`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "FARM-1737965400000",
      "name": "Trang trại Thông Đà Lạt",
      "location": "Đà Lạt, Lâm Đồng"
    }
  ]
}
```

---

## 3. PROJECT MANAGEMENT APIs

### 3.1. Create Project (FARMER only)
**POST** `/projects`

**Request Body:**
```json
{
  "code": "PRJ-2026-001",
  "name": "Dự án trồng rừng Đà Lạt 2026",
  "description": "Trồng 10,000 cây thông trên diện tích 5 hecta, dự kiến hấp thụ 275 tấn CO2 trong 5 năm",
  "totalBudget": 500000000,
  "targetCo2Kg": 275000,
  "isPublic": true,
  "farmIds": [1, 2],
  "phases": [
    {
      "phaseNumber": 1,
      "phaseName": "Lập kế hoạch",
      "description": "Khảo sát đất đai, lập kế hoạch trồng",
      "phaseStatus": "PLANNING",
      "actualStartDate": "2026-01-01",
      "plannedEndDate": "2026-03-31",
      "budget": 50000000,
      "targetCo2Kg": 0
    },
    {
      "phaseNumber": 2,
      "phaseName": "Trồng cây",
      "description": "Trồng 10,000 cây thông",
      "phaseStatus": "PLANNING",
      "actualStartDate": "2026-04-01",
      "plannedEndDate": "2026-06-30",
      "budget": 200000000,
      "targetCo2Kg": 0
    },
    {
      "phaseNumber": 3,
      "phaseName": "Chăm sóc phát triển",
      "description": "Chăm sóc cây trong 5 năm",
      "phaseStatus": "PLANNING",
      "actualStartDate": "2026-07-01",
      "plannedEndDate": "2031-06-30",
      "budget": 150000000,
      "targetCo2Kg": 275000
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": 1,
    "code": "PRJ-2026-001",
    "name": "Dự án trồng rừng Đà Lạt 2026",
    "description": "Trồng 10,000 cây thông...",
    "managerId": "550e8400-e29b-41d4-a716-446655440000",
    "managerName": "Nguyễn Văn A",
    "projectStatus": "PLANNING",
    "totalBudget": 500000000,
    "actualCost": 0,
    "targetCo2Kg": 275000,
    "actualCo2Kg": 0,
    "completionPercentage": 0,
    "isPublic": true,
    "farms": [
      {
        "farmId": 1,
        "farmCode": "FARM-1737965400000",
        "farmName": "Trang trại Thông Đà Lạt"
      }
    ],
    "phases": [
      {
        "phaseId": 1,
        "phaseNumber": 1,
        "phaseName": "Lập kế hoạch",
        "phaseStatus": "PLANNING",
        "budget": 50000000
      }
    ],
    "createdAt": "2026-01-27T11:30:00Z"
  }
}
```

### 3.2. Get All Projects (Public)
**GET** `/projects?page=0&size=10&status=ACTIVE`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "code": "PRJ-2026-001",
        "name": "Dự án trồng rừng Đà Lạt 2026",
        "projectStatus": "ACTIVE",
        "targetCo2Kg": 275000,
        "actualCo2Kg": 125750,
        "completionPercentage": 45.73,
        "farmCount": 2,
        "phaseCount": 3,
        "availableCredits": 125
      }
    ],
    "totalElements": 1
  }
}
```

### 3.3. Get Project Details
**GET** `/projects/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "PRJ-2026-001",
    "name": "Dự án trồng rừng Đà Lạt 2026",
    "description": "Trồng 10,000 cây thông...",
    "projectStatus": "ACTIVE",
    "totalBudget": 500000000,
    "actualCost": 250000000,
    "targetCo2Kg": 275000,
    "actualCo2Kg": 125750,
    "completionPercentage": 45.73,
    "farms": [
      {
        "farmId": 1,
        "farmCode": "FARM-1737965400000",
        "farmName": "Trang trại Thông Đà Lạt",
        "location": "Đà Lạt, Lâm Đồng",
        "area": 50000
      }
    ],
    "phases": [
      {
        "phaseId": 1,
        "phaseNumber": 1,
        "phaseName": "Lập kế hoạch",
        "phaseStatus": "COMPLETED",
        "actualStartDate": "2026-01-01",
        "actualEndDate": "2026-03-31",
        "budget": 50000000,
        "actualCost": 48000000,
        "targetCo2Kg": 0,
        "actualCo2Kg": 0
      },
      {
        "phaseId": 2,
        "phaseNumber": 2,
        "phaseName": "Trồng cây",
        "phaseStatus": "COMPLETED",
        "budget": 200000000,
        "actualCost": 195000000
      },
      {
        "phaseId": 3,
        "phaseNumber": 3,
        "phaseName": "Chăm sóc phát triển",
        "phaseStatus": "GROWING",
        "targetCo2Kg": 275000,
        "actualCo2Kg": 125750
      }
    ],
    "carbonCredits": [
      {
        "creditId": 1,
        "creditCode": "CC-2026-PRJ001-001",
        "creditsIssued": 125,
        "creditsAvailable": 75,
        "currentPrice": 500000
      }
    ]
  }
}
```

### 3.4. Update Project
**PUT** `/projects/{id}`

**Request Body:**
```json
{
  "name": "Dự án trồng rừng Đà Lạt 2026 - Giai đoạn 2",
  "description": "Mở rộng dự án...",
  "projectStatus": "ACTIVE"
}
```

### 3.5. Get My Projects (FARMER only)
**GET** `/projects/my-projects?page=0&size=10`

---

## 4. TREE BATCH APIs

### 4.1. Create Tree Batch (FARMER only)
**POST** `/tree-batches`

**Request Body:**
```json
{
  "batchCode": "BATCH-2026-001",
  "farmId": 1,
  "treeSpeciesId": 3,
  "phaseId": 2,
  "quantityPlanted": 1000,
  "plantingDate": "2026-04-15",
  "plantingAreaM2": 5000,
  "supplierName": "Trang trại cây giống Đà Lạt",
  "unitCost": 50000,
  "totalCost": 50000000,
  "notes": "Trồng lô cây thông đầu tiên"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Tree batch created successfully",
  "data": {
    "id": 1,
    "batchCode": "BATCH-2026-001",
    "farmId": 1,
    "farmName": "Trang trại Thông Đà Lạt",
    "treeSpeciesId": 3,
    "treeSpeciesName": "Thông lá kim",
    "baseCarbonRate": 27.5250,
    "phaseId": 2,
    "phaseName": "Trồng cây",
    "quantityPlanted": 1000,
    "quantityAlive": 1000,
    "plantingDate": "2026-04-15",
    "plantingAreaM2": 5000,
    "totalCost": 50000000,
    "batchStatus": "ACTIVE",
    "createdAt": "2026-01-27T12:00:00Z"
  }
}
```

### 4.2. Get Tree Batches By Farm
**GET** `/tree-batches/farm/{farmId}?page=0&size=10`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "batchCode": "BATCH-2026-001",
        "treeSpeciesName": "Thông lá kim",
        "quantityPlanted": 1000,
        "quantityAlive": 995,
        "plantingDate": "2026-04-15",
        "ageInDays": 105,
        "latestCo2AbsorbedKg": 2149.35,
        "batchStatus": "ACTIVE"
      }
    ]
  }
}
```

### 4.3. Get Batch Details with Latest Growth Record
**GET** `/tree-batches/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "batchCode": "BATCH-2026-001",
    "farmId": 1,
    "farmName": "Trang trại Thông Đà Lạt",
    "treeSpeciesId": 3,
    "treeSpeciesName": "Thông lá kim",
    "baseCarbonRate": 27.5250,
    "quantityPlanted": 1000,
    "quantityAlive": 995,
    "quantityDead": 5,
    "plantingDate": "2026-04-15",
    "ageInYears": 0.29,
    "latestGrowthRecord": {
      "recordId": 5,
      "recordedDate": "2026-07-15",
      "quantityAlive": 995,
      "avgHeightCm": 85.5,
      "avgTrunkDiameterCm": 3.2,
      "healthStatus": "HEALTHY",
      "co2AbsorbedKg": 7523.45,
      "environmentFactor": 0.95
    },
    "totalCo2AbsorbedKg": 7523.45,
    "batchStatus": "ACTIVE"
  }
}
```

---

## 5. TREE GROWTH RECORD APIs

### 5.1. Create Growth Record (FARMER only)
**POST** `/tree-growth-records`

**Request Body:**
```json
{
  "batchId": 1,
  "recordedDate": "2026-05-15",
  "quantityAlive": 995,
  "quantityDead": 5,
  "avgHeightCm": 25.5,
  "avgTrunkDiameterCm": 1.2,
  "avgCanopyDiameterCm": 15.0,
  "healthStatus": "HEALTHY",
  "healthNotes": "Cây phát triển tốt, có 5 cây bị sâu bệnh đã loại bỏ"
}
```

**Note:** `co2AbsorbedKg` và `environmentFactor` sẽ được tính tự động bởi hệ thống dựa trên:
- `base_carbon_rate` từ tree_species
- Tuổi cây (tree_age_years)
- Environment factors từ `farm_environment_records` (30 ngày gần nhất)

**Response (201):**
```json
{
  "success": true,
  "message": "Growth record created successfully",
  "data": {
    "id": 1,
    "batchId": 1,
    "recordedDate": "2026-05-15",
    "quantityAlive": 995,
    "quantityDead": 5,
    "avgHeightCm": 25.5,
    "avgTrunkDiameterCm": 1.2,
    "healthStatus": "HEALTHY",
    "co2AbsorbedKg": 2149.35,
    "environmentFactor": 0.95,
    "treeAgeYears": 0.0822,
    "calculation": {
      "baseCarbonRate": 27.5250,
      "treeAge": 0.0822,
      "quantityAlive": 995,
      "environmentFactor": 0.95,
      "formula": "27.5250 × 0.0822 × 995 × 0.95 = 2149.35 kg CO2"
    },
    "createdAt": "2026-01-27T13:00:00Z"
  }
}
```

### 5.2. Get Growth Records By Batch
**GET** `/tree-growth-records/batch/{batchId}?page=0&size=20`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 3,
        "recordedDate": "2026-07-15",
        "quantityAlive": 995,
        "avgHeightCm": 85.5,
        "co2AbsorbedKg": 7523.45,
        "healthStatus": "HEALTHY"
      },
      {
        "id": 2,
        "recordedDate": "2026-06-15",
        "quantityAlive": 997,
        "avgHeightCm": 55.0,
        "co2AbsorbedKg": 4836.22,
        "healthStatus": "HEALTHY"
      },
      {
        "id": 1,
        "recordedDate": "2026-05-15",
        "quantityAlive": 995,
        "avgHeightCm": 25.5,
        "co2AbsorbedKg": 2149.35,
        "healthStatus": "HEALTHY"
      }
    ],
    "totalElements": 3
  }
}
```

### 5.3. Get Growth Analytics
**GET** `/tree-growth-records/batch/{batchId}/analytics`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "batchId": 1,
    "batchCode": "BATCH-2026-001",
    "totalRecords": 3,
    "firstRecordDate": "2026-05-15",
    "latestRecordDate": "2026-07-15",
    "survivalRate": 99.5,
    "initialQuantity": 1000,
    "currentQuantity": 995,
    "totalDeaths": 5,
    "avgGrowthRateCmPerMonth": 30.0,
    "totalCo2Absorbed": 7523.45,
    "avgEnvironmentFactor": 0.95,
    "healthStatusDistribution": {
      "HEALTHY": 3,
      "STRESSED": 0,
      "DISEASED": 0
    },
    "growthTrend": [
      {
        "date": "2026-05-15",
        "avgHeight": 25.5,
        "co2": 2149.35
      },
      {
        "date": "2026-06-15",
        "avgHeight": 55.0,
        "co2": 4836.22
      },
      {
        "date": "2026-07-15",
        "avgHeight": 85.5,
        "co2": 7523.45
      }
    ]
  }
}
```

---

## 6. CARBON CREDIT APIs

### 6.1. Issue Carbon Credits (ADMIN/VERIFIER only)
**POST** `/carbon-credits`

**Request Body:**
```json
{
  "creditCode": "CC-2026-PRJ001-001",
  "projectId": 1,
  "issuanceYear": 2026,
  "basePricePerCredit": 500000,
  "verificationStandard": "VCS (Verified Carbon Standard)",
  "verificationDate": "2026-01-27",
  "expiresAt": "2036-01-27"
}
```

**Note:** 
- `totalCo2Tons` và `creditsIssued` sẽ được tính tự động từ `project.actualCo2Kg`
- 1 credit = 1 ton CO2 = 1000 kg CO2

**Response (201):**
```json
{
  "success": true,
  "message": "Carbon credits issued successfully",
  "data": {
    "id": 1,
    "creditCode": "CC-2026-PRJ001-001",
    "projectId": 1,
    "projectName": "Dự án trồng rừng Đà Lạt 2026",
    "issuanceYear": 2026,
    "totalCo2Tons": 125.75,
    "creditsIssued": 125,
    "basePricePerCredit": 500000,
    "currentPricePerCredit": 500000,
    "creditsAvailable": 125,
    "creditStatus": "AVAILABLE",
    "verificationStandard": "VCS (Verified Carbon Standard)",
    "verificationDate": "2026-01-27",
    "verifierName": "Admin Hệ thống",
    "issuedAt": "2026-01-27T14:00:00Z",
    "expiresAt": "2036-01-27T00:00:00Z"
  }
}
```

### 6.2. Get Available Credits (Marketplace)
**GET** `/carbon-credits/marketplace?page=0&size=10&minPrice=0&maxPrice=1000000&location=đà lạt`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "creditCode": "CC-2026-PRJ001-001",
        "projectCode": "PRJ-2026-001",
        "projectName": "Dự án trồng rừng Đà Lạt 2026",
        "projectDescription": "Trồng 10,000 cây thông...",
        "projectManager": "Nguyễn Văn A",
        "location": "Đà Lạt, Lâm Đồng",
        "creditsAvailable": 125,
        "currentPrice": 500000,
        "verificationStandard": "VCS",
        "qualityRating": 4,
        "expiresAt": "2036-01-27"
      }
    ],
    "totalElements": 1
  }
}
```

### 6.3. Get Credit Details
**GET** `/carbon-credits/{id}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "creditCode": "CC-2026-PRJ001-001",
    "projectId": 1,
    "projectName": "Dự án trồng rừng Đà Lạt 2026",
    "projectCode": "PRJ-2026-001",
    "issuanceYear": 2026,
    "totalCo2Tons": 125.75,
    "creditsIssued": 125,
    "creditsAvailable": 125,
    "creditsAllocated": 0,
    "creditsSold": 0,
    "creditsRetired": 0,
    "basePricePerCredit": 500000,
    "currentPricePerCredit": 500000,
    "creditStatus": "AVAILABLE",
    "verificationStandard": "VCS (Verified Carbon Standard)",
    "verificationDate": "2026-01-27",
    "certificateUrl": "https://storage.../certificate-CC-2026-PRJ001-001.pdf",
    "verifierName": "Admin Hệ thống",
    "issuedAt": "2026-01-27T14:00:00Z",
    "expiresAt": "2036-01-27T00:00:00Z"
  }
}
```

---

## 7. CONTRACT APIs

### 7.1. Create Contract (USER/FARMER creates draft)
**POST** `/contracts`

**Request Body:**
```json
{
  "contractCode": "CONTRACT-2026-001",
  "projectId": 1,
  "contractType": "CREDIT_PURCHASE",
  "totalValue": 25000000,
  "startDate": "2026-02-01",
  "endDate": "2026-12-31",
  "paymentTerms": "Thanh toán 100% qua VNPay trong vòng 7 ngày sau khi hợp đồng được phê duyệt",
  "termsAndConditions": "USER cam kết sử dụng tín chỉ để bù đắp phát thải của công ty...",
  "creditQuantity": 50,
  "creditId": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Contract created successfully. Waiting for admin approval.",
  "data": {
    "id": 1,
    "contractCode": "CONTRACT-2026-001",
    "projectId": 1,
    "projectName": "Dự án trồng rừng Đà Lạt 2026",
    "contractType": "CREDIT_PURCHASE",
    "partyAId": "user_uuid_123",
    "partyAName": "Công ty ABC",
    "totalValue": 25000000,
    "startDate": "2026-02-01",
    "endDate": "2026-12-31",
    "contractStatus": "DRAFT",
    "createdAt": "2026-01-27T15:00:00Z"
  }
}
```

### 7.2. Submit Contract for Approval (USER/FARMER)
**POST** `/contracts/{id}/submit`

**Response (200):**
```json
{
  "success": true,
  "message": "Contract submitted for approval. Admin will be notified.",
  "data": {
    "id": 1,
    "contractCode": "CONTRACT-2026-001",
    "contractStatus": "PENDING",
    "submittedAt": "2026-01-27T15:05:00Z"
  }
}
```

**WebSocket Notification sent to ADMIN:**
```json
{
  "event": "CONTRACT_SUBMITTED",
  "data": {
    "notificationId": 123,
    "title": "Yêu cầu phê duyệt hợp đồng mới",
    "message": "Người dùng Công ty ABC đã gửi yêu cầu phê duyệt hợp đồng CONTRACT-2026-001 với giá trị 25,000,000 VNĐ",
    "contractCode": "CONTRACT-2026-001",
    "contractType": "CREDIT_PURCHASE",
    "totalValue": 25000000,
    "buyerName": "Công ty ABC",
    "projectName": "Dự án trồng rừng Đà Lạt 2026",
    "timestamp": "2026-01-27T15:05:00Z"
  }
}
```

### 7.3. Approve Contract (ADMIN only)
**POST** `/contracts/{id}/approve`

**Response (200):**
```json
{
  "success": true,
  "message": "Contract approved successfully",
  "data": {
    "id": 1,
    "contractCode": "CONTRACT-2026-001",
    "contractStatus": "ACTIVE",
    "approvedBy": "admin_uuid",
    "approvedAt": "2026-01-27T15:10:00Z"
  }
}
```

**WebSocket Notifications sent to USER and FARMER:**
```json
{
  "event": "CONTRACT_APPROVED",
  "data": {
    "notificationId": 124,
    "title": "Hợp đồng đã được phê duyệt",
    "message": "Hợp đồng CONTRACT-2026-001 đã được phê duyệt. Vui lòng thanh toán trong vòng 7 ngày.",
    "contractCode": "CONTRACT-2026-001",
    "totalValue": 25000000,
    "approvedBy": "Admin Hệ thống",
    "paymentDeadline": "2026-02-08",
    "timestamp": "2026-01-27T15:10:00Z"
  }
}
```

### 7.4. Reject Contract (ADMIN only)
**POST** `/contracts/{id}/reject`

**Request Body:**
```json
{
  "reason": "Dự án chưa đủ tín chỉ available. Vui lòng chọn project khác hoặc giảm số lượng."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contract rejected",
  "data": {
    "id": 1,
    "contractCode": "CONTRACT-2026-001",
    "contractStatus": "TERMINATED",
    "terminationReason": "Dự án chưa đủ tín chỉ available...",
    "rejectedBy": "admin_uuid",
    "rejectedAt": "2026-01-27T15:15:00Z"
  }
}
```

### 7.5. Get Pending Contracts (ADMIN only)
**GET** `/contracts/pending?page=0&size=10`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "contractCode": "CONTRACT-2026-001",
        "contractType": "CREDIT_PURCHASE",
        "buyerName": "Công ty ABC",
        "projectName": "Dự án trồng rừng Đà Lạt 2026",
        "totalValue": 25000000,
        "submittedAt": "2026-01-27T15:05:00Z"
      }
    ],
    "totalElements": 1
  }
}
```

### 7.6. Get My Contracts (USER/FARMER)
**GET** `/contracts/my-contracts?page=0&size=10&status=ACTIVE`

---

## 8. PAYMENT APIs

### 8.1. Create Payment & Get VNPay URL
**POST** `/payments/create`

**Request Body:**
```json
{
  "contractId": 1,
  "amount": 25000000,
  "paymentMethod": "VNPAY",
  "returnUrl": "http://localhost:3000/payment-result"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment created. Redirect to VNPay.",
  "data": {
    "paymentId": 1,
    "paymentCode": "PAY-2026-001",
    "amount": 25000000,
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=2500000000&vnp_Command=pay&vnp_CreateDate=20260127151000&vnp_CurrCode=VND&vnp_IpAddr=192.168.1.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+hop+dong+CONTRACT-2026-001&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8088%2Fapi%2Fpayments%2Fvnpay-return&vnp_TmnCode=YOUR_TMN_CODE&vnp_TxnRef=PAY-2026-001&vnp_Version=2.1.0&vnp_SecureHash=...",
    "paymentStatus": "PENDING"
  }
}
```

### 8.2. VNPay Return Callback (Handled by backend)
**GET** `/payments/vnpay-return?vnp_Amount=2500000000&vnp_ResponseCode=00&...`

**Note:** Backend sẽ tự động xử lý callback từ VNPay, verify secure hash, update payment status, trigger business logic

**Redirect to:**
```
http://localhost:3000/payment-result?success=true&paymentCode=PAY-2026-001
```

### 8.3. Get Payment Status
**GET** `/payments/{paymentCode}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "paymentCode": "PAY-2026-001",
    "contractId": 1,
    "contractCode": "CONTRACT-2026-001",
    "amount": 25000000,
    "paymentMethod": "VNPAY",
    "paymentStatus": "COMPLETED",
    "vnpTransactionNo": "VNP123456789",
    "vnpBankCode": "NCB",
    "paymentDate": "2026-01-27T15:20:00Z",
    "completedAt": "2026-01-27T15:20:05Z"
  }
}
```

### 8.4. Get My Payment History
**GET** `/payments/my-payments?page=0&size=10`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "paymentCode": "PAY-2026-001",
        "contractCode": "CONTRACT-2026-001",
        "amount": 25000000,
        "paymentMethod": "VNPAY",
        "paymentStatus": "COMPLETED",
        "paymentDate": "2026-01-27T15:20:00Z"
      }
    ],
    "totalElements": 1,
    "totalAmount": 25000000
  }
}
```

---

## 9. NOTIFICATION APIs

### 9.1. Get My Notifications
**GET** `/notifications?page=0&size=20&isRead=false`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 124,
        "title": "Hợp đồng đã được phê duyệt",
        "message": "Hợp đồng CONTRACT-2026-001 đã được phê duyệt...",
        "notificationType": "CONTRACT_APPROVED",
        "referenceType": "CONTRACT",
        "referenceId": 1,
        "isRead": false,
        "metadata": {
          "contractCode": "CONTRACT-2026-001",
          "totalValue": 25000000
        },
        "createdAt": "2026-01-27T15:10:00Z"
      }
    ],
    "totalElements": 1,
    "unreadCount": 1
  }
}
```

### 9.2. Mark as Read
**PUT** `/notifications/{id}/read`

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### 9.3. Mark All as Read
**PUT** `/notifications/mark-all-read`

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### 9.4. WebSocket Connection
**Connect to:**
```
ws://localhost:8088/ws/notifications?token={JWT_TOKEN}
```

**Subscribe to:**
```
/topic/notifications/{userId}
```

**Receive real-time notifications:**
```json
{
  "event": "CONTRACT_APPROVED",
  "data": {
    "notificationId": 124,
    "title": "Hợp đồng đã được phê duyệt",
    "message": "Hợp đồng CONTRACT-2026-001 đã được phê duyệt...",
    "timestamp": "2026-01-27T15:10:00Z"
  }
}
```

---

## 10. AI CHATBOT APIs

### 10.1. Create Chat Session
**POST** `/chatbot/sessions`

**Request Body:**
```json
{
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.1"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "sessionId": 1,
    "sessionCode": "CHAT-20260127151000-abc123",
    "sessionStatus": "ACTIVE",
    "startedAt": "2026-01-27T15:10:00Z"
  }
}
```

### 10.2. Send Message to AI
**POST** `/chatbot/sessions/{sessionId}/messages`

**Request Body:**
```json
{
  "content": "Tôi muốn tìm dự án trồng cây ở Đà Lạt với giá tín chỉ dưới 600k"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "id": 1,
      "role": "USER",
      "content": "Tôi muốn tìm dự án trồng cây ở Đà Lạt với giá tín chỉ dưới 600k",
      "createdAt": "2026-01-27T15:11:00Z"
    },
    "assistantMessage": {
      "id": 2,
      "role": "ASSISTANT",
      "content": "Tôi tìm thấy 2 dự án trồng cây ở Đà Lạt phù hợp với yêu cầu của bạn:\n\n1. **Dự án trồng rừng Đà Lạt 2026** (PRJ-2026-001)\n   - Giá: 500,000 VNĐ/credit\n   - Còn lại: 125 credits\n   - Vị trí: Xã Xuân Trường, Đà Lạt\n   - Xác minh: VCS Standard\n\n2. **Dự án Thông Lá Kim Cao Nguyên** (PRJ-2026-005)\n   - Giá: 550,000 VNĐ/credit\n   - Còn lại: 80 credits\n   - Vị trí: Huyện Đam Rông, Lâm Đồng\n\nBạn có muốn xem chi tiết dự án nào không?",
      "modelUsed": "gpt-3.5-turbo",
      "tokensUsed": 450,
      "responseTimeMs": 1200,
      "referencedProjects": [
        {"id": 1, "name": "Dự án trồng rừng Đà Lạt 2026", "score": 0.95},
        {"id": 5, "name": "Dự án Thông Lá Kim Cao Nguyên", "score": 0.88}
      ],
      "createdAt": "2026-01-27T15:11:02Z"
    }
  }
}
```

### 10.3. Get Chat History
**GET** `/chatbot/sessions/{sessionId}/messages?page=0&size=20`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": 1,
    "sessionCode": "CHAT-20260127151000-abc123",
    "messages": [
      {
        "id": 2,
        "role": "ASSISTANT",
        "content": "Tôi tìm thấy 2 dự án...",
        "createdAt": "2026-01-27T15:11:02Z"
      },
      {
        "id": 1,
        "role": "USER",
        "content": "Tôi muốn tìm dự án...",
        "createdAt": "2026-01-27T15:11:00Z"
      }
    ],
    "totalElements": 2
  }
}
```

### 10.4. Rate AI Response
**POST** `/chatbot/messages/{messageId}/feedback`

**Request Body:**
```json
{
  "isHelpful": true,
  "feedbackNote": "Rất hữu ích, thông tin chi tiết"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Feedback submitted successfully"
}
```

---

## 📊 COMMON RESPONSE FORMATS

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "content": [ ... ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10,
      "sort": "createdAt,desc"
    },
    "totalElements": 100,
    "totalPages": 10,
    "first": true,
    "last": false
  }
}
```

---

## 🔧 TESTING WITH POSTMAN

### 1. Import Environment Variables
```json
{
  "baseUrl": "http://localhost:8088/api",
  "token": "",
  "userId": ""
}
```

### 2. Test Flow - USER mua tín chỉ carbon

**Step 1:** Register & Login
```bash
POST {{baseUrl}}/auth/register
POST {{baseUrl}}/auth/login
# Save token from response
```

**Step 2:** Browse marketplace
```bash
GET {{baseUrl}}/carbon-credits/marketplace
GET {{baseUrl}}/projects?status=ACTIVE
```

**Step 3:** Create contract
```bash
POST {{baseUrl}}/contracts
# Request body: contractType=CREDIT_PURCHASE, creditQuantity=50
```

**Step 4:** Submit for approval
```bash
POST {{baseUrl}}/contracts/1/submit
```

**Step 5:** ADMIN approves (switch to admin token)
```bash
POST {{baseUrl}}/auth/login
# Login as ADMIN
POST {{baseUrl}}/contracts/1/approve
```

**Step 6:** USER pays via VNPay
```bash
POST {{baseUrl}}/payments/create
# Get paymentUrl, open in browser, complete payment
```

**Step 7:** Check payment status
```bash
GET {{baseUrl}}/payments/PAY-2026-001
```

### 3. Test Flow - FARMER tạo dự án

**Step 1:** Login as FARMER
```bash
POST {{baseUrl}}/auth/login
```

**Step 2:** Create farm (auto-fetch environment data)
```bash
POST {{baseUrl}}/farms
{
  "name": "Trang trại Thông Đà Lạt",
  "location": "Đà Lạt, Lâm Đồng",
  "area": 50000,
  "usableArea": 45000
}
# latitude, longitude, soilType, climateZone will be auto-filled
```

**Step 3:** Create project
```bash
POST {{baseUrl}}/projects
```

**Step 4:** Create tree batch
```bash
POST {{baseUrl}}/tree-batches
```

**Step 5:** Record growth monthly
```bash
POST {{baseUrl}}/tree-growth-records
# co2AbsorbedKg will be calculated automatically
```

**Step 6:** ADMIN issues credits when CO2 target reached
```bash
POST {{baseUrl}}/carbon-credits
```

---

## 🐛 ERROR CODES

| Code | Description |
|------|-------------|
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Invalid/missing token |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Duplicate resource |
| `422` | Validation Error - Business logic violation |
| `500` | Internal Server Error |

---

## 📝 NOTES

1. **Mock vs Real APIs**: Hiện tại các API external (Geocoding, Weather, Soil) đang dùng mock data. Để dùng API thật:
   - Set `geocoding.use-mock: false` trong `application.yml`
   - Thêm API keys vào config
   
2. **VNPay Sandbox**: Sử dụng thẻ test:
   - Số thẻ: `9704198526191432198`
   - Tên: `NGUYEN VAN A`
   - Ngày phát hành: `07/15`
   - Mật khẩu OTP: `123456`

3. **WebSocket**: Sử dụng SockJS/STOMP client để kết nối real-time notifications

4. **AI Chatbot**: Cần OpenAI API key để sử dụng

---

**Happy Testing! 🚀**

