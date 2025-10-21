# 接口层实现指南

## 📋 概述

本文档提供了 HL8 AI SaaS 平台接口层的详细实现指南，包括代码示例、配置说明和最佳实践。

## 🚀 快速开始

### 1. 项目初始化

```bash
# 创建接口层项目
mkdir libs/interface-layer
cd libs/interface-layer

# 初始化项目
npm init -y
```

### 2. 依赖安装

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-fastify": "^11.0.0",
    "@nestjs/swagger": "^8.0.0",
    "@nestjs/websockets": "^11.0.0",
    "@nestjs/platform-socket.io": "^11.0.0",
    "@apollo/server": "^4.0.0",
    "@nestjs/apollo": "^12.0.0",
    "graphql": "^16.0.0",
    "socket.io": "^4.0.0",
    "multer": "^1.4.5",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.0",
    "passport-local": "^1.0.0",
    "bcrypt": "^5.1.0",
    "zod": "^3.22.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    "rate-limiter-flexible": "^4.0.0",
    "redis": "^4.6.0",
    "prometheus-api-metrics": "^1.0.0"
  },
  "devDependencies": {
    "@types/multer": "^1.4.0",
    "@types/passport-jwt": "^3.0.0",
    "@types/passport-local": "^1.0.0",
    "@types/bcrypt": "^5.0.0",
    "@types/compression": "^1.7.0"
  }
}
```

## 🏗️ 项目结构

```
libs/interface-layer/
├── src/
│   ├── controllers/           # 控制器
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── organization.controller.ts
│   │   └── file.controller.ts
│   ├── resolvers/            # GraphQL 解析器
│   │   ├── user.resolver.ts
│   │   ├── organization.resolver.ts
│   │   └── subscription.resolver.ts
│   ├── gateways/             # WebSocket 网关
│   │   └── app.gateway.ts
│   ├── dto/                  # 数据传输对象
│   │   ├── auth.dto.ts
│   │   ├── user.dto.ts
│   │   └── organization.dto.ts
│   ├── guards/               # 守卫
│   │   ├── auth.guard.ts
│   │   ├── permission.guard.ts
│   │   └── isolation.guard.ts
│   ├── interceptors/         # 拦截器
│   │   ├── logging.interceptor.ts
│   │   ├── cache.interceptor.ts
│   │   └── metrics.interceptor.ts
│   ├── pipes/                # 管道
│   │   ├── validation.pipe.ts
│   │   └── transform.pipe.ts
│   ├── filters/              # 异常过滤器
│   │   ├── http-exception.filter.ts
│   │   └── validation-exception.filter.ts
│   ├── middleware/           # 中间件
│   │   ├── isolation.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── logging.middleware.ts
│   ├── decorators/           # 装饰器
│   │   ├── current-user.decorator.ts
│   │   ├── current-context.decorator.ts
│   │   └── api-response.decorator.ts
│   ├── services/             # 服务
│   │   ├── auth.service.ts
│   │   ├── file.service.ts
│   │   └── websocket.service.ts
│   ├── utils/                # 工具类
│   │   ├── response.util.ts
│   │   ├── validation.util.ts
│   │   └── error.util.ts
│   ├── config/               # 配置
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   └── redis.config.ts
│   ├── modules/              # 模块
│   │   ├── auth.module.ts
│   │   ├── user.module.ts
│   │   └── app.module.ts
│   └── main.ts               # 应用入口
├── tests/                    # 测试
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                     # 文档
├── package.json
├── tsconfig.json
└── jest.config.js
```

## 🔧 核心实现

### 1. 应用入口

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './modules/app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { MetricsInterceptor } from './interceptors/metrics.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  // 全局管道
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true
  }));

  // 全局过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局拦截器
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new MetricsInterceptor()
  );

  // CORS 配置
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
  });

  // 安全头
  await app.register(require('@fastify/helmet'));
  await app.register(require('@fastify/compress'));

  // Swagger 文档
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

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
```

### 2. 主模块

```typescript
// src/modules/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth.module';
import { UserModule } from './user.module';
import { OrganizationModule } from './organization.module';
import { FileModule } from './file.module';
import { WebSocketModule } from './websocket.module';
import { DatabaseModule } from './database.module';
import { CacheModule } from './cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env']
    }),
    DatabaseModule,
    CacheModule,
    AuthModule,
    UserModule,
    OrganizationModule,
    FileModule,
    WebSocketModule
  ]
})
export class AppModule {}
```

### 3. 认证模块

```typescript
// src/modules/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { LocalStrategy } from '../strategies/local.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService]
})
export class AuthModule {}
```

