# SAAS Core Module Quick Start Guide

**Date**: 2024-12-19  
**Feature**: SAAS Core Module Redevelopment  
**Phase**: 1 - Design

## 概述

本快速开始指南将帮助您快速了解和使用重新开发的SAAS Core模块。该模块采用Clean Architecture + DDD + CQRS + 事件溯源 + 事件驱动架构的混合架构模式，使用@hl8内核组件作为基础。

## 架构概览

### 四层架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    接口层 (Interface)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Controllers │ │     DTOs    │ │   Guards    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   应用层 (Application)                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  Commands  │ │   Queries   │ │  Use Cases  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                  基础设施层 (Infrastructure)                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │Repositories│ │   Services  │ │   Adapters  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    领域层 (Domain)                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  Entities   │ │ Aggregates │ │Value Objects│          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### 多层级数据隔离架构

```
平台级 (Platform)
    ↓
租户级 (Tenant) - 企业租户、社群租户、团队租户、个人租户
    ↓
组织级 (Organization) - 专业委员会、项目团队、质量控制小组、绩效管理小组
    ↓
部门级 (Department) - 最多7层嵌套的纵向管理结构
    ↓
用户级 (User) - 平台用户、租户用户、系统用户
```

## 核心概念

### 1. 租户 (Tenant)

租户是独立客户单位，具有隔离的数据空间和配置环境。

**租户类型**:

- `ENTERPRISE`: 企业租户
- `COMMUNITY`: 社群租户
- `TEAM`: 团队租户
- `PERSONAL`: 个人租户

**租户状态**:

- `TRIAL`: 试用期
- `ACTIVE`: 活跃
- `SUSPENDED`: 暂停
- `EXPIRED`: 过期
- `DELETED`: 已删除

**资源限制**:

- `FREE`: 5用户/100MB/1组织
- `BASIC`: 50用户/1GB/2组织
- `PROFESSIONAL`: 500用户/10GB/10组织
- `ENTERPRISE`: 10,000用户/100GB/100组织
- `CUSTOM`: 无限制

### 2. 组织 (Organization)

组织是租户内的横向管理单位，用于特定功能。

**组织类型**:

- `COMMITTEE`: 专业委员会
- `PROJECT_TEAM`: 项目管理团队
- `QUALITY_GROUP`: 质量控制小组
- `PERFORMANCE_GROUP`: 绩效管理小组

### 3. 部门 (Department)

部门是组织内的纵向管理单位，具有层级结构。

**特性**:

- 最多支持7层嵌套
- 具有父子关系
- 路径跟踪
- 层级管理

### 4. 用户 (User)

用户是系统使用者，按来源、类型、角色、状态和归属分类。

**用户来源**:

- `PLATFORM`: 平台用户
- `TENANT`: 租户用户
- `SYSTEM`: 系统用户

**用户角色**:

- `PLATFORM_ADMIN`: 平台管理员
- `TENANT_ADMIN`: 租户管理员
- `ORG_ADMIN`: 组织管理员
- `DEPT_ADMIN`: 部门管理员
- `USER`: 普通用户

## 快速开始

### 1. 环境准备

确保您的开发环境满足以下要求：

```bash
# Node.js版本要求
node --version  # >= 20.0.0

# pnpm版本要求
pnpm --version  # >= 8.0.0

# TypeScript版本要求
npx tsc --version  # >= 5.9.2
```

### 2. 安装依赖

```bash
# 安装项目依赖
pnpm install

# 构建@hl8内核组件
pnpm build:kernel

# 构建saas-core模块
pnpm build:saas-core
```

### 3. 配置数据库

#### PostgreSQL配置（默认）

```typescript
// 数据库配置
const databaseConfig = {
  type: "postgresql",
  host: "localhost",
  port: 5432,
  username: "saas_user",
  password: "saas_password",
  database: "saas_platform",
  entities: [
    /* 实体类 */
  ],
  synchronize: false, // 生产环境必须为false
  logging: true,
  // 启用行级安全策略
  extra: {
    "row-level-security": true,
  },
};
```

