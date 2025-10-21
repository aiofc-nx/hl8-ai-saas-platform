# 接口层技术方案设计文档

## 📋 概述

本文档阐述了 HL8 AI SaaS 平台接口层的技术方案设计，包括架构设计、技术选型、实现策略和最佳实践。

## 🎯 设计目标

### 核心目标

- **统一接口**: 提供统一的 API 接口规范
- **高性能**: 支持高并发和低延迟
- **可扩展**: 支持微服务架构和水平扩展
- **安全性**: 完整的认证授权和数据隔离
- **易用性**: 提供友好的开发体验和文档

### 业务需求

- 支持多租户 SaaS 架构
- 支持 RESTful API 和 GraphQL
- 支持实时通信 (WebSocket)
- 支持文件上传和下载
- 支持 API 版本管理
- 支持 API 文档自动生成

## 🏗️ 架构设计

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Interface Layer                          │
│                  (接口层 - 最外层)                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   REST API  │ │   GraphQL   │ │  WebSocket  │           │
│  │  (Fastify) │ │  (Apollo)   │ │  (Socket.io)│           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   File API  │ │   Admin API  │ │   System API│           │
│  │  (Multer)   │ │  (AdminJS)   │ │  (Health)   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────┬───────────────────────────────────────┘
                      │ 依赖
┌─────────────────────▼───────────────────────────────────────┐
│                Application Layer                           │
│                 (应用层 - 第二层)                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Use Cases   │ │   Services  │ │   Handlers  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────┬───────────────────────────────────────┘
                      │ 依赖
┌─────────────────────▼───────────────────────────────────────┐
│                Infrastructure Layer                       │
│                (基础设施层 - 第三层)                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Database   │ │    Cache    │ │ Message Q   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────┬───────────────────────────────────────┘
                      │ 依赖
┌─────────────────────▼───────────────────────────────────────┐
│                   Domain Layer                             │
│                  (领域层 - 最内层)                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Entities   │ │AggregateRoot│ │Domain Events│           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈选择

| 技术 | 选择 | 理由 |
|------|------|------|
| **Web 框架** | Fastify | 高性能、低内存占用、TypeScript 支持 |
| **GraphQL** | Apollo Server | 功能完整、生态丰富、性能优秀 |
| **WebSocket** | Socket.io | 实时通信、自动重连、房间管理 |
| **文件处理** | Multer | 文件上传、流处理、内存优化 |
| **管理界面** | AdminJS | 自动生成、可定制、权限控制 |
| **API 文档** | Swagger/OpenAPI | 标准规范、自动生成、交互式 |
| **认证授权** | JWT + Passport | 无状态、可扩展、安全可靠 |
| **数据验证** | Zod | 类型安全、运行时验证、性能优秀 |

## 🔧 核心组件设计

### 1. REST API 设计

#### 控制器结构

```typescript
// 基础控制器
@Controller('api/v1')
export class BaseController {
  constructor(
    protected readonly isolationService: IsolationService,
    protected readonly validationService: ValidationService
  ) {}
}

// 用户控制器
@Controller('api/v1/users')
@UseGuards(IsolationGuard, AuthGuard)
export class UserController extends BaseController {
  @Get()
  @RequireLevel(IsolationLevel.TENANT)
  async getUsers(
    @CurrentContext() context: IsolationContext,
    @Query() query: GetUsersQuery
  ): Promise<PaginatedResponse<UserDto>> {
    return this.userUseCase.getUsers(context, query);
  }

  @Post()
  @RequireLevel(IsolationLevel.ORGANIZATION)
  async createUser(
    @CurrentContext() context: IsolationContext,
    @Body() createUserDto: CreateUserDto
  ): Promise<UserDto> {
    return this.userUseCase.createUser(context, createUserDto);
  }
}
```

#### 路由设计

```typescript
// 路由配置
const routes = {
  // 认证相关
  '/auth': {
    'POST /login': 'AuthController.login',
    'POST /logout': 'AuthController.logout',
    'POST /refresh': 'AuthController.refresh',
    'POST /register': 'AuthController.register'
  },
  
  // 用户管理
  '/users': {
    'GET /': 'UserController.getUsers',
    'POST /': 'UserController.createUser',
    'GET /:id': 'UserController.getUser',
    'PUT /:id': 'UserController.updateUser',
    'DELETE /:id': 'UserController.deleteUser'
  },
  
  // 组织管理
  '/organizations': {
    'GET /': 'OrganizationController.getOrganizations',
    'POST /': 'OrganizationController.createOrganization',
    'GET /:id': 'OrganizationController.getOrganization',
    'PUT /:id': 'OrganizationController.updateOrganization',
    'DELETE /:id': 'OrganizationController.deleteOrganization'
  }
};
```

### 2. GraphQL API 设计

#### Schema 定义

