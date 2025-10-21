# 数据隔离实现指南

## 📋 概述

本文档提供了 HL8 AI SaaS 平台数据隔离机制的详细实现指南，包括代码示例、配置说明和最佳实践。

## 🏗️ 核心组件

### 1. 领域层核心 (Domain Kernel)

#### IsolationContext 实体

```typescript
// 核心隔离上下文实体
export class IsolationContext {
  private constructor(
    public readonly tenantId?: TenantId,
    public readonly organizationId?: OrganizationId,
    public readonly departmentId?: DepartmentId,
    public readonly userId?: UserId,
  ) {
    this.validate();
  }

  // 工厂方法
  static platform(): IsolationContext
  static tenant(tenantId: TenantId): IsolationContext
  static organization(tenantId: TenantId, organizationId: OrganizationId): IsolationContext
  static department(tenantId: TenantId, organizationId: OrganizationId, departmentId: DepartmentId): IsolationContext
  static user(userId: UserId, tenantId?: TenantId): IsolationContext

  // 业务方法
  getIsolationLevel(): IsolationLevel
  canAccess(targetContext: IsolationContext, sharingLevel: SharingLevel): boolean
  buildCacheKey(namespace: string, key: string): string
  buildLogContext(): Record<string, string>
  buildWhereClause(alias?: string): Record<string, any>
}
```

#### 隔离级别枚举

```typescript
export enum IsolationLevel {
  PLATFORM = "platform",
  TENANT = "tenant", 
  ORGANIZATION = "organization",
  DEPARTMENT = "department",
  USER = "user",
}

export enum SharingLevel {
  PLATFORM = "platform",
  TENANT = "tenant",
  ORGANIZATION = "organization", 
  DEPARTMENT = "department",
  USER = "user",
}
```

### 2. NestJS 集成层 (Framework Layer)

#### 隔离上下文服务

```typescript
@Injectable()
export class IsolationContextService implements IIsolationContextProvider {
  constructor(private readonly cls: ClsService) {}

  getIsolationContext(): IsolationContext | undefined {
    return this.cls.get(ISOLATION_CONTEXT_KEY);
  }

  setIsolationContext(context: IsolationContext): void {
    this.cls.set(ISOLATION_CONTEXT_KEY, context);
  }

  clearIsolationContext(): void {
    this.cls.set(ISOLATION_CONTEXT_KEY, undefined);
  }
}
```

#### 多层级隔离服务

```typescript
@Injectable()
export class MultiLevelIsolationService implements IIsolationValidator {
  constructor(private readonly contextService: IsolationContextService) {}

  validateIsolationLevel(requiredLevel: IsolationLevel): boolean {
    const context = this.contextService.getIsolationContext();
    if (!context) return false;
    
    const currentLevel = context.getIsolationLevel();
    return this.compareLevels(currentLevel, requiredLevel) >= 0;
  }

  checkDataAccess(dataContext: IsolationContext, isShared: boolean, sharingLevel?: SharingLevel): boolean {
    const userContext = this.contextService.getIsolationContext();
    if (!userContext) return false;
    
    return userContext.canAccess(dataContext, sharingLevel);
  }
}
```

#### 隔离守卫

```typescript
@Injectable()
export class IsolationGuard implements CanActivate {
  constructor(
    private readonly isolationService: MultiLevelIsolationService,
    private readonly reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredLevel = this.reflector.get<IsolationLevel>('isolationLevel', context.getHandler());
    if (!requiredLevel) return true;
    
    return this.isolationService.validateIsolationLevel(requiredLevel);
  }
}
```

#### 装饰器

```typescript
// 当前上下文装饰器
export const CurrentContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IsolationContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.isolationContext;
  }
);

// 隔离级别装饰器
export const RequireLevel = (level: IsolationLevel) => SetMetadata('isolationLevel', level);
```

#### 中间件