### 4. 用户控制器

```typescript
// src/controllers/user.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { AuthGuard } from '../guards/auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { IsolationGuard } from '../guards/isolation.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CurrentContext } from '../decorators/current-context.decorator';
import { CreateUserDto, UpdateUserDto, GetUsersQuery } from '../dto/user.dto';
import { UserDto, PaginatedResponse } from '../dto/user.dto';
import { IsolationContext } from '@hl8/domain-kernel';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/v1/users')
@UseGuards(AuthGuard, PermissionGuard, IsolationGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({ status: 200, description: '成功获取用户列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  async getUsers(
    @CurrentContext() context: IsolationContext,
    @Query() query: GetUsersQuery
  ): Promise<PaginatedResponse<UserDto>> {
    return this.userService.getUsers(context, query);
  }

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  async createUser(
    @CurrentContext() context: IsolationContext,
    @Body() createUserDto: CreateUserDto
  ): Promise<UserDto> {
    return this.userService.createUser(context, createUserDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiResponse({ status: 200, description: '成功获取用户详情' })
  async getUser(
    @CurrentContext() context: IsolationContext,
    @Param('id') id: string
  ): Promise<UserDto> {
    return this.userService.getUser(context, id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户' })
  @ApiResponse({ status: 200, description: '用户更新成功' })
  async updateUser(
    @CurrentContext() context: IsolationContext,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserDto> {
    return this.userService.updateUser(context, id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '用户删除成功' })
  async deleteUser(
    @CurrentContext() context: IsolationContext,
    @Param('id') id: string
  ): Promise<void> {
    return this.userService.deleteUser(context, id);
  }
}
```

### 5. GraphQL 解析器

```typescript
// src/resolvers/user.resolver.ts
import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { ObjectType, Field, ID, InputType, Int } from '@nestjs/graphql';
import { UserService } from '../services/user.service';
import { CurrentContext } from '../decorators/current-context.decorator';
import { IsolationContext } from '@hl8/domain-kernel';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateUserInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class GetUsersArgs {
  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  limit?: number;
}

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  async users(
    @CurrentContext() context: IsolationContext,
    @Args() args: GetUsersArgs
  ): Promise<User[]> {
    return this.userService.getUsers(context, args);
  }

  @Mutation(() => User)
  async createUser(
    @CurrentContext() context: IsolationContext,
    @Args('input') input: CreateUserInput
  ): Promise<User> {
    return this.userService.createUser(context, input);
  }

  @Subscription(() => User)
  userUpdated(
    @CurrentContext() context: IsolationContext,
    @Args('userId') userId: string
  ): AsyncIterator<User> {
    return this.userService.subscribeToUserUpdates(context, userId);
  }
}
```

### 6. WebSocket 网关

```typescript
// src/gateways/app.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { IsolationService } from '../services/isolation.service';
import { IsolationContext } from '@hl8/domain-kernel';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/ws'
})
@Injectable()
export class AppGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly authService: AuthService,
    private readonly isolationService: IsolationService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const user = await this.authService.validateToken(token);
      const context = await this.isolationService.createContext(user);
      
      client.data.user = user;
      client.data.context = context;
      
      console.log(`Client connected: ${client.id}`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomType: string; roomId: string }
  ): Promise<void> {
    const context = client.data.context as IsolationContext;
    const room = this.buildRoomName(context, data.roomType, data.roomId);
    await client.join(room);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomType: string; roomId: string; message: string }
  ): Promise<void> {
    const context = client.data.context as IsolationContext;
    const room = this.buildRoomName(context, data.roomType, data.roomId);
    
    this.server.to(room).emit('message', {
      userId: client.data.user.id,
      message: data.message,
      timestamp: new Date()
    });
  }

  private buildRoomName(context: IsolationContext, roomType: string, roomId: string): string {
    const parts = [roomType, roomId];
    
    if (context.tenantId) {
      parts.unshift(`tenant:${context.tenantId.getValue()}`);
    }
    if (context.organizationId) {
      parts.unshift(`org:${context.organizationId.getValue()}`);
    }
    if (context.departmentId) {
      parts.unshift(`dept:${context.departmentId.getValue()}`);
    }
    
    return parts.join(':');
  }
}
```

### 7. 认证守卫

```typescript
// src/guards/auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.authService.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

### 8. 隔离守卫

```typescript
// src/guards/isolation.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IsolationService } from '../services/isolation.service';
import { IsolationLevel } from '@hl8/domain-kernel';

