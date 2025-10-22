# 数据隔离机制设计文档

## 📋 概述

本文档详细阐述了 HL8 AI SaaS 平台的数据隔离机制，包括多层级隔离架构、权限控制、安全策略以及实现细节。

## 🎯 设计目标

### 核心目标

- **数据安全**: 确保不同租户、组织、部门、用户的数据完全隔离
- **性能优化**: 最小化隔离机制对系统性能的影响
- **可扩展性**: 支持未来业务增长和架构演进
- **合规性**: 满足数据保护和隐私法规要求

### 业务需求

- 支持多租户 SaaS 架构
- 支持组织级数据共享
- 支持部门级数据隔离
- 支持用户级数据隐私保护
- 支持平台级数据管理

## 🏗️ 架构设计

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│                  (业务应用层)                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   User API  │ │  Admin API  │ │  System API │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 Framework Layer                              │
│              @hl8/nestjs-isolation                          │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │   Decorators    │ │     Guards      │ │   Middleware   │ │
│  │ @CurrentContext │ │ IsolationGuard  │ │ExtractionMdlwr │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Infrastructure Layer                           │
│           @hl8/infrastructure-kernel                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │ Context Manager│ │ Access Control  │ │  Audit Logging │ │
│  │ Security Monitor│ │  Cache Service  │ │  Database Svc  │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  Domain Layer                               │
│                @hl8/domain-kernel                           │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │IsolationContext │ │  IsolationLevel │ │  SharingLevel  │ │
│  │   Value Objects │ │   Business Rules │ │   Validation   │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 依赖关系

```
infrastructure-kernel → nestjs-isolation → domain-kernel
```

## 🔐 隔离层级

### 1. 平台级 (PLATFORM)

- **范围**: 整个平台
- **权限**: 可访问所有数据
- **用途**: 系统管理、平台配置
- **示例**: 系统管理员、平台监控

```typescript
const platformContext = IsolationContext.platform();
// 可以访问所有租户、组织、部门、用户的数据
```

### 2. 租户级 (TENANT)

- **范围**: 单个租户
- **权限**: 只能访问该租户的数据
- **用途**: 租户管理、租户级配置
- **示例**: 租户管理员、租户级报表

```typescript
const tenantContext = IsolationContext.tenant(TenantId.create("tenant-123"));
// 只能访问 tenant-123 的数据
```

### 3. 组织级 (ORGANIZATION)

- **范围**: 租户内的单个组织
- **权限**: 只能访问该组织及其下属部门的数据
- **用途**: 组织管理、组织级共享
- **示例**: 组织管理员、组织级报表

```typescript
const orgContext = IsolationContext.organization(
  TenantId.create("tenant-123"),
  OrganizationId.create("org-456"),
);
// 只能访问 tenant-123/org-456 及其下属部门的数据
```

### 4. 部门级 (DEPARTMENT)

- **范围**: 组织内的单个部门
- **权限**: 只能访问该部门的数据
- **用途**: 部门管理、部门级工作流
- **示例**: 部门管理员、部门级任务

```typescript
const deptContext = IsolationContext.department(
  TenantId.create("tenant-123"),
  OrganizationId.create("org-456"),
  DepartmentId.create("dept-789"),
);
// 只能访问 tenant-123/org-456/dept-789 的数据
```

### 5. 用户级 (USER)

- **范围**: 单个用户
- **权限**: 只能访问该用户的数据
- **用途**: 个人数据、用户隐私保护
- **示例**: 用户个人设置、个人文件

```typescript
const userContext = IsolationContext.user(
  UserId.create("user-001"),
  TenantId.create("tenant-123"),
);
// 只能访问 user-001 在 tenant-123 中的数据
```

## 🔒 权限控制机制

### 1. 访问权限验证

```typescript
// 检查用户是否可以访问数据
const canAccess = userContext.canAccess(dataContext, SharingLevel.TENANT);

// 权限检查流程
if (userContext.isPlatformLevel()) {
  return true; // 平台级可以访问所有数据
}

if (!dataContext.isShared) {
  return userContext.matches(dataContext); // 非共享数据必须完全匹配
}

return userContext.canAccessSharedData(dataContext, sharingLevel);
```