#### MongoDB配置（可选）

```typescript
// MongoDB配置
const mongoConfig = {
  type: "mongodb",
  host: "localhost",
  port: 27017,
  database: "saas_platform",
  entities: [
    /* 实体类 */
  ],
  synchronize: false,
  logging: true,
};
```

### 4. 初始化应用

```typescript
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { SaasCoreModule } from "@hl8/saas-core";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    SaasCoreModule,
    new FastifyAdapter(),
  );

  // 启用CORS
  app.enableCors();

  // 启用全局前缀
  app.setGlobalPrefix("api/v1");

  // 启用Swagger文档
  if (process.env.NODE_ENV !== "production") {
    const { SwaggerModule, DocumentBuilder } = await import("@nestjs/swagger");
    const config = new DocumentBuilder()
      .setTitle("SAAS Core API")
      .setDescription("SAAS Core模块API文档")
      .setVersion("1.0.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);
  }

  await app.listen(3000, "0.0.0.0");
  console.log("SAAS Core服务已启动: http://localhost:3000");
}

bootstrap();
```

## 核心功能使用

### 1. 租户管理

#### 创建租户

```typescript
import { TenantService } from "@hl8/saas-core";

// 创建租户
const tenant = await tenantService.createTenant({
  name: "示例企业",
  type: "ENTERPRISE",
  description: "示例企业的租户描述",
  configuration: {
    isolationStrategy: "ROW_LEVEL_SECURITY",
    resourceLimits: {
      maxUsers: 100,
      maxStorage: 1024,
      maxOrganizations: 10,
      maxApiCalls: 10000,
    },
  },
});
```

#### 查询租户

```typescript
// 获取租户列表
const tenants = await tenantService.getTenants({
  page: 1,
  limit: 20,
  type: "ENTERPRISE",
  status: "ACTIVE",
});

// 获取租户详情
const tenant = await tenantService.getTenantById(tenantId);
```

#### 更新租户

```typescript
// 更新租户信息
const updatedTenant = await tenantService.updateTenant(tenantId, {
  name: "更新后的企业名称",
  description: "更新后的描述",
  status: "ACTIVE",
});
```

### 2. 组织管理

#### 创建组织

```typescript
import { OrganizationService } from "@hl8/saas-core";

// 创建组织
const organization = await organizationService.createOrganization(tenantId, {
  name: "技术委员会",
  type: "COMMITTEE",
  description: "负责技术决策的委员会",
  sharingLevel: "TENANT",
});
```

#### 查询组织

```typescript
// 获取组织列表
const organizations = await organizationService.getOrganizations(tenantId, {
  page: 1,
  limit: 20,
  type: "COMMITTEE",
});

// 获取组织详情
const organization =
  await organizationService.getOrganizationById(organizationId);
```

### 3. 部门管理

#### 创建部门

```typescript
import { DepartmentService } from "@hl8/saas-core";

// 创建根部门
const rootDepartment = await departmentService.createDepartment(
  organizationId,
  {
    name: "技术部",
    description: "负责技术开发的部门",
    sharingLevel: "DEPARTMENT",
  },
);

// 创建子部门
const subDepartment = await departmentService.createDepartment(organizationId, {
  name: "前端开发组",
  description: "负责前端开发的组",
  parentId: rootDepartment.id,
  sharingLevel: "DEPARTMENT",
});
```

#### 查询部门层级

```typescript
// 获取部门层级结构
const hierarchy =
  await departmentService.getDepartmentHierarchy(organizationId);

// 获取部门列表
const departments = await departmentService.getDepartments(organizationId, {
  page: 1,
  limit: 20,
  parentId: rootDepartment.id,
});
```

### 4. 用户管理

#### 创建用户

```typescript
import { UserService } from "@hl8/saas-core";

// 创建用户
const user = await userService.createUser({
  email: "user@example.com",
  username: "john_doe",
  source: "TENANT",
  type: "ENTERPRISE",
  role: "ORG_ADMIN",
  profile: {
    firstName: "John",
    lastName: "Doe",
    phone: "+86-138-0000-0000",
  },
});
```