```typescript
@Injectable()
export class IsolationExtractionMiddleware implements NestMiddleware {
  constructor(private readonly contextService: IsolationContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const context = this.extractContextFromRequest(req);
    this.contextService.setIsolationContext(context);
    req.isolationContext = context;
    next();
  }

  private extractContextFromRequest(req: Request): IsolationContext {
    // 从请求头、JWT token、查询参数等提取隔离信息
    const tenantId = req.headers['x-tenant-id'] as string;
    const organizationId = req.headers['x-organization-id'] as string;
    const departmentId = req.headers['x-department-id'] as string;
    const userId = req.user?.id;

    if (departmentId && organizationId && tenantId) {
      return IsolationContext.department(
        TenantId.create(tenantId),
        OrganizationId.create(organizationId),
        DepartmentId.create(departmentId)
      );
    } else if (organizationId && tenantId) {
      return IsolationContext.organization(
        TenantId.create(tenantId),
        OrganizationId.create(organizationId)
      );
    } else if (tenantId) {
      return IsolationContext.tenant(TenantId.create(tenantId));
    } else if (userId) {
      return IsolationContext.user(UserId.create(userId));
    } else {
      return IsolationContext.platform();
    }
  }
}
```

### 3. 基础设施层 (Infrastructure Layer)

#### 隔离上下文管理器

```typescript
@Injectable()
export class IsolationContextManager implements IIsolationContextManager {
  private currentContext: IsolationContext | null = null;
  private contextHistory: IsolationContext[] = [];
  private maxHistorySize = 100;

  createContext(
    tenantId: string,
    organizationId?: string,
    departmentId?: string,
    userId?: string
  ): IsolationContext {
    if (userId && departmentId && organizationId) {
      return IsolationContext.department(
        TenantId.create(tenantId),
        OrganizationId.create(organizationId),
        DepartmentId.create(departmentId)
      );
    } else if (userId && organizationId) {
      return IsolationContext.organization(
        TenantId.create(tenantId),
        OrganizationId.create(organizationId)
      );
    } else if (userId) {
      return IsolationContext.user(
        UserId.create(userId),
        TenantId.create(tenantId)
      );
    } else if (tenantId) {
      return IsolationContext.tenant(TenantId.create(tenantId));
    } else {
      return IsolationContext.platform();
    }
  }

  setCurrentContext(context: IsolationContext): void {
    if (!this.validateContext(context)) {
      throw new Error('无效的隔离上下文');
    }
    this.currentContext = context;
    this.addToHistory(context);
  }

  getCurrentContext(): IsolationContext | null {
    return this.currentContext;
  }
}
```

#### 访问控制服务

```typescript
@Injectable()
export class AccessControlService implements IAccessControlService {
  async validateAccess(context: IsolationContext, resource: any): Promise<boolean> {
    const resourceContext = this.extractResourceContext(resource);
    if (!resourceContext) return false;
    
    return context.canAccess(resourceContext, SharingLevel.TENANT);
  }

  private extractResourceContext(resource: any): IsolationContext | null {
    if (resource.tenantId) {
      if (resource.departmentId && resource.organizationId) {
        return IsolationContext.department(
          resource.tenantId,
          resource.organizationId,
          resource.departmentId
        );
      } else if (resource.organizationId) {
        return IsolationContext.organization(
          resource.tenantId,
          resource.organizationId
        );
      } else {
        return IsolationContext.tenant(resource.tenantId);
      }
    } else if (resource.userId) {
      return IsolationContext.user(resource.userId, resource.tenantId);
    }
    return IsolationContext.platform();
  }
}
```

#### 审计日志服务

```typescript
@Injectable()
export class AuditLogService implements IAuditLogService {
  constructor(
    private readonly databaseAdapter: IDatabaseAdapter,
    private readonly loggingService?: ILoggingService
  ) {}

  async logAccess(
    context: IsolationContext,
    action: string,
    resource: string,
    details?: any
  ): Promise<void> {
    const auditLog = {
      tenantId: context.tenantId?.getValue(),
      organizationId: context.organizationId?.getValue(),
      departmentId: context.departmentId?.getValue(),
      userId: context.userId?.getValue(),
      action,
      resource,
      details,
      timestamp: new Date(),
      ipAddress: this.getCurrentIpAddress(),
      userAgent: this.getCurrentUserAgent()
    };

    await this.databaseAdapter.insert('audit_logs', auditLog);
    
    if (this.loggingService) {
      this.loggingService.info('Audit log created', auditLog);
    }
  }
}
```

## 🔧 配置说明

### 1. NestJS 模块配置