### 2. 共享级别控制

```typescript
enum SharingLevel {
  PLATFORM = "platform", // 平台级共享
  TENANT = "tenant", // 租户级共享
  ORGANIZATION = "organization", // 组织级共享
  DEPARTMENT = "department", // 部门级共享
  USER = "user", // 用户级共享
}
```

### 3. 数据过滤机制

```typescript
// 根据隔离上下文过滤数据
const filteredData = data.filter((item) => {
  const itemContext = extractContextFromItem(item);
  return userContext.canAccess(itemContext, item.sharingLevel);
});
```

## 🛡️ 安全策略

### 1. 数据访问控制

#### 数据库查询隔离

```typescript
// 自动添加 WHERE 条件
const whereClause = context.buildWhereClause("u");
// 结果: { 'u.tenantId': 'tenant-123', 'u.organizationId': 'org-456' }

const query = `
  SELECT * FROM users u 
  WHERE ${Object.keys(whereClause)
    .map((key) => `${key} = ?`)
    .join(" AND ")}
`;
```

#### 缓存键隔离

```typescript
// 自动生成隔离的缓存键
const cacheKey = context.buildCacheKey("users", "list");
// 结果: "tenant:tenant-123:org:org-456:users:list"
```

### 2. 审计日志

```typescript
// 自动记录访问日志
const auditLog = {
  userId: context.userId?.getValue(),
  tenantId: context.tenantId?.getValue(),
  organizationId: context.organizationId?.getValue(),
  departmentId: context.departmentId?.getValue(),
  action: "READ",
  resource: "users",
  timestamp: new Date(),
  ipAddress: request.ip,
  userAgent: request.headers["user-agent"],
};
```

### 3. 安全监控

```typescript
// 异常访问检测
if (accessAttempts > threshold) {
  securityMonitor.alert({
    type: "SUSPICIOUS_ACCESS",
    context: userContext,
    details: { attempts: accessAttempts, threshold },
  });
}
```

## 🔧 实现细节

### 1. NestJS 集成

#### 装饰器使用

```typescript
@Controller("users")
export class UserController {
  @Get()
  @RequireLevel(IsolationLevel.TENANT)
  async getUsers(@CurrentContext() context: IsolationContext) {
    return this.userService.findByContext(context);
  }
}
```

#### 守卫保护

```typescript
@Injectable()
export class IsolationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const requiredLevel = this.reflector.get(
      "isolationLevel",
      context.getHandler(),
    );

    return this.isolationService.validateLevel(
      request.isolationContext,
      requiredLevel,
    );
  }
}
```

#### 中间件提取

```typescript
@Injectable()
export class IsolationExtractionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const context = this.extractContextFromRequest(req);
    req.isolationContext = context;
    next();
  }
}
```

### 2. 基础设施服务

#### 上下文管理

```typescript
@Injectable()
export class IsolationContextManager {
  private currentContext: IsolationContext | null = null;

  createContext(tenantId: string, orgId?: string): IsolationContext {
    return IsolationContext.organization(
      TenantId.create(tenantId),
      OrganizationId.create(orgId),
    );
  }

  setCurrentContext(context: IsolationContext): void {
    this.currentContext = context;
  }
}
```

#### 访问控制

```typescript
@Injectable()
export class AccessControlService {
  async validateAccess(
    context: IsolationContext,
    resource: any,
  ): Promise<boolean> {
    const resourceContext = this.extractResourceContext(resource);
    return context.canAccess(resourceContext, SharingLevel.TENANT);
  }
}
```

### 3. 数据库集成

#### 查询构建器

```typescript
class IsolationQueryBuilder {
  buildQuery(baseQuery: string, context: IsolationContext): string {
    const whereClause = context.buildWhereClause();
    const conditions = Object.entries(whereClause)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(" AND ");

    return `${baseQuery} WHERE ${conditions}`;
  }
}
```

#### 事务隔离