@Injectable()
export class IsolationGuard implements CanActivate {
  constructor(
    private readonly isolationService: IsolationService,
    private readonly reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredLevel = this.reflector.getAllAndOverride<IsolationLevel>('isolationLevel', [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredLevel) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const isolationContext = request.isolationContext;

    if (!isolationContext) {
      throw new ForbiddenException('Isolation context not found');
    }

    const currentLevel = isolationContext.getIsolationLevel();
    const hasPermission = this.isolationService.validateLevel(currentLevel, requiredLevel);

    if (!hasPermission) {
      throw new ForbiddenException(`Required isolation level: ${requiredLevel}, current: ${currentLevel}`);
    }

    return true;
  }
}
```

### 9. 数据验证管道

```typescript
// src/pipes/validation.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const errorMessages = errors.map(error => 
        Object.values(error.constraints || {}).join(', ')
      );
      throw new BadRequestException(errorMessages);
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

### 10. 异常过滤器

```typescript
// src/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException 
      ? exception.getResponse() 
      : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof message === 'string' ? message : (message as any).message
    };

    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : exception
    );

    response.status(status).json(errorResponse);
  }
}
```

## 🧪 测试实现

### 1. 单元测试

```typescript
// tests/unit/user.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../src/controllers/user.controller';
import { UserService } from '../../src/services/user.service';
import { IsolationContext } from '@hl8/domain-kernel';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUsers: jest.fn(),
            createUser: jest.fn(),
            getUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn()
          }
        }
      ]
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return users', async () => {
    const mockUsers = [{ id: '1', name: 'Test User', email: 'test@example.com' }];
    const mockContext = {} as IsolationContext;
    const mockQuery = { page: 1, limit: 10 };

    jest.spyOn(userService, 'getUsers').mockResolvedValue({
      data: mockUsers,
      total: 1,
      page: 1,
      limit: 10
    });

    const result = await controller.getUsers(mockContext, mockQuery);
    expect(result.data).toEqual(mockUsers);
    expect(userService.getUsers).toHaveBeenCalledWith(mockContext, mockQuery);
  });
});
```

### 2. 集成测试

```typescript
// tests/integration/user.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/modules/app.module';

describe('User API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should create user', () => {
    return request(app.getHttpServer())
      .post('/api/v1/users')
      .set('Authorization', 'Bearer valid-token')
      .set('X-Tenant-Id', 'tenant-123')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toBe('Test User');
        expect(res.body.email).toBe('test@example.com');
      });
  });

  it('should get users', () => {
    return request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Authorization', 'Bearer valid-token')
      .set('X-Tenant-Id', 'tenant-123')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });
});
```

## 📊 性能优化

### 1. 缓存实现

```typescript
// src/interceptors/cache.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../services/cache.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private readonly cacheService: CacheService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.generateCacheKey(request);
    
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheService.set(cacheKey, data, 3600); // 1小时缓存
      })
    );
  }

  private generateCacheKey(request: any): string {
    const { method, url, headers } = request;
    const tenantId = headers['x-tenant-id'];
    return `${method}:${url}:${tenantId}`;
  }
}
```

### 2. 限流实现

```typescript
// src/middleware/rate-limit.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimiter } from 'rate-limiter-flexible';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly rateLimiter = new RateLimiter({
    keyPrefix: 'rl',
    points: 100, // 请求次数
    duration: 60, // 时间窗口（秒）
    blockDuration: 60 // 阻塞时间（秒）
  });

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const key = this.generateKey(req);
      await this.rateLimiter.consume(key);
      next();
    } catch (rejRes) {
      res.status(429).json({
        error: 'Too Many Requests',
        retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 1
      });
    }
  }

  private generateKey(req: Request): string {
    const ip = req.ip;
    const tenantId = req.headers['x-tenant-id'] as string;
    return `${ip}:${tenantId || 'anonymous'}`;
  }
}
```

## 🚀 部署配置

### 1. Docker 配置

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### 2. Docker Compose

```yaml
# docker-compose.yml
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
      - JWT_SECRET=your-secret-key
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads

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

volumes:
  postgres_data:
  redis_data:
```

## 📚 相关文档

- [接口层技术方案设计文档](./INTERFACE_LAYER_TECHNICAL_PLAN.md)
- [数据隔离机制设计文档](./DATA_ISOLATION_MECHANISM.md)
- [Clean Architecture 层次澄清](./CLEAN_ARCHITECTURE_LAYERS.md)
- [应用层开发指南](./APPLICATION_LAYER_DEVELOPMENT_GUIDE.md)

---

**文档版本**: 1.0.0  
**最后更新**: 2024年12月  
**维护者**: HL8 开发团队
