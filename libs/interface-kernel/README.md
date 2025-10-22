# Interface Kernel

接口层核心模块，提供统一的接口层功能，包括API网关、认证授权、数据验证、速率限制和监控。

## 功能特性

- **API Gateway**: 统一的API网关，支持HTTP、GraphQL和WebSocket
- **认证授权**: JWT认证和基于角色的访问控制
- **数据验证**: 使用Zod进行运行时类型验证
- **速率限制**: 防止API滥用和DDoS攻击
- **监控健康**: 系统监控和健康检查
- **多租户支持**: 完整的租户隔离支持

## 架构设计

### Clean Architecture 四层架构

```text
┌─────────────────────────────────────────┐
│            Interface Layer              │
│  ┌─────────────┐ ┌─────────────┐        │
│  │   REST API  │ │  GraphQL    │        │
│  └─────────────┘ └─────────────┘        │
│  ┌─────────────┐ ┌─────────────┐        │
│  │  WebSocket  │ │   Gateway   │        │
│  └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         Application Layer               │
│  ┌─────────────┐ ┌─────────────┐        │
│  │ Use Cases   │ │   Services  │        │
│  └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│          Domain Layer                  │
│  ┌─────────────┐ ┌─────────────┐        │
│  │  Entities   │ │  Value Objs │        │
│  └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│      Infrastructure Layer              │
│  ┌─────────────┐ ┌─────────────┐        │
│  │  Database   │ │   External  │        │
│  └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────┘
```

### 核心组件

- **API Gateway Service**: 统一请求处理
- **Authentication Service**: JWT认证管理
- **Authorization Service**: 权限控制
- **Validation Service**: 数据验证
- **Rate Limit Service**: 速率限制
- **Monitoring Service**: 系统监控
- **Health Check Service**: 健康检查

## 技术栈

- **Node.js**: >= 20
- **TypeScript**: 5.9.2
- **NestJS**: 10.x
- **Fastify**: 4.x
- **Apollo Server**: 3.x
- **Socket.io**: 4.x
- **JWT**: 认证授权
- **Zod**: 数据验证
- **Jest**: 测试框架

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 构建项目

```bash
pnpm build
```

### 运行测试

```bash
pnpm test
```

### 运行开发模式

```bash
pnpm dev
```

## 使用示例

### 基本使用

```typescript
import { InterfaceKernelModule } from "@hl8/interface-kernel";

@Module({
  imports: [InterfaceKernelModule],
  // ...
})
export class AppModule {}
```

### REST API 控制器

```typescript
import { Controller, Get, Post } from "@nestjs/common";
import { RestController } from "@hl8/interface-kernel";

@Controller("api/v1")
export class MyController extends RestController {
  @Get("users")
  async getUsers() {
    // 处理用户列表请求
  }

  @Post("users")
  async createUser() {
    // 处理用户创建请求
  }
}
```

### GraphQL 解析器

```typescript
import { Resolver, Query, Mutation } from "@nestjs/graphql";
import { GraphQLService } from "@hl8/interface-kernel";

@Resolver()
export class UserResolver {
  constructor(private readonly graphqlService: GraphQLService) {}

  @Query()
  async users() {
    return this.graphqlService.getUsers();
  }

  @Mutation()
  async createUser(input: CreateUserInput) {
    return this.graphqlService.createUser(input);
  }
}
```

### WebSocket 处理

```typescript
import { WebSocketGateway, SubscribeMessage } from "@nestjs/websockets";
import { WebSocketService } from "@hl8/interface-kernel";

@WebSocketGateway()
export class ChatGateway {
  constructor(private readonly websocketService: WebSocketService) {}

  @SubscribeMessage("message")
  handleMessage(client: any, payload: any) {
    return this.websocketService.handleMessage(client, payload);
  }
}
```

## API 文档

### REST API

- **GET** `/api/v1/rest/users` - 获取用户列表
- **POST** `/api/v1/rest/users` - 创建用户
- **PUT** `/api/v1/rest/users/:id` - 更新用户
- **DELETE** `/api/v1/rest/users/:id` - 删除用户

### GraphQL API

- **Query**: `users`, `user(id: ID!)`
- **Mutation**: `createUser`, `updateUser`, `deleteUser`

### WebSocket API

- **连接**: `/api/v1/websocket`
- **事件**: `message`, `join-room`, `leave-room`, `ping`

### 健康检查

- **GET** `/health` - 基础健康检查
- **GET** `/health/detailed` - 详细健康检查
- **GET** `/health/ready` - 就绪检查
- **GET** `/health/live` - 存活检查

### 监控指标

- **GET** `/metrics/performance` - 性能指标
- **GET** `/metrics/system` - 系统信息
- **GET** `/metrics/data` - 指标数据

## 配置

### 环境变量

```bash
# JWT 配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
JWT_ISSUER=hl8-platform
JWT_AUDIENCE=hl8-users

# CORS 配置
CORS_ORIGIN=*
CORS_CREDENTIALS=true

# WebSocket 配置
WEBSOCKET_NAMESPACE=/api/v1/websocket

# 速率限制配置
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# 监控配置
METRICS_ENABLED=true
HEALTH_CHECK_ENABLED=true
```

### 模块配置

```typescript
import { InterfaceKernelModule } from "@hl8/interface-kernel";

@Module({
  imports: [
    InterfaceKernelModule.forRoot({
      api: {
        prefix: "/api/v1",
        version: "1.0.0",
        cors: {
          origin: "*",
          credentials: true,
        },
      },
      auth: {
        jwt: {
          secret: process.env.JWT_SECRET,
          expiresIn: "24h",
          issuer: "hl8-platform",
          audience: "hl8-users",
        },
      },
      rateLimit: {
        global: {
          windowMs: 15 * 60 * 1000,
          max: 100,
        },
      },
      monitoring: {
        enabled: true,
        metrics: true,
        healthCheck: true,
        logging: true,
      },
    }),
  ],
})
export class AppModule {}
```

## 开发指南

### 添加新的 API 端点

1. 在 `src/controllers/` 中创建控制器
2. 在 `src/services/` 中实现业务逻辑
3. 在 `src/types/` 中定义类型
4. 添加相应的测试

### 添加新的 GraphQL 解析器

1. 在 `src/services/graphql.service.ts` 中添加解析器
2. 更新 GraphQL Schema
3. 添加相应的测试

### 添加新的 WebSocket 事件

1. 在 `src/services/websocket.service.ts` 中添加事件处理器
2. 更新事件类型定义
3. 添加相应的测试

## 测试

### 运行所有测试

```bash
pnpm test
```

### 运行特定测试

```bash
pnpm test -- --testNamePattern="ApiGatewayService"
```

### 运行测试覆盖率

```bash
pnpm test:coverage
```

### 运行 E2E 测试

```bash
pnpm test:e2e
```

## 部署

### Docker 部署

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### 环境配置

```bash
# 生产环境
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=hl8_platform

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT License - 详见 [LICENSE](../../LICENSE) 文件

## 支持

如有问题或建议，请：

1. 查看 [文档](../../docs/)
2. 搜索 [Issues](../../issues)
3. 创建新的 [Issue](../../issues/new)
4. 联系开发团队

---

**HL8 Development Team** - 构建下一代 AI SAAS 平台
