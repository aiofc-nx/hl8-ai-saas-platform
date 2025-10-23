# 最佳实践概述

> **版本**: 1.0.0 | **创建日期**: 2025-01-27 | **模块**: 架构设计文档

---

## 📋 目录

- [1. 最佳实践概述](#1-最佳实践概述)
- [2. 架构设计最佳实践](#2-架构设计最佳实践)
- [3. 代码质量最佳实践](#3-代码质量最佳实践)
- [4. 性能优化最佳实践](#4-性能优化最佳实践)
- [5. 安全最佳实践](#5-安全最佳实践)
- [6. 测试最佳实践](#6-测试最佳实践)

---

## 1. 最佳实践概述

### 1.1 最佳实践目标

HL8 SAAS平台的最佳实践旨在确保：

- **代码质量**: 高质量、可维护的代码
- **系统性能**: 高性能、可扩展的系统
- **安全性**: 安全可靠的数据处理
- **可测试性**: 易于测试和验证
- **可维护性**: 易于理解和修改

### 1.2 最佳实践分类

#### 1.2.1 架构设计最佳实践

- **分层架构**: 清晰的层次分离
- **依赖管理**: 合理的依赖关系
- **接口设计**: 清晰的接口定义
- **模块化**: 高内聚低耦合

#### 1.2.2 代码质量最佳实践

- **命名规范**: 有意义的命名
- **注释规范**: 完整的文档注释
- **类型安全**: TypeScript类型系统
- **错误处理**: 统一的异常处理

#### 1.2.3 性能优化最佳实践

- **数据库优化**: 查询优化和索引
- **缓存策略**: 合理的缓存使用
- **异步处理**: 异步编程模式
- **资源管理**: 内存和连接管理

#### 1.2.4 安全最佳实践

- **输入验证**: 严格的数据验证
- **权限控制**: 细粒度的权限管理
- **数据隔离**: 多租户数据隔离
- **敏感信息**: 安全的信息处理

#### 1.2.5 测试最佳实践

- **测试策略**: 完整的测试覆盖
- **测试组织**: 清晰的测试结构
- **测试数据**: 合理的测试数据
- **测试维护**: 持续的测试更新

---

## 2. 架构设计最佳实践

### 2.1 分层架构最佳实践

#### 2.1.1 领域层设计

**✅ 好的做法**:

```typescript
/**
 * 用户聚合根
 * 
 * @description 用户聚合根，管理用户相关的业务逻辑
 * 遵循充血模型，包含完整的业务行为
 */
export class User extends AggregateRoot {
  private _email: Email;
  private _status: UserStatus;
  
  constructor(
    id: UserId,
    email: Email,
    username: Username
  ) {
    super(id);
    this._email = email;
    this._status = UserStatus.PENDING;
    
    // 发布领域事件
    this.addDomainEvent(new UserCreatedEvent(this.id, this.email));
  }
  
  /**
   * 更改用户邮箱
   * 
   * @param newEmail 新邮箱
   * @throws UserNotActiveException 用户未激活时抛出
   */
  public changeEmail(newEmail: Email): void {
    // 业务规则验证
    if (!this.isActive()) {
      throw new UserNotActiveException(this.id);
    }
    
    if (this._email.equals(newEmail)) {
      return; // 相同邮箱，无需更改
    }
    
    // 执行邮箱更改
    const oldEmail = this._email;
    this._email = newEmail;
    
    // 发布领域事件
    this.addDomainEvent(new UserEmailChangedEvent(this.id, oldEmail, newEmail));
  }
  
  /**
   * 检查用户是否激活
   * 
   * @returns 是否激活
   */
  public isActive(): boolean {
    return this._status === UserStatus.ACTIVE;
  }
}
```

**❌ 避免的做法**:

```typescript
// 贫血模型 - 只有getter/setter，没有业务逻辑
export class User {
  public email: string;
  public status: string;
  
  public setEmail(email: string): void {
    this.email = email;
  }
  
  public getEmail(): string {
    return this.email;
  }
  
  // 没有业务逻辑，只是数据容器
}
```

#### 2.1.2 应用层设计

**✅ 好的做法**:

```typescript
/**
 * 创建用户用例
 * 
 * @description 创建用户的业务用例
 * 协调领域层和基础设施层，实现完整的业务流程
 */
export class CreateUserUseCase extends BaseUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus,
    private readonly emailService: IEmailService
  ) {
    super();
  }
  
  /**
   * 执行创建用户用例
   * 
   * @param request 创建用户请求
   * @returns 创建用户响应
   */
  public async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // 1. 验证输入
    this.validateRequest(request);
    
    // 2. 检查用户是否已存在
    await this.checkUserExists(request.email, request.username);
    
    // 3. 创建用户实体
    const user = this.createUser(request);
    
    // 4. 保存用户
    await this.userRepository.save(user);
    
    // 5. 发送欢迎邮件
    await this.sendWelcomeEmail(user);
    
    // 6. 发布领域事件
    await this.eventBus.publish(user.getDomainEvents());
    
    return new CreateUserResponse(user.id, user.email, user.username);
  }
  
  private validateRequest(request: CreateUserRequest): void {
    // 输入验证逻辑
  }
  
  private async checkUserExists(email: string, username: string): Promise<void> {
    // 检查用户是否已存在
  }
  
  private createUser(request: CreateUserRequest): User {
    // 创建用户实体
  }
  
  private async sendWelcomeEmail(user: User): Promise<void> {
    // 发送欢迎邮件
  }
}
```

**❌ 避免的做法**:

```typescript
// 直接在控制器中处理业务逻辑
@Controller('users')
export class UserController {
  @Post()
  public async createUser(@Body() request: CreateUserRequest): Promise<any> {
    // 直接在控制器中处理业务逻辑 - 违反分层架构
    const user = new User();
    user.email = request.email;
    user.username = request.username;
    
    // 直接调用数据库 - 违反依赖关系
    await this.database.save(user);
    
    return { success: true };
  }
}
```

### 2.2 依赖管理最佳实践

#### 2.2.1 依赖注入

**✅ 好的做法**:

```typescript
/**
 * 用户服务
 * 
 * @description 用户应用服务
 * 通过依赖注入管理依赖关系
 */
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus,
    private readonly emailService: IEmailService,
    private readonly passwordService: IPasswordService
  ) {}
  
  public async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    // 使用注入的依赖
    const user = await this.userRepository.findByEmail(request.email);
    if (user) {
      throw new DuplicateUserException('用户已存在');
    }
    
    const newUser = User.create(request.email, request.username);
    await this.userRepository.save(newUser);
    
    await this.eventBus.publish(newUser.getDomainEvents());
    
    return new CreateUserResponse(newUser.id, newUser.email);
  }
}
```

**❌ 避免的做法**:

```typescript
// 直接实例化依赖 - 难以测试和维护
export class UserService {
  private userRepository = new UserRepository();
  private eventBus = new EventBus();
  private emailService = new EmailService();
  
  public async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    // 使用硬编码的依赖
  }
}
```

#### 2.2.2 接口设计

**✅ 好的做法**:

```typescript
/**
 * 用户仓储接口
 * 
 * @description 用户数据访问接口
 * 定义清晰的数据访问契约
 */
export interface IUserRepository {
  /**
   * 保存用户
   * 
   * @param user 用户实体
   * @throws DatabaseException 数据库异常时抛出
   */
  save(user: User): Promise<void>;
  
  /**
   * 根据ID查找用户
   * 
   * @param id 用户ID
   * @returns 用户实体或null
   * @throws DatabaseException 数据库异常时抛出
   */
  findById(id: UserId): Promise<User | null>;
  
  /**
   * 根据邮箱查找用户
   * 
   * @param email 邮箱地址
   * @returns 用户实体或null
   * @throws DatabaseException 数据库异常时抛出
   */
  findByEmail(email: Email): Promise<User | null>;
  
  /**
   * 删除用户
   * 
   * @param id 用户ID
   * @throws DatabaseException 数据库异常时抛出
   */
  delete(id: UserId): Promise<void>;
}
```

**❌ 避免的做法**:

```typescript
// 接口定义不清晰，缺少文档
export interface IUserRepository {
  save(user: any): Promise<any>;
  findById(id: any): Promise<any>;
  findByEmail(email: any): Promise<any>;
  delete(id: any): Promise<any>;
}
```

---

## 3. 代码质量最佳实践

### 3.1 命名规范

#### 3.1.1 类命名

**✅ 好的做法**:

```typescript
// 使用有意义的类名
export class UserRegistrationService { }
export class OrderProcessingUseCase { }
export class EmailNotificationHandler { }
export class DatabaseConnectionManager { }
```

**❌ 避免的做法**:

```typescript
// 使用无意义的类名
export class Service { }
export class Handler { }
export class Manager { }
export class Util { }
```

#### 3.1.2 方法命名

**✅ 好的做法**:

```typescript
export class User {
  /**
   * 激活用户
   */
  public activate(): void { }
  
  /**
   * 更改用户邮箱
   */
  public changeEmail(newEmail: Email): void { }
  
  /**
   * 检查用户是否激活
   */
  public isActive(): boolean { }
  
  /**
   * 更新用户资料
   */
  public updateProfile(profile: UserProfile): void { }
}
```

**❌ 避免的做法**:

```typescript
export class User {
  public doSomething(): void { }
  public process(): void { }
  public handle(): void { }
  public execute(): void { }
}
```

#### 3.1.3 变量命名

**✅ 好的做法**:

```typescript
// 使用有意义的变量名
const userEmail = 'user@example.com';
const isUserActive = user.status === UserStatus.ACTIVE;
const userRegistrationDate = new Date();
const maxRetryAttempts = 3;
```

**❌ 避免的做法**:

```typescript
// 使用无意义的变量名
const email = 'user@example.com';
const flag = user.status === UserStatus.ACTIVE;
const date = new Date();
const count = 3;
```

### 3.2 注释规范

#### 3.2.1 TSDoc注释

**✅ 好的做法**:

```typescript
/**
 * 用户实体
 * 
 * @description 用户业务实体，包含用户相关的业务逻辑
 * 遵循充血模型设计，实体包含业务逻辑而不仅仅是数据容器
 * 
 * @example
 * ```typescript
 * const user = new User(
 *   new UserId('user-123'),
 *   new Email('user@example.com'),
 *   new Username('john_doe')
 * );
 * 
 * user.changeEmail(new Email('new@example.com'));
 * user.activate();
 * ```
 */
export class User extends BaseEntity {
  /**
   * 更改用户邮箱
   * 
   * @param newEmail 新邮箱地址
   * @throws InvalidEmailException 邮箱格式无效时抛出
   * @throws UserNotActiveException 用户未激活时抛出
   * 
   * @example
   * ```typescript
   * user.changeEmail(new Email('new@example.com'));
   * ```
   */
  public changeEmail(newEmail: Email): void {
    // 实现逻辑
  }
}
```

**❌ 避免的做法**:

```typescript
// 缺少注释或注释不完整
export class User extends BaseEntity {
  public changeEmail(newEmail: Email): void {
    // 更改邮箱
  }
}
```

#### 3.2.2 业务规则注释

**✅ 好的做法**:

```typescript
/**
 * 用户激活
 * 
 * @description 激活用户账户，允许用户正常使用系统
 * 
 * ## 业务规则
 * 
 * ### 前置条件
 * - 用户必须处于PENDING状态
 * - 用户必须完成邮箱验证
 * 
 * ### 后置条件
 * - 用户状态变更为ACTIVE
 * - 发布用户激活事件
 * - 发送激活成功通知
 * 
 * ### 异常情况
 * - 用户已激活：抛出UserAlreadyActiveException
 * - 邮箱未验证：抛出EmailNotVerifiedException
 * 
 * @throws UserAlreadyActiveException 用户已激活时抛出
 * @throws EmailNotVerifiedException 邮箱未验证时抛出
 */
public activate(): void {
  // 实现逻辑
}
```

### 3.3 类型安全

#### 3.3.1 强类型定义

**✅ 好的做法**:

```typescript
// 使用强类型定义
export interface CreateUserRequest {
  readonly email: string;
  readonly username: string;
  readonly password: string;
  readonly profile?: UserProfile;
}

export interface CreateUserResponse {
  readonly userId: string;
  readonly email: string;
  readonly username: string;
  readonly status: UserStatus;
}

// 使用值对象
export class Email extends BaseValueObject {
  constructor(private readonly value: string) {
    super();
    this.validateEmail(value);
  }
  
  public get value(): string {
    return this._value;
  }
}
```

**❌ 避免的做法**:

```typescript
// 使用any类型
export interface CreateUserRequest {
  email: any;
  username: any;
  password: any;
  profile?: any;
}

// 使用原始类型
export class User {
  public email: string;
  public username: string;
  public password: string;
}
```

#### 3.3.2 类型守卫

**✅ 好的做法**:

```typescript
/**
 * 类型守卫：检查是否为用户实体
 * 
 * @param obj 待检查的对象
 * @returns 是否为用户实体
 */
export function isUser(obj: any): obj is User {
  return obj instanceof User;
}

/**
 * 类型守卫：检查是否为有效的邮箱
 * 
 * @param email 待检查的邮箱
 * @returns 是否为有效的邮箱
 */
export function isValidEmail(email: string): email is string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 使用类型守卫
if (isUser(user)) {
  // TypeScript知道user是User类型
  user.activate();
}

if (isValidEmail(email)) {
  // TypeScript知道email是有效的邮箱字符串
  const emailObj = new Email(email);
}
```

### 3.4 错误处理

#### 3.4.1 统一异常处理

**✅ 好的做法**:

```typescript
/**
 * 业务异常基类
 * 
 * @description 所有业务异常的基类
 * 提供统一的异常处理机制
 */
export abstract class BusinessException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * 用户不存在异常
 * 
 * @description 当用户不存在时抛出
 */
export class UserNotFoundException extends BusinessException {
  constructor(userId: string) {
    super(`用户不存在: ${userId}`, 'USER_NOT_FOUND', { userId });
  }
}

/**
 * 用户已存在异常
 * 
 * @description 当用户已存在时抛出
 */
export class DuplicateUserException extends BusinessException {
  constructor(email: string) {
    super(`用户已存在: ${email}`, 'DUPLICATE_USER', { email });
  }
}

// 使用异常
export class UserService {
  public async getUser(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return user;
  }
}
```

**❌ 避免的做法**:

```typescript
// 使用通用异常
export class UserService {
  public async getUser(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('用户不存在'); // 缺少异常类型和详细信息
    }
    return user;
  }
}
```

---

## 4. 性能优化最佳实践

### 4.1 数据库优化

#### 4.1.1 查询优化

**✅ 好的做法**:

```typescript
/**
 * 用户仓储实现
 * 
 * @description 优化的用户数据访问实现
 * 使用索引和查询优化提高性能
 */
export class UserRepository implements IUserRepository {
  /**
   * 根据邮箱查找用户（使用索引）
   * 
   * @param email 邮箱地址
   * @returns 用户实体或null
   */
  public async findByEmail(email: Email): Promise<User | null> {
    // 使用索引查询，避免全表扫描
    const userEntity = await this.entityManager.findOne(UserEntity, {
      email: email.value,
      tenantId: this.isolationContext.tenantId.value
    }, {
      indexHint: 'idx_user_email_tenant' // 使用索引提示
    });
    
    return userEntity ? this.mapToDomain(userEntity) : null;
  }
  
  /**
   * 分页查询用户列表
   * 
   * @param page 页码
   * @param limit 每页数量
   * @returns 用户列表
   */
  public async findUsers(page: number, limit: number): Promise<User[]> {
    const offset = (page - 1) * limit;
    
    const userEntities = await this.entityManager.find(UserEntity, {
      tenantId: this.isolationContext.tenantId.value
    }, {
      limit,
      offset,
      orderBy: { createdAt: 'DESC' } // 按创建时间倒序
    });
    
    return userEntities.map(entity => this.mapToDomain(entity));
  }
}
```

**❌ 避免的做法**:

```typescript
// 低效的查询实现
export class UserRepository implements IUserRepository {
  public async findByEmail(email: Email): Promise<User | null> {
    // 全表扫描，没有使用索引
    const users = await this.entityManager.find(UserEntity, {});
    return users.find(user => user.email === email.value);
  }
  
  public async findUsers(page: number, limit: number): Promise<User[]> {
    // 没有分页，可能返回大量数据
    const users = await this.entityManager.find(UserEntity, {});
    return users.slice((page - 1) * limit, page * limit);
  }
}
```

#### 4.1.2 连接池优化

**✅ 好的做法**:

```typescript
/**
 * 数据库配置
 * 
 * @description 优化的数据库连接池配置
 * 根据系统负载调整连接池参数
 */
export const databaseConfig = {
  type: 'postgresql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '5'),
    max: parseInt(process.env.DB_POOL_MAX || '20'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000')
  },
  options: {
    enableArithAbort: true,
    trustServerCertificate: true
  }
};
```

### 4.2 缓存策略

#### 4.2.1 缓存设计

**✅ 好的做法**:

```typescript
/**
 * 用户缓存服务
 * 
 * @description 用户数据缓存服务
 * 使用多级缓存策略提高性能
 */
@Injectable()
export class UserCacheService {
  constructor(
    private readonly cache: ICache,
    private readonly userRepository: IUserRepository
  ) {}
  
  /**
   * 获取用户（带缓存）
   * 
   * @param userId 用户ID
   * @returns 用户实体
   */
  public async getUser(userId: string): Promise<User | null> {
    const cacheKey = `user:${userId}`;
    
    // 1. 尝试从缓存获取
    let user = await this.cache.get<User>(cacheKey);
    if (user) {
      return user;
    }
    
    // 2. 从数据库获取
    user = await this.userRepository.findById(new UserId(userId));
    if (!user) {
      return null;
    }
    
    // 3. 写入缓存
    await this.cache.set(cacheKey, user, 3600); // 1小时TTL
    
    return user;
  }
  
  /**
   * 更新用户缓存
   * 
   * @param user 用户实体
   */
  public async updateUserCache(user: User): Promise<void> {
    const cacheKey = `user:${user.id.value}`;
    await this.cache.set(cacheKey, user, 3600);
  }
  
  /**
   * 删除用户缓存
   * 
   * @param userId 用户ID
   */
  public async deleteUserCache(userId: string): Promise<void> {
    const cacheKey = `user:${userId}`;
    await this.cache.delete(cacheKey);
  }
}
```

#### 4.2.2 缓存失效策略

**✅ 好的做法**:

```typescript
/**
 * 用户服务（带缓存失效）
 * 
 * @description 用户服务，自动处理缓存失效
 */
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userCacheService: UserCacheService,
    private readonly eventBus: IEventBus
  ) {}
  
  /**
   * 更新用户
   * 
   * @param userId 用户ID
   * @param request 更新请求
   * @returns 更新后的用户
   */
  public async updateUser(userId: string, request: UpdateUserRequest): Promise<User> {
    // 1. 获取用户
    const user = await this.userCacheService.getUser(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }
    
    // 2. 更新用户
    user.updateProfile(request.profile);
    
    // 3. 保存到数据库
    await this.userRepository.save(user);
    
    // 4. 更新缓存
    await this.userCacheService.updateUserCache(user);
    
    // 5. 发布事件
    await this.eventBus.publish(user.getDomainEvents());
    
    return user;
  }
  
  /**
   * 删除用户
   * 
   * @param userId 用户ID
   */
  public async deleteUser(userId: string): Promise<void> {
    // 1. 删除数据库记录
    await this.userRepository.delete(new UserId(userId));
    
    // 2. 删除缓存
    await this.userCacheService.deleteUserCache(userId);
    
    // 3. 发布事件
    await this.eventBus.publish(new UserDeletedEvent(userId));
  }
}
```

### 4.3 异步处理

#### 4.3.1 异步编程模式

**✅ 好的做法**:

```typescript
/**
 * 用户注册服务
 * 
 * @description 异步处理用户注册流程
 * 使用Promise.all并行处理多个异步操作
 */
@Injectable()
export class UserRegistrationService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly smsService: ISmsService,
    private readonly eventBus: IEventBus
  ) {}
  
  /**
   * 注册用户
   * 
   * @param request 注册请求
   * @returns 注册结果
   */
  public async registerUser(request: UserRegistrationRequest): Promise<UserRegistrationResponse> {
    // 1. 创建用户
    const user = await this.createUser(request);
    
    // 2. 并行处理多个异步操作
    const [emailResult, smsResult, eventResult] = await Promise.all([
      this.sendWelcomeEmail(user),
      this.sendWelcomeSms(user),
      this.publishRegistrationEvent(user)
    ]);
    
    return new UserRegistrationResponse(
      user.id,
      user.email,
      emailResult.success,
      smsResult.success
    );
  }
  
  private async sendWelcomeEmail(user: User): Promise<{ success: boolean }> {
    try {
      await this.emailService.sendWelcomeEmail(user.email);
      return { success: true };
    } catch (error) {
      console.error('发送欢迎邮件失败:', error);
      return { success: false };
    }
  }
  
  private async sendWelcomeSms(user: User): Promise<{ success: boolean }> {
    try {
      await this.smsService.sendWelcomeSms(user.phone);
      return { success: true };
    } catch (error) {
      console.error('发送欢迎短信失败:', error);
      return { success: false };
    }
  }
  
  private async publishRegistrationEvent(user: User): Promise<void> {
    await this.eventBus.publish(new UserRegisteredEvent(user.id, user.email));
  }
}
```

#### 4.3.2 错误处理

**✅ 好的做法**:

```typescript
/**
 * 异步操作错误处理
 * 
 * @description 处理异步操作中的错误
 * 确保部分失败不影响整体流程
 */
export class AsyncOperationHandler {
  /**
   * 批量处理用户操作
   * 
   * @param operations 操作列表
   * @returns 处理结果
   */
  public async batchProcess(operations: AsyncOperation[]): Promise<BatchProcessResult> {
    const results: OperationResult[] = [];
    const errors: OperationError[] = [];
    
    // 使用Promise.allSettled处理部分失败
    const settledResults = await Promise.allSettled(
      operations.map(operation => this.processOperation(operation))
    );
    
    settledResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        errors.push({
          operation: operations[index],
          error: result.reason
        });
      }
    });
    
    return new BatchProcessResult(results, errors);
  }
  
  private async processOperation(operation: AsyncOperation): Promise<OperationResult> {
    try {
      const result = await operation.execute();
      return { success: true, data: result };
    } catch (error) {
      throw new OperationException(`操作失败: ${operation.name}`, error);
    }
  }
}
```

---

## 5. 安全最佳实践

### 5.1 输入验证

#### 5.1.1 数据验证

**✅ 好的做法**:

```typescript
/**
 * 用户输入验证器
 * 
 * @description 严格的用户输入验证
 * 防止恶意输入和注入攻击
 */
export class UserInputValidator {
  /**
   * 验证用户注册输入
   * 
   * @param input 用户输入
   * @returns 验证结果
   */
  public validateUserRegistration(input: UserRegistrationInput): ValidationResult {
    const errors: ValidationError[] = [];
    
    // 邮箱验证
    if (!this.isValidEmail(input.email)) {
      errors.push(new ValidationError('email', '邮箱格式无效'));
    }
    
    // 用户名验证
    if (!this.isValidUsername(input.username)) {
      errors.push(new ValidationError('username', '用户名格式无效'));
    }
    
    // 密码验证
    if (!this.isValidPassword(input.password)) {
      errors.push(new ValidationError('password', '密码强度不足'));
    }
    
    // 防止SQL注入
    if (this.containsSqlInjection(input.email) || 
        this.containsSqlInjection(input.username)) {
      errors.push(new ValidationError('input', '输入包含非法字符'));
    }
    
    return new ValidationResult(errors.length === 0, errors);
  }
  
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }
  
  private isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  }
  
  private isValidPassword(password: string): boolean {
    // 密码强度要求：至少8位，包含大小写字母、数字和特殊字符
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
  
  private containsSqlInjection(input: string): boolean {
    const sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
      /(\b(OR|AND)\s+['"]\s*LIKE\s*['"])/i
    ];
    
    return sqlInjectionPatterns.some(pattern => pattern.test(input));
  }
}
```

#### 5.1.2 参数验证

**✅ 好的做法**:

```typescript
/**
 * 用户控制器（带参数验证）
 * 
 * @description 用户控制器，包含严格的参数验证
 * 使用装饰器进行参数验证
 */
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly inputValidator: UserInputValidator
  ) {}
  
  /**
   * 创建用户
   * 
   * @param request 创建用户请求
   * @returns 创建用户响应
   */
  @Post()
  @UseGuards(AuthenticationGuard)
  @UsePipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    validationError: {
      target: false,
      value: false
    }
  }))
  public async createUser(@Body() request: CreateUserRequest): Promise<CreateUserResponse> {
    // 1. 参数验证
    const validationResult = this.inputValidator.validateUserRegistration(request);
    if (!validationResult.isValid) {
      throw new ValidationException('请求参数验证失败', validationResult.errors);
    }
    
    // 2. 执行业务逻辑
    return await this.userService.createUser(request);
  }
  
  /**
   * 获取用户
   * 
   * @param id 用户ID
   * @returns 用户信息
   */
  @Get(':id')
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  public async getUser(@Param('id', ParseUUIDPipe) id: string): Promise<GetUserResponse> {
    // UUID格式验证
    return await this.userService.getUser(id);
  }
}
```

### 5.2 权限控制

#### 5.2.1 访问控制

**✅ 好的做法**:

```typescript
/**
 * 用户权限守卫
 * 
 * @description 用户权限验证守卫
 * 实现细粒度的权限控制
 */
@Injectable()
export class UserPermissionGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly permissionService: PermissionService
  ) {}
  
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resource = request.params.id;
    
    // 1. 检查用户是否激活
    if (!user.isActive()) {
      throw new UnauthorizedException('用户未激活');
    }
    
    // 2. 检查资源访问权限
    const hasPermission = await this.permissionService.hasPermission(
      user.id,
      'USER_READ',
      resource
    );
    
    if (!hasPermission) {
      throw new ForbiddenException('没有访问权限');
    }
    
    return true;
  }
}

/**
 * 用户服务（带权限控制）
 * 
 * @description 用户服务，包含权限控制逻辑
 */
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly permissionService: PermissionService
  ) {}
  
  /**
   * 获取用户信息
   * 
   * @param userId 用户ID
   * @param requesterId 请求者ID
   * @returns 用户信息
   */
  public async getUser(userId: string, requesterId: string): Promise<User> {
    // 1. 权限检查
    await this.checkUserReadPermission(requesterId, userId);
    
    // 2. 获取用户信息
    const user = await this.userRepository.findById(new UserId(userId));
    if (!user) {
      throw new UserNotFoundException(userId);
    }
    
    // 3. 数据脱敏
    return this.sanitizeUserData(user, requesterId);
  }
  
  private async checkUserReadPermission(requesterId: string, targetUserId: string): Promise<void> {
    const hasPermission = await this.permissionService.hasPermission(
      requesterId,
      'USER_READ',
      targetUserId
    );
    
    if (!hasPermission) {
      throw new ForbiddenException('没有读取用户信息的权限');
    }
  }
  
  private sanitizeUserData(user: User, requesterId: string): User {
    // 如果不是用户本人，脱敏敏感信息
    if (user.id.value !== requesterId) {
      return user.sanitize();
    }
    
    return user;
  }
}
```

### 5.3 数据隔离

#### 5.3.1 多租户隔离

**✅ 好的做法**:

```typescript
/**
 * 多租户数据隔离服务
 * 
 * @description 确保多租户数据隔离
 * 防止租户间数据泄露
 */
@Injectable()
export class MultiTenantIsolationService {
  constructor(
    private readonly isolationContext: IsolationContext
  ) {}
  
  /**
   * 应用租户隔离条件
   * 
   * @param query 查询条件
   * @returns 带隔离条件的查询
   */
  public applyTenantIsolation<T>(query: any): any {
    return {
      ...query,
      tenantId: this.isolationContext.tenantId.value,
      organizationId: this.isolationContext.organizationId?.value,
      departmentId: this.isolationContext.departmentId?.value
    };
  }
  
  /**
   * 验证数据访问权限
   * 
   * @param resource 资源
   * @throws DataAccessDeniedException 数据访问被拒绝时抛出
   */
  public validateDataAccess(resource: any): void {
    // 检查租户隔离
    if (resource.tenantId !== this.isolationContext.tenantId.value) {
      throw new DataAccessDeniedException('跨租户数据访问被拒绝');
    }
    
    // 检查组织隔离
    if (resource.organizationId && 
        resource.organizationId !== this.isolationContext.organizationId?.value) {
      throw new DataAccessDeniedException('跨组织数据访问被拒绝');
    }
    
    // 检查部门隔离
    if (resource.departmentId && 
        resource.departmentId !== this.isolationContext.departmentId?.value) {
      throw new DataAccessDeniedException('跨部门数据访问被拒绝');
    }
  }
}
```

---

## 6. 测试最佳实践

### 6.1 测试策略

#### 6.1.1 测试金字塔

**✅ 好的做法**:

```typescript
// 单元测试 - 测试单个组件
describe('User Entity', () => {
  it('应该正确创建用户', () => {
    const user = new User(
      new UserId('user-123'),
      new Email('user@example.com'),
      new Username('john_doe')
    );
    
    expect(user.id.value).toBe('user-123');
    expect(user.email.value).toBe('user@example.com');
    expect(user.username.value).toBe('john_doe');
  });
});

// 集成测试 - 测试组件协作
describe('User Service Integration', () => {
  it('应该成功创建用户并保存到数据库', async () => {
    const userService = new UserService(userRepository, eventBus);
    const request = new CreateUserRequest('user@example.com', 'john_doe');
    
    const response = await userService.createUser(request);
    
    expect(response.userId).toBeDefined();
    expect(await userRepository.findById(response.userId)).toBeDefined();
  });
});

// 端到端测试 - 测试完整流程
describe('User Management E2E', () => {
  it('应该完成用户创建到删除的完整流程', async () => {
    // 1. 创建用户
    const createResponse = await request(app.getHttpServer())
      .post('/api/users')
      .send({ email: 'user@example.com', username: 'john_doe' })
      .expect(201);
    
    // 2. 获取用户
    await request(app.getHttpServer())
      .get(`/api/users/${createResponse.body.userId}`)
      .expect(200);
    
    // 3. 删除用户
    await request(app.getHttpServer())
      .delete(`/api/users/${createResponse.body.userId}`)
      .expect(200);
  });
});
```

#### 6.1.2 测试数据管理

**✅ 好的做法**:

```typescript
/**
 * 测试数据工厂
 * 
 * @description 创建测试数据的工厂类
 * 提供一致的测试数据
 */
export class UserTestDataFactory {
  /**
   * 创建测试用户
   * 
   * @param overrides 覆盖属性
   * @returns 测试用户
   */
  public static createUser(overrides: Partial<UserData> = {}): User {
    const defaultData: UserData = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const userData = { ...defaultData, ...overrides };
    
    return new User(
      new UserId(userData.id),
      new Email(userData.email),
      new Username(userData.username)
    );
  }
  
  /**
   * 创建测试用户列表
   * 
   * @param count 数量
   * @returns 测试用户列表
   */
  public static createUsers(count: number): User[] {
    return Array.from({ length: count }, (_, index) => 
      this.createUser({
        id: `user-${index + 1}`,
        email: `user${index + 1}@example.com`,
        username: `user${index + 1}`
      })
    );
  }
}

// 使用测试数据工厂
describe('User Service', () => {
  it('应该处理多个用户', async () => {
    const users = UserTestDataFactory.createUsers(5);
    
    for (const user of users) {
      await userService.createUser(user);
    }
    
    const allUsers = await userService.getAllUsers();
    expect(allUsers).toHaveLength(5);
  });
});
```

### 6.2 测试质量

#### 6.2.1 测试覆盖率

**✅ 好的做法**:

```typescript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // 领域层要求更高的覆盖率
    './src/domain/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

#### 6.2.2 测试维护

**✅ 好的做法**:

```typescript
/**
 * 测试基类
 * 
 * @description 提供测试的通用功能
 * 减少测试代码重复
 */
export abstract class TestBase {
  protected userRepository: jest.Mocked<IUserRepository>;
  protected eventBus: jest.Mocked<IEventBus>;
  protected emailService: jest.Mocked<IEmailService>;
  
  protected setupMocks(): void {
    this.userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      delete: jest.fn()
    };
    
    this.eventBus = {
      publish: jest.fn()
    };
    
    this.emailService = {
      sendEmail: jest.fn()
    };
  }
  
  protected resetMocks(): void {
    jest.clearAllMocks();
  }
}

// 使用测试基类
describe('User Service', () => {
  class UserServiceTest extends TestBase {
    private userService: UserService;
    
    beforeEach(() => {
      this.setupMocks();
      this.userService = new UserService(
        this.userRepository,
        this.eventBus,
        this.emailService
      );
    });
    
    afterEach(() => {
      this.resetMocks();
    });
    
    it('应该创建用户', async () => {
      // 测试逻辑
    });
  }
});
```

---

## 📝 总结

最佳实践概述为HL8 SAAS平台的开发提供了全面的指导。通过遵循这些最佳实践，可以确保：

- **代码质量**: 高质量、可维护的代码
- **系统性能**: 高性能、可扩展的系统
- **安全性**: 安全可靠的数据处理
- **可测试性**: 易于测试和验证
- **可维护性**: 易于理解和修改

这些最佳实践涵盖了架构设计、代码质量、性能优化、安全性和测试等各个方面，为开发团队提供了清晰的开发指导。
