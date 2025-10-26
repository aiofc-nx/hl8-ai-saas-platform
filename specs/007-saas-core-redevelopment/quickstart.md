# SAAS Core Module 快速开始指南

**日期**: 2024-12-19  
**功能**: SAAS Core Module Redevelopment  
**分支**: 007-saas-core-redevelopment

## 概述

本指南将帮助您快速开始使用重新开发的SAAS Core模块。该模块基于Clean Architecture + DDD + CQRS + ES + EDA混合架构模式，使用@hl8内核组件进行开发，支持多租户数据隔离和完整的领域模型。

## 前置条件

### 系统要求

- **Node.js**: >= 20.0.0
- **pnpm**: >= 10.12.1
- **TypeScript**: 5.9.2
- **PostgreSQL**: >= 14.0 (默认数据库)
- **MongoDB**: >= 6.0 (可选数据库)
- **Redis**: >= 6.0 (缓存)

### 依赖组件

- **@hl8/domain-kernel**: 领域层内核组件
- **@hl8/application-kernel**: 应用层内核组件
- **@hl8/infrastructure-kernel**: 基础设施层内核组件
- **@hl8/interface-kernel**: 接口层内核组件
- **@hl8/exceptions**: 异常处理组件
- **@hl8/caching**: 缓存组件
- **@hl8/config**: 配置管理组件
- **@hl8/nestjs-fastify**: NestJS Fastify集成组件

## 安装和配置

### 1. 克隆项目

```bash
git clone https://github.com/hl8/hl8-ai-saas-platform.git
cd hl8-ai-saas-platform
```

### 2. 安装依赖

```bash
# 使用pnpm安装依赖
pnpm install

# 构建所有包
pnpm build
```

### 3. 环境配置

创建环境配置文件：

```bash
# 复制环境配置模板
cp .env.example .env

# 编辑环境配置
nano .env
```

环境配置示例：

```env
# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/saas_core
MONGODB_URL=mongodb://localhost:27017/saas_core
REDIS_URL=redis://localhost:6379

# 应用配置
NODE_ENV=development
PORT=3000
API_VERSION=v1

# 认证配置
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# 多租户配置
DEFAULT_TENANT_ISOLATION_STRATEGY=ROW_LEVEL_SECURITY
ENABLE_MULTI_DATABASE=false

# 日志配置
LOG_LEVEL=info
LOG_FORMAT=json

# 监控配置
ENABLE_METRICS=true
METRICS_PORT=9090
```

### 4. 数据库初始化

```bash
# 创建数据库
createdb saas_core

# 运行数据库迁移
pnpm db:migrate

# 运行数据库种子数据
pnpm db:seed
```

## 快速开始

### 1. 启动开发服务器

```bash
# 启动开发服务器
pnpm dev

# 或者启动特定服务
pnpm dev:saas-core
```

### 2. 验证安装

访问健康检查端点：

```bash
curl http://localhost:3000/health
```

预期响应：

```json
{
  "status": "ok",
  "timestamp": "2024-12-19T10:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "cache": "connected",
    "messageQueue": "connected"
  }
}
```

### 3. 创建第一个租户

使用API创建租户：

```bash
curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "name": "测试租户",
    "code": "test-tenant",
    "type": "BASIC",
    "settings": {
      "timezone": "Asia/Shanghai",
      "language": "zh-CN"
    },
    "resourceLimits": {
      "maxUsers": 50,
      "maxStorage": 1024,
      "maxOrganizations": 2,
      "maxApiCalls": 10000
    }
  }'
```

### 4. 创建组织

```bash
curl -X POST http://localhost:3000/api/v1/tenants/{tenantId}/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "name": "技术委员会",
    "type": "Committee",
    "description": "负责技术决策的委员会",
    "isShared": true,
    "settings": {
      "meetingSchedule": "weekly",
      "decisionProcess": "consensus"
    }
  }'
```

### 5. 创建部门

```bash
curl -X POST http://localhost:3000/api/v1/tenants/{tenantId}/organizations/{organizationId}/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "name": "前端开发部",
    "level": 1,
    "description": "负责前端开发工作",
    "settings": {
      "techStack": ["React", "TypeScript", "Node.js"],
      "teamSize": 10
    }
  }'
```