#### 用户加入组织

```typescript
// 用户加入组织
await userService.joinOrganization(userId, {
  organizationId: organizationId,
  departmentId: departmentId,
});

// 用户离开组织
await userService.leaveOrganization(userId, organizationId);
```

#### 查询用户

```typescript
// 获取用户列表
const users = await userService.getUsers({
  page: 1,
  limit: 20,
  organizationId: organizationId,
  role: "ORG_ADMIN",
});

// 获取用户详情
const user = await userService.getUserById(userId);
```

## 数据隔离使用

### 1. 隔离上下文

```typescript
import { IsolationContext } from "@hl8/saas-core";

// 创建隔离上下文
const context = new IsolationContext({
  tenantId: tenantId,
  organizationId: organizationId,
  departmentId: departmentId,
  userId: userId,
  sharingLevel: "DEPARTMENT",
});

// 构建数据库查询条件
const whereClause = context.buildWhereClause();
// 输出: "tenant_id = 'xxx' AND organization_id = 'xxx' AND department_id = 'xxx'"

// 构建缓存键
const cacheKey = context.buildCacheKey("user:list");
// 输出: "user:list:t:xxx:o:xxx:d:xxx"
```

### 2. 权限检查

```typescript
// 检查访问权限
const canAccess = context.canAccess(targetContext);
if (!canAccess) {
  throw new ForbiddenException("无权访问该资源");
}
```

## 事件驱动架构

### 1. 领域事件

```typescript
import { DomainEvent, TenantCreatedEvent } from "@hl8/saas-core";

// 发布领域事件
const event = new TenantCreatedEvent(
  tenantId,
  tenantName,
  tenantType,
  new Date(),
);

await eventBus.publish(event);
```

### 2. 事件处理

```typescript
import { EventHandler } from "@hl8/saas-core";

@EventHandler(TenantCreatedEvent)
export class TenantCreatedEventHandler {
  async handle(event: TenantCreatedEvent): Promise<void> {
    // 处理租户创建事件
    console.log(`租户已创建: ${event.tenantName}`);

    // 发送欢迎邮件
    await this.emailService.sendWelcomeEmail(event.tenantId);

    // 创建默认组织
    await this.organizationService.createDefaultOrganization(event.tenantId);
  }
}
```

## CQRS使用

### 1. 命令处理

```typescript
import { Command, CommandHandler } from "@hl8/saas-core";

// 创建租户命令
export class CreateTenantCommand {
  constructor(
    public readonly name: string,
    public readonly type: TenantType,
    public readonly description: string,
  ) {}
}

// 命令处理器
@CommandHandler(CreateTenantCommand)
export class CreateTenantHandler {
  async execute(command: CreateTenantCommand): Promise<Tenant> {
    // 执行创建租户的业务逻辑
    const tenant = await this.tenantService.createTenant({
      name: command.name,
      type: command.type,
      description: command.description,
    });

    return tenant;
  }
}
```

### 2. 查询处理

```typescript
import { Query, QueryHandler } from "@hl8/saas-core";

// 获取租户列表查询
export class GetTenantsQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly type?: TenantType,
  ) {}
}

// 查询处理器
@QueryHandler(GetTenantsQuery)
export class GetTenantsHandler {
  async execute(query: GetTenantsQuery): Promise<TenantListResponse> {
    // 执行查询逻辑
    const tenants = await this.tenantService.getTenants({
      page: query.page,
      limit: query.limit,
      type: query.type,
    });

    return tenants;
  }
}
```

## 测试指南

### 1. 单元测试

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { TenantService } from "@hl8/saas-core";

describe("TenantService", () => {
  let service: TenantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantService],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  it("应该能够创建租户", async () => {
    const tenantData = {
      name: "测试租户",
      type: "ENTERPRISE",
      description: "测试描述",
    };

    const tenant = await service.createTenant(tenantData);

    expect(tenant).toBeDefined();
    expect(tenant.name).toBe(tenantData.name);
    expect(tenant.type).toBe(tenantData.type);
  });
});
```

### 2. 集成测试

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { SaasCoreModule } from "@hl8/saas-core";

describe("SAAS Core Integration", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SaasCoreModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("应该能够通过API创建租户", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/v1/tenants")
      .send({
        name: "测试租户",
        type: "ENTERPRISE",
        description: "测试描述",
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.name).toBe("测试租户");
  });
});
```

