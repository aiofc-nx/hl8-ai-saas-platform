# Tenant API Contract

> **日期**: 2025-01-27  
> **版本**: 1.0.0  
> **基础路径**: `/api/tenants`

---

## 📋 API 概览

租户管理 API 提供租户的 CRUD 操作，包括创建、查询、更新和删除租户。

---

## 🔐 认证

所有 API 请求都需要在请求头中包含认证信息：

```
Authorization: Bearer <token>
X-Tenant-Id: <tenant-id>
X-Organization-Id: <organization-id>  # 可选
X-Department-Id: <department-id>      # 可选
```

---

## 📝 API 端点

### 1. 创建租户

**POST** `/api/tenants`

创建新的租户。

#### 请求示例

```json
{
  "code": "tenant_001",
  "name": "示例租户",
  "type": "ENTERPRISE",
  "description": "这是一个示例租户"
}
```

#### 请求参数

| 字段        | 类型   | 必填 | 说明                                                      |
| ----------- | ------ | ---- | --------------------------------------------------------- |
| code        | string | ✅   | 租户代码，3-20个字符                                      |
| name        | string | ✅   | 租户名称，2-100个字符                                     |
| type        | enum   | ✅   | 租户类型（FREE, BASIC, PROFESSIONAL, ENTERPRISE, CUSTOM） |
| description | string | ❌   | 租户描述                                                  |

#### 响应示例

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "code": "tenant_001",
  "name": "示例租户",
  "type": "ENTERPRISE",
  "description": "这是一个示例租户",
  "status": "PENDING",
  "createdAt": "2025-01-27T10:00:00.000Z",
  "updatedAt": "2025-01-27T10:00:00.000Z",
  "createdBy": "system",
  "updatedBy": "system"
}
```

#### 状态码

- `201 Created`: 租户创建成功
- `400 Bad Request`: 请求参数无效
- `409 Conflict`: 租户代码已存在
- `500 Internal Server Error`: 服务器错误

---

### 2. 获取租户列表

**GET** `/api/tenants`

获取租户列表（支持分页）。

#### 请求参数

| 参数   | 类型   | 必填 | 说明             |
| ------ | ------ | ---- | ---------------- |
| page   | number | ❌   | 页码，默认1      |
| limit  | number | ❌   | 每页数量，默认10 |
| type   | enum   | ❌   | 租户类型筛选     |
| status | enum   | ❌   | 租户状态筛选     |

#### 响应示例

```json
{
  "tenants": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "code": "tenant_001",
      "name": "示例租户",
      "type": "ENTERPRISE",
      "status": "ACTIVE",
      "createdAt": "2025-01-27T10:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

#### 状态码

- `200 OK`: 成功
- `500 Internal Server Error`: 服务器错误

---

### 3. 获取单个租户

**GET** `/api/tenants/:tenantId`

根据租户ID获取租户详细信息。

#### 路径参数

| 参数     | 类型          | 必填 | 说明   |
| -------- | ------------- | ---- | ------ |
| tenantId | string (UUID) | ✅   | 租户ID |

#### 响应示例

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "code": "tenant_001",
  "name": "示例租户",
  "type": "ENTERPRISE",
  "description": "这是一个示例租户",
  "status": "ACTIVE",
  "createdAt": "2025-01-27T10:00:00.000Z",
  "updatedAt": "2025-01-27T10:00:00.000Z",
  "createdBy": "system",
  "updatedBy": "system"
}
```

#### 状态码

- `200 OK`: 成功
- `404 Not Found`: 租户不存在
- `500 Internal Server Error`: 服务器错误

---

### 4. 更新租户

**PUT** `/api/tenants/:tenantId`

更新租户信息。

#### 路径参数

| 参数     | 类型          | 必填 | 说明   |
| -------- | ------------- | ---- | ------ |
| tenantId | string (UUID) | ✅   | 租户ID |

#### 请求示例

```json
{
  "name": "更新后的租户名称",
  "description": "更新后的描述"
}
```

#### 请求参数

| 字段        | 类型   | 必填 | 说明         |
| ----------- | ------ | ---- | ------------ |
| name        | string | ❌   | 新的租户名称 |
| description | string | ❌   | 新的租户描述 |

#### 响应示例

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "code": "tenant_001",
  "name": "更新后的租户名称",
  "type": "ENTERPRISE",
  "description": "更新后的描述",
  "status": "ACTIVE",
  "createdAt": "2025-01-27T10:00:00.000Z",
  "updatedAt": "2025-01-27T11:00:00.000Z",
  "createdBy": "system",
  "updatedBy": "user_001"
}
```

