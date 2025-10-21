# Clean Architecture 层次澄清

## 🤔 问题澄清

**问题**: 在 Clean Architecture 架构层和基础设施层是不是同一个层？

**答案**: **不是**！这是两个完全不同的层次，它们在 Clean Architecture 中有明确的职责分工。

## 🏗️ Clean Architecture 四层架构

### 1. **领域层 (Domain Layer)** - 最内层

- **职责**: 核心业务逻辑和业务规则
- **特点**: 无外部依赖，纯业务逻辑
- **组件**: 实体、值对象、聚合根、领域服务、领域事件

### 2. **应用层 (Application Layer)** - 第二层

- **职责**: 用例编排和业务流程协调
- **特点**: 依赖领域层，不依赖具体实现
- **组件**: 用例服务、应用服务、命令处理器、查询处理器

### 3. **基础设施层 (Infrastructure Layer)** - 第三层

- **职责**: 技术实现和外部系统集成
- **特点**: 依赖应用层和领域层
- **组件**: 数据库、缓存、消息队列、外部API、文件系统

### 4. **接口层 (Interface Layer)** - 最外层

- **职责**: 用户界面和外部接口
- **特点**: 依赖所有内层
- **组件**: Web API、GraphQL、WebSocket、CLI、测试

## 📊 层次对比表

| 层次 | 职责 | 依赖关系 | 技术实现 | 业务逻辑 |
|------|------|----------|----------|----------|
| **接口层** | 用户交互 | 依赖所有内层 | Web API、GraphQL | 无 |
| **基础设施层** | 技术实现 | 依赖应用层+领域层 | 数据库、缓存、MQ | 无 |
| **应用层** | 用例编排 | 依赖领域层 | 用例服务、CQRS | 业务流程 |
| **领域层** | 核心业务 | 无外部依赖 | 实体、聚合根 | 核心业务规则 |

## 🔄 依赖关系图

```
┌─────────────────────────────────────────────────────────────┐
│                    Interface Layer                          │
│                  (接口层 - 最外层)                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Web API   │ │  GraphQL    │ │   WebSocket │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────┬───────────────────────────────────────┘
                      │ 依赖
┌─────────────────────▼───────────────────────────────────────┐
│                Infrastructure Layer                         │
│                (基础设施层 - 第三层)                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Database   │ │    Cache    │ │ Message Q   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────┬───────────────────────────────────────┘
                      │ 依赖
┌─────────────────────▼───────────────────────────────────────┐
│                 Application Layer                           │
│                 (应用层 - 第二层)                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Use Cases   │ │   Services  │ │   Handlers  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────┬───────────────────────────────────────┘
                      │ 依赖
┌─────────────────────▼───────────────────────────────────────┐
│                   Domain Layer                              │
│                  (领域层 - 最内层)                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Entities   │ │AggregateRoot│ │Domain Events│           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 在 HL8 项目中的具体体现

### 1. **领域层** - `@hl8/domain-kernel`

```typescript
// 纯业务逻辑，无外部依赖
export class IsolationContext {
  canAccess(targetContext: IsolationContext, sharingLevel: SharingLevel): boolean {
    // 纯业务逻辑，不依赖任何外部技术
  }
}
```

### 2. **应用层** - `@hl8/application-kernel`

```typescript
// 用例编排，依赖领域层
@Injectable()
export class UserManagementUseCase {
  constructor(
    private readonly userRepository: IUserRepository, // 接口依赖
    private readonly isolationContext: IsolationContext // 领域层依赖
  ) {}
}
```

### 3. **基础设施层** - `@hl8/infrastructure-kernel`

```typescript
// 技术实现，依赖应用层和领域层
@Injectable()
export class DatabaseUserRepository implements IUserRepository {
  constructor(
    private readonly database: DatabaseService, // 技术依赖
    private readonly isolationContext: IsolationContext // 领域层依赖
  ) {}
}
```

### 4. **接口层** - `@hl8/nestjs-fastify`

```typescript
// 用户界面，依赖所有内层
@Controller('users')
export class UserController {
  constructor(
    private readonly userUseCase: UserManagementUseCase, // 应用层依赖
    private readonly isolationContext: IsolationContext // 领域层依赖
  ) {}
}
```

## 🔍 关键区别

### **应用层 vs 基础设施层**

| 方面 | 应用层 | 基础设施层 |
|------|--------|------------|
| **职责** | 用例编排、业务流程 | 技术实现、外部集成 |
| **依赖** | 只依赖领域层 | 依赖应用层+领域层 |
| **业务逻辑** | 包含业务流程 | 不包含业务逻辑 |
| **技术实现** | 不包含技术细节 | 包含具体技术实现 |
| **测试** | 单元测试+集成测试 | 集成测试+端到端测试 |

### **具体示例对比**

#### 应用层示例

```typescript
// 应用层：用例编排
@Injectable()
export class CreateUserUseCase {
  async execute(command: CreateUserCommand): Promise<User> {
    // 1. 验证业务规则（领域层）
    const user = User.create(command);
    
    // 2. 保存到数据库（基础设施层）
    await this.userRepository.save(user);
    
    // 3. 发布事件（基础设施层）
    await this.eventBus.publish(new UserCreatedEvent(user));
    
    return user;
  }
}
```

#### 基础设施层示例

```typescript
// 基础设施层：技术实现
@Injectable()
export class DatabaseUserRepository implements IUserRepository {
  async save(user: User): Promise<void> {
    // 具体的技术实现
    await this.database.query(
      'INSERT INTO users (id, name, email) VALUES (?, ?, ?)',
      [user.id, user.name, user.email]
    );
  }
}
```

## 🚨 常见误解

### 误解1: "应用层和基础设施层是同一个层"

**错误**: 认为应用层就是基础设施层
**正确**: 应用层负责用例编排，基础设施层负责技术实现

### 误解2: "基础设施层包含业务逻辑"

**错误**: 在基础设施层编写业务逻辑
**正确**: 基础设施层只负责技术实现，业务逻辑在领域层

### 误解3: "应用层可以依赖基础设施层"

**错误**: 应用层直接依赖具体的技术实现
**正确**: 应用层通过接口依赖，不依赖具体实现

## 📚 最佳实践

### 1. **层次职责明确**

- 领域层：纯业务逻辑
- 应用层：用例编排
- 基础设施层：技术实现
- 接口层：用户交互

### 2. **依赖方向正确**

- 依赖关系：接口层 → 基础设施层 → 应用层 → 领域层
- 禁止：领域层依赖任何外层

### 3. **接口抽象**

- 应用层定义接口
- 基础设施层实现接口
- 通过依赖注入连接

### 4. **测试策略**

- 领域层：单元测试
- 应用层：单元测试+集成测试
- 基础设施层：集成测试
- 接口层：端到端测试

## 🎯 总结

**Clean Architecture 中的"架构层"和"基础设施层"是两个完全不同的层次：**

1. **应用层（Application Layer）**: 用例编排、业务流程协调
2. **基础设施层（Infrastructure Layer）**: 技术实现、外部系统集成

它们有明确的职责分工，不能混淆。在 HL8 项目中：

- `@hl8/application-kernel` 是应用层
- `@hl8/infrastructure-kernel` 是基础设施层
- `@hl8/domain-kernel` 是领域层
- `@hl8/nestjs-fastify` 是接口层

这样的分层确保了代码的可维护性、可测试性和可扩展性。

---

**文档版本**: 1.0.0  
**最后更新**: 2024年12月  
**维护者**: HL8 开发团队