### 6. 创建用户

```bash
curl -X POST http://localhost:3000/api/v1/tenants/{tenantId}/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "username": "john.doe",
    "email": "john.doe@example.com",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "displayName": "John Doe",
      "timezone": "Asia/Shanghai",
      "language": "zh-CN"
    },
    "type": "Manager",
    "source": "Internal",
    "affiliation": "Employee"
  }'
```

## 核心功能

### 1. 多租户数据隔离

系统支持5层数据隔离架构，基于 `@hl8/domain-kernel/src/isolation` 组件实现：

```text
平台级 (Platform Level)
├── 租户级 (Tenant Level)
│   ├── 组织级 (Organization Level)
│   │   ├── 部门级 (Department Level)
│   │   │   └── 用户级 (User Level)
```

**隔离策略**:

- **默认策略**: ROW_LEVEL_SECURITY (PostgreSQL)
- **扩展策略**: SCHEMA_PER_TENANT (按租户分Schema)
- **高级策略**: DATABASE_PER_TENANT (按租户分数据库)

**基于 @hl8/domain-kernel 隔离组件实现**:

```typescript
// 导入隔离组件
import { 
  IsolationContext, 
  IsolationLevel, 
  SharingLevel 
} from "@hl8/domain-kernel";

// 创建隔离上下文
const tenantContext = IsolationContext.tenant(tenantId);
const orgContext = IsolationContext.organization(tenantId, organizationId);
const deptContext = IsolationContext.department(tenantId, organizationId, departmentId);

// 数据库查询隔离
const whereClause = context.buildWhereClause('u');
const entities = await this.em.find(UserEntity, {
  ...whereClause,
  status: 'ACTIVE'
});

// 缓存隔离
const cacheKey = context.buildCacheKey('user', 'list');
const cachedData = await this.cache.get(cacheKey);

// 访问权限检查
const canAccess = context.canAccess(dataContext, SharingLevel.ORGANIZATION);
```

### 2. 租户类型管理

支持5种租户类型，每种类型有不同的资源限制：

| 租户类型 | 最大用户数 | 最大存储(MB) | 最大组织数 | 最大API调用数 |
|---------|-----------|-------------|-----------|-------------|
| FREE | 5 | 100 | 1 | 1,000 |
| BASIC | 50 | 1,024 | 2 | 10,000 |
| PROFESSIONAL | 500 | 10,240 | 10 | 100,000 |
| ENTERPRISE | 10,000 | 102,400 | 100 | 1,000,000 |
| CUSTOM | 无限制 | 无限制 | 无限制 | 无限制 |

### 3. 组织管理

支持4种组织类型：

- **Committee (委员会)**: 决策型组织
- **ProjectTeam (项目团队)**: 项目执行组织
- **QualityGroup (质量小组)**: 质量保证组织
- **PerformanceGroup (绩效小组)**: 绩效管理组织

### 4. 部门层级管理

支持最多7层部门层级：

```
组织
├── 一级部门
│   ├── 二级部门
│   │   ├── 三级部门
│   │   │   ├── 四级部门
│   │   │   │   ├── 五级部门
│   │   │   │   │   ├── 六级部门
│   │   │   │   │   │   └── 七级部门
```

### 5. 用户管理

支持多种用户分类：

**用户类型**:

- **Admin**: 管理员
- **Manager**: 管理者
- **Member**: 成员
- **Guest**: 访客

**用户来源**:

- **Internal**: 内部用户
- **External**: 外部用户
- **Imported**: 导入用户
- **Invited**: 邀请用户

**用户归属**:

- **Employee**: 员工
- **Contractor**: 承包商
- **Partner**: 合作伙伴
- **Customer**: 客户

## API使用示例

### 1. REST API示例

#### 获取租户列表

```bash
curl -X GET "http://localhost:3000/api/v1/tenants?page=1&limit=20&type=BASIC" \
  -H "Authorization: Bearer your-jwt-token"
```

#### 获取组织详情