```typescript
// 用户类型
@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => IsolationLevel)
  isolationLevel: IsolationLevel;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

// 查询类型
@Resolver(() => User)
export class UserResolver {
  @Query(() => [User])
  @RequireLevel(IsolationLevel.TENANT)
  async users(
    @CurrentContext() context: IsolationContext,
    @Args() args: GetUsersArgs
  ): Promise<User[]> {
    return this.userUseCase.getUsers(context, args);
  }

  @Mutation(() => User)
  @RequireLevel(IsolationLevel.ORGANIZATION)
  async createUser(
    @CurrentContext() context: IsolationContext,
    @Args('input') input: CreateUserInput
  ): Promise<User> {
    return this.userUseCase.createUser(context, input);
  }
}
```

#### 订阅设计

```typescript
// 实时订阅
@Resolver(() => User)
export class UserSubscriptionResolver {
  @Subscription(() => User, {
    filter: (payload, variables, context) => {
      // 基于隔离上下文过滤
      return context.isolationContext.canAccess(payload.userContext);
    }
  })
  userUpdated(
    @CurrentContext() context: IsolationContext,
    @Args('userId') userId: string
  ): AsyncIterator<User> {
    return this.userUseCase.subscribeToUserUpdates(context, userId);
  }
}
```

### 3. WebSocket 设计

#### 连接管理

```typescript
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/ws'
})
export class AppGateway {
  constructor(
    private readonly isolationService: IsolationService,
    private readonly authService: AuthService
  ) {}

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomData
  ): Promise<void> {
    const context = await this.extractContext(client);
    const room = this.buildRoomName(context, data.roomType);
    await client.join(room);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MessageData
  ): Promise<void> {
    const context = await this.extractContext(client);
    const room = this.buildRoomName(context, data.roomType);
    client.to(room).emit('message', data);
  }
}
```

### 4. 文件处理设计

#### 文件上传

```typescript
@Controller('api/v1/files')
export class FileController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @CurrentContext() context: IsolationContext,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: FileUploadDto
  ): Promise<FileDto> {
    return this.fileUseCase.uploadFile(context, file, uploadDto);
  }

  @Get(':id/download')
  async downloadFile(
    @CurrentContext() context: IsolationContext,
    @Param('id') id: string
  ): Promise<StreamableFile> {
    const fileStream = await this.fileUseCase.downloadFile(context, id);
    return new StreamableFile(fileStream);
  }
}
```

## 🛡️ 安全设计

### 1. 认证授权

#### JWT 认证

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    
    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

#### 权限控制

```typescript
@Injectable()
export class PermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requiredPermission = this.reflector.get('permission', context.getHandler());
    
    return this.permissionService.hasPermission(user, requiredPermission);
  }
}
```

### 2. 数据隔离

#### 隔离中间件

```typescript
@Injectable()
export class IsolationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const context = this.extractIsolationContext(req);
    req.isolationContext = context;
    next();
  }

  private extractIsolationContext(req: Request): IsolationContext {
    const tenantId = req.headers['x-tenant-id'] as string;
    const organizationId = req.headers['x-organization-id'] as string;
    const departmentId = req.headers['x-department-id'] as string;
    const userId = req.user?.id;

    return this.isolationService.createContext(
      tenantId,
      organizationId,
      departmentId,
      userId
    );
  }
}
```

### 3. 数据验证

#### DTO 验证

```typescript
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(IsolationLevel)
  isolationLevel?: IsolationLevel;
}
```

#### 自定义验证器

```typescript
@ValidatorConstraint({ name: 'isValidIsolationLevel', async: false })
export class IsValidIsolationLevelConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const context = args.object['isolationContext'] as IsolationContext;
    return context.canAccess(value, SharingLevel.TENANT);
  }
}
```

## 📊 性能优化

### 1. 缓存策略

#### Redis 缓存

```typescript
@Injectable()
export class CacheService {
  constructor(private readonly redis: Redis) {}

  async get<T>(key: string, context: IsolationContext): Promise<T | null> {
    const cacheKey = context.buildCacheKey('api', key);
    const value = await this.redis.get(cacheKey);
    return value ? JSON.parse(value) : null;
  }

  async set<T>(key: string, value: T, context: IsolationContext, ttl = 3600): Promise<void> {
    const cacheKey = context.buildCacheKey('api', key);
    await this.redis.setex(cacheKey, ttl, JSON.stringify(value));
  }
}
```

#### 查询优化

```typescript
@Injectable()
export class QueryOptimizer {
  optimizeQuery(query: any, context: IsolationContext): any {
    // 添加隔离条件
    const whereClause = context.buildWhereClause();
    return { ...query, where: { ...query.where, ...whereClause } };
  }
}
```

### 2. 并发控制

#### 限流器

```typescript
@Injectable()
export class RateLimiter {
  constructor(private readonly redis: Redis) {}

  async checkLimit(key: string, limit: number, window: number): Promise<boolean> {
    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, window);
    }
    return current <= limit;
  }
}
```