## 性能优化

### 1. 数据库优化

```typescript
// 使用索引优化查询
@Entity()
@Index(["tenantId", "status"])
@Index(["organizationId", "type"])
export class Organization {
  // 实体定义
}

// 使用连接池
const dataSource = new DataSource({
  // 其他配置
  extra: {
    max: 20, // 最大连接数
    min: 5, // 最小连接数
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
  },
});
```

### 2. 缓存优化

```typescript
import { CacheService } from "@hl8/caching";

// 使用缓存
@Injectable()
export class TenantService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly tenantRepository: TenantRepository,
  ) {}

  async getTenantById(id: TenantId): Promise<Tenant> {
    const cacheKey = `tenant:${id.value}`;

    // 尝试从缓存获取
    let tenant = await this.cacheService.get<Tenant>(cacheKey);

    if (!tenant) {
      // 从数据库获取
      tenant = await this.tenantRepository.findById(id);

      if (tenant) {
        // 缓存结果
        await this.cacheService.set(cacheKey, tenant, 3600); // 1小时
      }
    }

    return tenant;
  }
}
```

## 监控和日志

### 1. 日志配置

```typescript
import { Logger } from "@hl8/nestjs-fastify";

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  async createTenant(data: CreateTenantData): Promise<Tenant> {
    this.logger.log(`开始创建租户: ${data.name}`);

    try {
      const tenant = await this.tenantRepository.save(new Tenant(data));
      this.logger.log(`租户创建成功: ${tenant.id.value}`);
      return tenant;
    } catch (error) {
      this.logger.error(`租户创建失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

### 2. 性能监控

```typescript
import { PerformanceMonitor } from "@hl8/saas-core";

@Injectable()
export class TenantService {
  constructor(private readonly performanceMonitor: PerformanceMonitor) {}

  async createTenant(data: CreateTenantData): Promise<Tenant> {
    const startTime = Date.now();

    try {
      const tenant = await this.tenantRepository.save(new Tenant(data));

      // 记录性能指标
      this.performanceMonitor.recordMetric(
        "tenant.creation.time",
        Date.now() - startTime,
      );
      this.performanceMonitor.incrementCounter("tenant.creation.success");

      return tenant;
    } catch (error) {
      this.performanceMonitor.incrementCounter("tenant.creation.error");
      throw error;
    }
  }
}
```

## 故障排除

### 1. 常见问题

**问题**: 租户创建失败
**解决方案**: 检查租户名称是否唯一，资源限制是否足够

**问题**: 数据隔离不生效
**解决方案**: 确保所有查询都使用IsolationContext

**问题**: 事件未触发
**解决方案**: 检查事件处理器是否正确注册

### 2. 调试技巧

```typescript
// 启用调试日志
const logger = new Logger("DEBUG");
logger.debug("调试信息", { context: "TenantService" });

// 使用断点调试
debugger; // 在代码中设置断点

// 性能分析
console.time("tenant-creation");
await tenantService.createTenant(data);
console.timeEnd("tenant-creation");
```

## 下一步

1. **深入学习**: 阅读完整的API文档和架构设计文档
2. **实践开发**: 基于本指南开发您的业务功能
3. **性能优化**: 根据实际使用情况优化性能
4. **监控部署**: 配置监控和日志系统
5. **扩展功能**: 基于核心模块开发更多业务功能

## 支持

如果您在使用过程中遇到问题，请：

1. 查看本文档的故障排除部分
2. 检查GitHub Issues
3. 联系技术支持团队
4. 参与社区讨论

---

**注意**: 本指南基于SAAS Core模块的重新开发版本，使用@hl8内核组件作为基础。请确保您使用的是最新版本的模块。