```bash
curl -X GET "http://localhost:3000/api/v1/tenants/{tenantId}/organizations/{organizationId}" \
  -H "Authorization: Bearer your-jwt-token"
```

#### 更新用户信息

```bash
curl -X PUT "http://localhost:3000/api/v1/tenants/{tenantId}/users/{userId}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "profile": {
      "displayName": "John Doe (Updated)",
      "phone": "+86-138-0013-8000"
    },
    "status": "ACTIVE"
  }'
```

### 2. GraphQL API示例

#### 查询租户信息

```graphql
query GetTenant($id: UUID!) {
  tenant(id: $id) {
    id
    name
    code
    type
    status
    resourceLimits {
      maxUsers
      maxStorage
      maxOrganizations
      maxApiCalls
    }
    resourceUsage {
      currentUsers
      currentStorage
      currentOrganizations
      currentApiCalls
    }
    organizations {
      id
      name
      type
      isShared
      departments {
        id
        name
        level
        path
      }
    }
  }
}
```

#### 创建组织

```graphql
mutation CreateOrganization($tenantId: UUID!, $input: OrganizationCreateInput!) {
  createOrganization(tenantId: $tenantId, input: $input) {
    id
    name
    type
    description
    isShared
    createdAt
  }
}
```

#### 订阅租户事件

```graphql
subscription OnTenantEvents {
  tenantCreated {
    id
    name
    code
    type
    status
  }
  tenantUpdated {
    id
    name
    status
  }
}
```

## 开发指南

### 1. 项目结构

```text
libs/saas-core/
├── src/
│   ├── domain/                 # 领域层
│   │   ├── aggregates/         # 聚合根
│   │   ├── entities/          # 实体
│   │   └── value-objects/     # 值对象
│   ├── application/            # 应用层
│   │   ├── commands/          # 命令
│   │   ├── queries/           # 查询
│   │   └── use-cases/         # 用例
│   ├── infrastructure/        # 基础设施层
│   │   ├── repositories/      # 仓储实现
│   │   ├── casl/             # 权限管理
│   │   └── cache/            # 缓存
│   └── interface/            # 接口层
│       └── controllers/      # 控制器
├── tests/                    # 测试
│   ├── integration/         # 集成测试
│   └── e2e/                # 端到端测试
├── package.json
├── tsconfig.json
└── eslint.config.mjs
```

### 2. 开发命令

```bash
# 开发模式
pnpm dev

# 构建项目
pnpm build

# 运行测试
pnpm test

# 运行集成测试
pnpm test:integration

# 运行端到端测试
pnpm test:e2e

# 代码检查
pnpm lint

# 类型检查
pnpm type-check

# 清理构建文件
pnpm clean
```

### 3. 测试指南

#### 单元测试

```typescript
// src/domain/entities/tenant.entity.spec.ts
import { describe, it, expect } from 'vitest';
import { Tenant } from './tenant.entity';
import { TenantId } from '../value-objects/tenant-id.vo';
import { TenantName } from '../value-objects/tenant-name.vo';

describe('Tenant Entity', () => {
  it('should create tenant with valid data', () => {
    const tenantId = TenantId.generate();
    const tenantName = new TenantName('测试租户');
    
    const tenant = Tenant.create(tenantId, tenantName, 'BASIC');
    
    expect(tenant.id).toBe(tenantId);
    expect(tenant.name).toBe(tenantName);
    expect(tenant.type).toBe('BASIC');
  });
});
```

#### 集成测试

```typescript
// tests/integration/tenant.integration.spec.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TestClient } from '../utils/test-client';

describe('Tenant Integration Tests', () => {
  let client: TestClient;

  beforeAll(async () => {
    client = new TestClient();
    await client.setup();
  });

  afterAll(async () => {
    await client.cleanup();
  });

  it('should create and retrieve tenant', async () => {
    const tenantData = {
      name: '测试租户',
      code: 'test-tenant',
      type: 'BASIC'
    };

    const response = await client.post('/api/v1/tenants', tenantData);
    expect(response.status).toBe(201);

    const tenant = await client.get(`/api/v1/tenants/${response.data.id}`);
    expect(tenant.data.name).toBe(tenantData.name);
  });
});
```