#### 状态码

- `200 OK`: 更新成功
- `400 Bad Request`: 请求参数无效
- `404 Not Found`: 租户不存在
- `500 Internal Server Error`: 服务器错误

---

### 5. 删除租户

**DELETE** `/api/tenants/:tenantId`

删除租户（软删除）。

#### 路径参数

| 参数     | 类型          | 必填 | 说明   |
| -------- | ------------- | ---- | ------ |
| tenantId | string (UUID) | ✅   | 租户ID |

#### 响应示例

```json
{
  "message": "租户删除成功",
  "tenantId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

#### 状态码

- `200 OK`: 删除成功
- `404 Not Found`: 租户不存在
- `400 Bad Request`: 租户存在关联数据，无法删除
- `500 Internal Server Error`: 服务器错误

---

## 🔒 权限要求

### 创建租户

- 权限: `tenant:create`
- 角色: 平台管理员

### 获取租户列表

- 权限: `tenant:read`
- 角色: 所有用户

### 获取单个租户

- 权限: `tenant:read`
- 角色: 所有用户
- 隔离: 只能查看自己租户的数据

### 更新租户

- 权限: `tenant:update`
- 角色: 租户管理员
- 隔离: 只能更新自己租户的数据

### 删除租户

- 权限: `tenant:delete`
- 角色: 平台管理员
- 限制: 租户状态必须为 SUSPENDED 或 EXPIRED

---

## 📊 数据模型

### Tenant（租户）

```typescript
interface Tenant {
  id: string; // 租户ID (UUID)
  code: string; // 租户代码
  name: string; // 租户名称
  type: TenantType; // 租户类型
  status: TenantStatus; // 租户状态
  description?: string; // 描述
  createdAt: Date; // 创建时间
  updatedAt: Date; // 更新时间
  createdBy: string; // 创建者
  updatedBy: string; // 更新者
}
```

### TenantType（租户类型）

```typescript
enum TenantType {
  FREE = "FREE", // 免费版
  BASIC = "BASIC", // 基础版
  PROFESSIONAL = "PROFESSIONAL", // 专业版
  ENTERPRISE = "ENTERPRISE", // 企业版
  CUSTOM = "CUSTOM", // 定制版
}
```

### TenantStatus（租户状态）

```typescript
enum TenantStatus {
  PENDING = "PENDING", // 待处理
  ACTIVE = "ACTIVE", // 活跃
  SUSPENDED = "SUSPENDED", // 暂停
  EXPIRED = "EXPIRED", // 过期
  DELETED = "DELETED", // 已删除
}
```

---

## ⚠️ 错误响应

### 标准错误格式

```json
{
  "error": {
    "type": "ValidationError",
    "message": "租户代码格式不正确",
    "details": {
      "field": "code",
      "reason": "必须是3-20个字符"
    }
  }
}
```

### 常见错误码

| 状态码 | 错误类型        | 说明                     |
| ------ | --------------- | ------------------------ |
| 400    | ValidationError | 请求参数验证失败         |
| 401    | Unauthorized    | 未认证                   |
| 403    | Forbidden       | 权限不足                 |
| 404    | NotFound        | 资源不存在               |
| 409    | Conflict        | 资源冲突（如代码已存在） |
| 500    | InternalError   | 服务器内部错误           |

---

## 🔗 相关 API

- [Organization API](./organization-api.md) - 组织管理 API
- [Department API](./department-api.md) - 部门管理 API
- [User API](./user-api.md) - 用户管理 API