#### 连接池

```typescript
@Injectable()
export class ConnectionPool {
  constructor(
    private readonly database: DatabaseService,
    private readonly redis: Redis
  ) {}

  async getConnection(context: IsolationContext): Promise<Connection> {
    const poolKey = this.buildPoolKey(context);
    return this.database.getConnection(poolKey);
  }
}
```

## 📚 API 文档

### 1. Swagger 集成

#### 配置

```typescript
const config = new DocumentBuilder()
  .setTitle('HL8 AI SaaS Platform API')
  .setDescription('企业级 SaaS 平台 API 文档')
  .setVersion('1.0.0')
  .addBearerAuth()
  .addTag('Authentication', '认证相关接口')
  .addTag('Users', '用户管理')
  .addTag('Organizations', '组织管理')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

#### 装饰器使用

```typescript
@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/v1/users')
export class UserController {
  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({ status: 200, description: '成功获取用户列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  async getUsers(@Query() query: GetUsersQuery): Promise<PaginatedResponse<UserDto>> {
    // 实现逻辑
  }
}
```

### 2. GraphQL 文档

#### Schema 文档

```typescript
@ObjectType()
@Description('用户信息')
export class User {
  @Field(() => ID, { description: '用户ID' })
  id: string;

  @Field({ description: '用户姓名' })
  name: string;

  @Field({ description: '用户邮箱' })
  email: string;
}
```

## 🧪 测试策略

### 1. 单元测试

#### 控制器测试

```typescript
describe('UserController', () => {
  let controller: UserController;
  let userUseCase: UserUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserUseCase,
          useValue: {
            getUsers: jest.fn(),
            createUser: jest.fn()
          }
        }
      ]
    }).compile();

    controller = module.get<UserController>(UserController);
    userUseCase = module.get<UserUseCase>(UserUseCase);
  });

  it('should return users', async () => {
    const mockUsers = [{ id: '1', name: 'Test User' }];
    jest.spyOn(userUseCase, 'getUsers').mockResolvedValue(mockUsers);

    const result = await controller.getUsers({}, mockContext);
    expect(result).toEqual(mockUsers);
  });
});
```

### 2. 集成测试

#### API 测试

```typescript
describe('User API Integration', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should create user', () => {
    return request(app.getHttpServer())
      .post('/api/v1/users')
      .set('Authorization', 'Bearer valid-token')
      .set('X-Tenant-Id', 'tenant-123')
      .send({
        name: 'Test User',
        email: 'test@example.com'
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toBe('Test User');
      });
  });
});
```

## 🚀 部署策略

### 1. 容器化

#### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY public ./public

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

#### Docker Compose

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/hl8
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: hl8
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
```

### 2. 负载均衡

#### Nginx 配置

```nginx
upstream api_backend {
    server api1:3000;
    server api2:3000;
    server api3:3000;
}

server {
    listen 80;
    server_name api.hl8.com;

    location / {
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 📈 监控和日志

### 1. 性能监控

#### 指标收集

```typescript
@Injectable()
export class MetricsService {
  private readonly prometheus = new Prometheus();

  recordRequest(method: string, path: string, duration: number, status: number): void {
    this.prometheus.counter('http_requests_total', {
      method,
      path,
      status: status.toString()
    }).inc();

    this.prometheus.histogram('http_request_duration_seconds', {
      method,
      path
    }).observe(duration);
  }
}
```

### 2. 日志管理

#### 结构化日志

```typescript
@Injectable()
export class LoggerService {
  private readonly logger = new Logger();

  logRequest(req: Request, res: Response, duration: number): void {
    this.logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });
  }
}
```

## 🎯 实施计划

### 阶段一：基础框架 (2周)

- [ ] 项目初始化和依赖配置
- [ ] 基础控制器和路由设计
- [ ] 认证授权系统
- [ ] 数据验证和错误处理

### 阶段二：核心功能 (3周)

- [ ] REST API 实现
- [ ] GraphQL API 实现
- [ ] WebSocket 实时通信
- [ ] 文件上传下载

### 阶段三：高级功能 (2周)

- [ ] API 文档生成
- [ ] 性能优化
- [ ] 缓存策略
- [ ] 监控日志

### 阶段四：测试部署 (1周)

- [ ] 单元测试和集成测试
- [ ] 性能测试
- [ ] 部署配置
- [ ] 文档完善

## 📚 相关文档

- [数据隔离机制设计文档](./DATA_ISOLATION_MECHANISM.md)
- [Clean Architecture 层次澄清](./CLEAN_ARCHITECTURE_LAYERS.md)
- [应用层开发指南](./APPLICATION_LAYER_DEVELOPMENT_GUIDE.md)
- [基础设施层架构设计](./libs/infrastructure-kernel/ISOLATION_ARCHITECTURE.md)

---

**文档版本**: 1.0.0  
**最后更新**: 2024年12月  
**维护者**: HL8 开发团队