```typescript
// isolation.module.ts
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true }
    })
  ],
  providers: [
    IsolationContextService,
    MultiLevelIsolationService,
    IsolationGuard,
    IsolationExtractionMiddleware
  ],
  exports: [
    IsolationContextService,
    MultiLevelIsolationService,
    IsolationGuard
  ]
})
export class IsolationModule {}
```

### 2. 应用配置

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 注册隔离中间件
  app.use(new IsolationExtractionMiddleware());
  
  await app.listen(3000);
}
```

### 3. 数据库配置

```typescript
// database.config.ts
export const databaseConfig = {
  isolation: {
    enabled: true,
    level: 'READ_COMMITTED',
    contextTable: 'isolation_contexts',
    auditTable: 'audit_logs'
  },
  connection: {
    pool: {
      min: 2,
      max: 10,
      isolation: true
    }
  }
};
```

## 🚀 使用示例

### 1. 控制器中使用

```typescript
@Controller('users')
@UseGuards(IsolationGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RequireLevel(IsolationLevel.TENANT)
  async getUsers(@CurrentContext() context: IsolationContext) {
    return this.userService.findByContext(context);
  }

  @Get(':id')
  @RequireLevel(IsolationLevel.USER)
  async getUser(
    @Param('id') id: string,
    @CurrentContext() context: IsolationContext
  ) {
    return this.userService.findById(id, context);
  }

  @Post()
  @RequireLevel(IsolationLevel.ORGANIZATION)
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentContext() context: IsolationContext
  ) {
    return this.userService.create(createUserDto, context);
  }
}
```

### 2. 服务中使用

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly accessControl: AccessControlService,
    private readonly auditLog: AuditLogService
  ) {}

  async findById(id: string, context: IsolationContext): Promise<User> {
    // 权限检查
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const canAccess = await this.accessControl.validateAccess(context, user);
    if (!canAccess) {
      throw new ForbiddenException('Access denied');
    }

    // 记录访问日志
    await this.auditLog.logAccess(context, 'READ', 'user', { userId: id });

    return user;
  }

  async findByContext(context: IsolationContext): Promise<User[]> {
    const whereClause = context.buildWhereClause('u');
    return this.userRepository.findByConditions(whereClause);
  }

  async create(createUserDto: CreateUserDto, context: IsolationContext): Promise<User> {
    // 验证权限
    if (!context.isOrganizationLevel() && !context.isPlatformLevel()) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const user = await this.userRepository.create({
      ...createUserDto,
      tenantId: context.tenantId?.getValue(),
      organizationId: context.organizationId?.getValue(),
      departmentId: context.departmentId?.getValue()
    });

    // 记录创建日志
    await this.auditLog.logAccess(context, 'CREATE', 'user', { userId: user.id });

    return user;
  }
}
```

### 3. 数据库查询中使用

```typescript
@Injectable()
export class UserRepository {
  constructor(private readonly database: DatabaseService) {}

  async findById(id: string, context: IsolationContext): Promise<User | null> {
    const whereClause = context.buildWhereClause('u');
    const query = `
      SELECT * FROM users u 
      WHERE u.id = ? AND ${Object.keys(whereClause).map(key => `${key} = ?`).join(' AND ')}
    `;
    
    const params = [id, ...Object.values(whereClause)];
    const result = await this.database.query(query, params);
    
    return result.rows[0] || null;
  }

  async findByConditions(conditions: Record<string, any>): Promise<User[]> {
    const whereClause = Object.entries(conditions)
      .map(([key, value]) => `${key} = ?`)
      .join(' AND ');
    
    const query = `SELECT * FROM users WHERE ${whereClause}`;
    const params = Object.values(conditions);
    
    const result = await this.database.query(query, params);
    return result.rows;
  }
}
```

### 4. 缓存中使用

```typescript
@Injectable()
export class CacheService {
  constructor(private readonly redis: Redis) {}

  async get<T>(key: string, context: IsolationContext): Promise<T | null> {
    const cacheKey = context.buildCacheKey('data', key);
    const value = await this.redis.get(cacheKey);
    return value ? JSON.parse(value) : null;
  }

  async set<T>(key: string, value: T, context: IsolationContext, ttl?: number): Promise<void> {
    const cacheKey = context.buildCacheKey('data', key);
    const serialized = JSON.stringify(value);
    
    if (ttl) {
      await this.redis.setex(cacheKey, ttl, serialized);
    } else {
      await this.redis.set(cacheKey, serialized);
    }
  }
}
```