```typescript
async executeInContext<T>(
  context: IsolationContext,
  operation: (trx: Transaction) => Promise<T>
): Promise<T> {
  return await this.database.transaction(async (trx) => {
    trx.setIsolationContext(context);
    return await operation(trx);
  });
}
```

## 📊 性能优化

### 1. 缓存策略

```typescript
// 多层级缓存键
const cacheKey = context.buildCacheKey("users", "list");
// 平台级: "platform:users:list"
// 租户级: "tenant:tenant-123:users:list"
// 组织级: "tenant:tenant-123:org:org-456:users:list"
```

### 2. 查询优化

```typescript
// 索引优化
CREATE INDEX idx_users_tenant_org ON users(tenant_id, organization_id);
CREATE INDEX idx_users_tenant_org_dept ON users(tenant_id, organization_id, department_id);
```

### 3. 连接池管理

```typescript
// 隔离连接池
const pool = new ConnectionPool({
  isolation: true,
  maxConnections: 100,
  isolationContext: context,
});
```

## 🔍 监控和调试

### 1. 日志记录

```typescript
// 结构化日志
const logContext = context.buildLogContext();
logger.info("Data access", {
  ...logContext,
  action: "READ",
  resource: "users",
  duration: 150,
});
```

### 2. 指标收集

```typescript
// 性能指标
const metrics = {
  isolationLevel: context.getIsolationLevel(),
  accessCount: this.getAccessCount(context),
  responseTime: this.getResponseTime(context),
  errorRate: this.getErrorRate(context),
};
```

### 3. 健康检查

```typescript
// 隔离健康检查
async healthCheck(): Promise<boolean> {
  const checks = await Promise.all([
    this.database.healthCheck(),
    this.cache.healthCheck(),
    this.isolation.healthCheck()
  ]);

  return checks.every(check => check === true);
}
```

## 🚀 使用示例

### 1. 基本使用

```typescript
// 创建隔离上下文
const context = IsolationContext.organization(
  TenantId.create("tenant-123"),
  OrganizationId.create("org-456"),
);

// 检查权限
const canAccess = context.canAccess(targetContext, SharingLevel.TENANT);

// 生成查询条件
const whereClause = context.buildWhereClause("u");
```

### 2. 在服务中使用

```typescript
@Injectable()
export class UserService {
  async findById(id: string, context: IsolationContext): Promise<User> {
    // 权限检查
    if (!context.canAccess(targetContext, SharingLevel.TENANT)) {
      throw new Error("Access denied");
    }

    // 构建查询
    const whereClause = context.buildWhereClause("u");
    return this.repository.findById(id, whereClause);
  }
}
```

### 3. 在控制器中使用

```typescript
@Controller("users")
export class UserController {
  @Get()
  @RequireLevel(IsolationLevel.TENANT)
  async getUsers(@CurrentContext() context: IsolationContext) {
    return this.userService.findByContext(context);
  }
}
```

## 📈 最佳实践

### 1. 上下文管理

- 始终在请求开始时设置隔离上下文
- 使用依赖注入获取上下文服务
- 避免手动传递上下文参数

### 2. 权限检查

- 在数据访问前进行权限检查
- 使用领域模型的权限检查方法
- 记录所有权限检查结果

### 3. 性能优化

- 使用适当的缓存策略
- 优化数据库查询
- 监控性能指标

### 4. 安全考虑

- 定期审计访问日志
- 监控异常访问模式
- 实施最小权限原则

## 🔮 未来规划

### 1. 功能扩展

- 支持更细粒度的权限控制
- 支持动态权限配置
- 支持权限继承和委托

### 2. 性能优化

- 实现智能缓存策略
- 优化数据库查询
- 支持分布式隔离

### 3. 监控增强

- 实时性能监控
- 异常检测和告警
- 可视化监控面板

## 📚 相关文档

- [隔离架构设计](./ISOLATION_ARCHITECTURE.md)
- [重构报告](./REFACTORING_REPORT.md)
- [API 文档](./API_DOCUMENTATION.md)
- [部署指南](./DEPLOYMENT_GUIDE.md)

---

**文档版本**: 1.0.0  
**最后更新**: 2024年12月  
**维护者**: HL8 开发团队