### 4. 配置管理

#### ESLint配置

```javascript
// eslint.config.mjs
import nest from "../../packages/eslint-config/eslint-nest.config.mjs";

export default [
  ...nest,
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**"
    ]
  }
];
```

#### TypeScript配置

```json
// tsconfig.json
{
  "extends": "@repo/typescript-config/nestjs.json",
  "compilerOptions": {
    "allowJs": true,
    "esModuleInterop": true,
    "incremental": true,
    "baseUrl": ".",
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"],
  "references": [
    { "path": "../../packages/domain-kernel" },
    { "path": "../../packages/application-kernel" },
    { "path": "../../packages/infrastructure-kernel" },
    { "path": "../../packages/interface-kernel" }
  ]
}
```

## 部署指南

### 1. 生产环境配置

```env
# 生产环境配置
NODE_ENV=production
PORT=3000

# 数据库配置
DATABASE_URL=postgresql://username:password@db-host:5432/saas_core
MONGODB_URL=mongodb://mongo-host:27017/saas_core
REDIS_URL=redis://redis-host:6379

# 安全配置
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRES_IN=1d

# 多租户配置
DEFAULT_TENANT_ISOLATION_STRATEGY=ROW_LEVEL_SECURITY
ENABLE_MULTI_DATABASE=false

# 监控配置
ENABLE_METRICS=true
METRICS_PORT=9090
LOG_LEVEL=warn
```

### 2. Docker部署

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# 复制package.json和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建项目
RUN pnpm build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pnpm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/saas_core
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=saas_core
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 3. Kubernetes部署

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: saas-core
spec:
  replicas: 3
  selector:
    matchLabels:
      app: saas-core
  template:
    metadata:
      labels:
        app: saas-core
    spec:
      containers:
      - name: saas-core
        image: saas-core:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: saas-core-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: saas-core-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## 监控和日志

### 1. 健康检查

```bash
# 检查应用状态
curl http://localhost:3000/health

# 检查数据库连接
curl http://localhost:3000/health/database

# 检查缓存连接
curl http://localhost:3000/health/cache
```

### 2. 指标监控

```bash
# 获取应用指标
curl http://localhost:9090/metrics
```

### 3. 日志查看

```bash
# 查看应用日志
docker logs saas-core-app

# 查看数据库日志
docker logs saas-core-db

# 查看缓存日志
docker logs saas-core-redis
```

## 故障排除

### 1. 常见问题

#### 数据库连接失败

```bash
# 检查数据库状态
docker ps | grep postgres

# 检查数据库连接
psql -h localhost -U postgres -d saas_core
```

#### 缓存连接失败

```bash
# 检查Redis状态
docker ps | grep redis

# 检查Redis连接
redis-cli ping
```

#### 权限问题

```bash
# 检查文件权限
ls -la libs/saas-core/

# 修复权限
chmod -R 755 libs/saas-core/
```

### 2. 调试模式

```bash
# 启用调试模式
DEBUG=saas-core:* pnpm dev

# 启用详细日志
LOG_LEVEL=debug pnpm dev
```

## 支持和贡献

### 1. 获取帮助

- **文档**: 查看项目文档
- **问题**: 在GitHub Issues中报告问题
- **讨论**: 在GitHub Discussions中参与讨论

### 2. 贡献代码

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

### 3. 开发规范

- 遵循Clean Architecture原则
- 使用@hl8内核组件
- 编写完整的测试用例
- 遵循TSDoc注释规范
- 使用中文注释和文档

## 下一步

1. **Phase 2**: 生成任务分解（tasks.md）
2. **实施**: 开始具体的开发工作
3. **测试**: 编写和运行测试用例
4. **部署**: 部署到生产环境

## 相关资源

- [项目文档](../docs/)
- [API文档](./contracts/)
- [数据模型](./data-model.md)
- [研究结果](./research.md)
- [实施计划](./plan.md)

---

**注意**: 本指南基于当前的项目状态编写，随着项目的发展可能会有所更新。请定期查看最新版本。