## 🧪 测试示例

### 1. 单元测试

```typescript
describe('IsolationContext', () => {
  it('should create tenant context', () => {
    const context = IsolationContext.tenant(TenantId.create('tenant-123'));
    expect(context.getIsolationLevel()).toBe(IsolationLevel.TENANT);
    expect(context.tenantId?.getValue()).toBe('tenant-123');
  });

  it('should validate access permissions', () => {
    const userContext = IsolationContext.department(
      TenantId.create('tenant-123'),
      OrganizationId.create('org-456'),
      DepartmentId.create('dept-789')
    );
    
    const dataContext = IsolationContext.organization(
      TenantId.create('tenant-123'),
      OrganizationId.create('org-456')
    );
    
    expect(userContext.canAccess(dataContext, SharingLevel.ORGANIZATION)).toBe(true);
  });
});
```

### 2. 集成测试

```typescript
describe('UserController Integration', () => {
  let app: INestApplication;
  let contextService: IsolationContextService;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    contextService = app.get(IsolationContextService);
    await app.init();
  });

  it('should return users for tenant context', async () => {
    const context = IsolationContext.tenant(TenantId.create('tenant-123'));
    contextService.setIsolationContext(context);

    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    expect(response.body).toHaveLength(2);
  });
});
```

## 📊 性能监控

### 1. 指标收集

```typescript
@Injectable()
export class IsolationMetricsService {
  private metrics = new Map<string, number>();

  recordAccess(context: IsolationContext, duration: number): void {
    const level = context.getIsolationLevel();
    const key = `isolation.access.${level}`;
    this.metrics.set(key, (this.metrics.get(key) || 0) + 1);
    
    const durationKey = `isolation.duration.${level}`;
    this.metrics.set(durationKey, (this.metrics.get(durationKey) || 0) + duration);
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}
```

### 2. 健康检查

```typescript
@Injectable()
export class IsolationHealthService {
  constructor(
    private readonly contextService: IsolationContextService,
    private readonly accessControl: AccessControlService
  ) {}

  async healthCheck(): Promise<boolean> {
    try {
      const context = this.contextService.getIsolationContext();
      if (!context) return false;
      
      const isValid = context.getIsolationLevel() !== undefined;
      return isValid;
    } catch (error) {
      return false;
    }
  }
}
```

## 🔒 安全最佳实践

### 1. 权限验证

```typescript
// 始终在数据访问前进行权限检查
async accessData(dataId: string, context: IsolationContext): Promise<any> {
  // 1. 获取数据
  const data = await this.getData(dataId);
  
  // 2. 检查权限
  const canAccess = await this.accessControl.validateAccess(context, data);
  if (!canAccess) {
    throw new ForbiddenException('Access denied');
  }
  
  // 3. 记录访问
  await this.auditLog.logAccess(context, 'READ', 'data', { dataId });
  
  return data;
}
```

### 2. 数据过滤

```typescript
// 使用隔离上下文过滤数据
async getFilteredData(context: IsolationContext): Promise<any[]> {
  const whereClause = context.buildWhereClause('d');
  return this.database.query(`
    SELECT * FROM data d 
    WHERE ${Object.keys(whereClause).map(key => `${key} = ?`).join(' AND ')}
  `, Object.values(whereClause));
}
```

### 3. 缓存安全

```typescript
// 使用隔离的缓存键
async getCachedData(key: string, context: IsolationContext): Promise<any> {
  const cacheKey = context.buildCacheKey('data', key);
  return this.cache.get(cacheKey);
}
```

## 📚 相关资源

- [数据隔离机制设计文档](./DATA_ISOLATION_MECHANISM.md)
- [隔离架构设计文档](./ISOLATION_ARCHITECTURE.md)
- [重构报告文档](./REFACTORING_REPORT.md)
- [API 文档](./API_DOCUMENTATION.md)

---

**文档版本**: 1.0.0  
**最后更新**: 2024年12月  
**维护者**: HL8 开发团队
