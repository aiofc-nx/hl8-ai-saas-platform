# 代码示例

> **版本**: 1.0.0 | **创建日期**: 2025-01-27 | **模块**: 架构设计文档

---

## 📋 目录

- [1. 领域层代码示例](#1-领域层代码示例)
- [2. 应用层代码示例](#2-应用层代码示例)
- [3. 基础设施层代码示例](#3-基础设施层代码示例)
- [4. 接口层代码示例](#4-接口层代码示例)
- [5. 完整业务模块示例](#5-完整业务模块示例)

---

## 1. 领域层代码示例

### 1.1 实体实现示例

#### 1.1.1 用户实体

````typescript
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
  private _email: Email;
  private _username: Username;
  private _status: UserStatus;
  private _profile: UserProfile;
  private _password: HashedPassword;

  constructor(
    id: UserId,
    email: Email,
    username: Username,
    password?: HashedPassword,
    profile?: UserProfile,
  ) {
    super(id);
    this._email = email;
    this._username = username;
    this._status = UserStatus.PENDING;
    this._profile = profile || UserProfile.createDefault();
    this._password = password || HashedPassword.empty();

    // 发布用户创建事件
    this.addDomainEvent(
      new UserCreatedEvent(this.id, this.email, this.username),
    );
  }

  /**
   * 获取用户邮箱
   *
   * @returns 用户邮箱
   */
  public get email(): Email {
    return this._email;
  }

  /**
   * 获取用户状态
   *
   * @returns 用户状态
   */
  public get status(): UserStatus {
    return this._status;
  }

  /**
   * 更改用户邮箱
   *
   * @param newEmail 新邮箱
   * @throws InvalidEmailException 邮箱格式无效时抛出
   * @throws UserNotActiveException 用户未激活时抛出
   *
   * @example
   * ```typescript
   * user.changeEmail(new Email('new@example.com'));
   * ```
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

    // 发布邮箱更改事件
    this.addDomainEvent(new UserEmailChangedEvent(this.id, oldEmail, newEmail));
  }

  /**
   * 激活用户
   *
   * @throws UserAlreadyActiveException 用户已激活时抛出
   *
   * @example
   * ```typescript
   * user.activate();
   * ```
   */
  public activate(): void {
    if (this.isActive()) {
      throw new UserAlreadyActiveException(this.id);
    }

    this._status = UserStatus.ACTIVE;
    this.addDomainEvent(new UserActivatedEvent(this.id));
  }

  /**
   * 检查用户是否激活
   *
   * @returns 是否激活
   */
  public isActive(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  /**
   * 更新用户资料
   *
   * @param profile 用户资料
   * @throws UserNotActiveException 用户未激活时抛出
   */
  public updateProfile(profile: UserProfile): void {
    if (!this.isActive()) {
      throw new UserNotActiveException(this.id);
    }

    this._profile = profile;
    this.addDomainEvent(new UserProfileUpdatedEvent(this.id, profile));
  }

  /**
   * 验证密码
   *
   * @param password 明文密码
   * @returns 密码是否正确
   */
  public verifyPassword(password: string): boolean {
    return this._password.verify(password);
  }

  /**
   * 更改密码
   *
   * @param newPassword 新密码
   * @throws UserNotActiveException 用户未激活时抛出
   */
  public changePassword(newPassword: string): void {
    if (!this.isActive()) {
      throw new UserNotActiveException(this.id);
    }

    this._password = HashedPassword.fromPlainText(newPassword);
    this.addDomainEvent(new UserPasswordChangedEvent(this.id));
  }
}
````

#### 1.1.2 订单聚合根

````typescript
/**
 * 订单聚合根
 *
 * @description 订单聚合根，管理订单相关的业务逻辑
 * 负责维护订单的一致性边界和业务规则
 *
 * @example
 * ```typescript
 * const order = new Order(
 *   new OrderId('order-123'),
 *   new CustomerId('customer-456'),
 *   [orderItem1, orderItem2]
 * );
 *
 * order.addItem(new OrderItem(...));
 * order.confirm();
 * ```
 */
export class Order extends AggregateRoot {
  private _customerId: CustomerId;
  private _items: OrderItem[];
  private _status: OrderStatus;
  private _totalAmount: Money;
  private _shippingAddress: Address;
  private _paymentInfo: PaymentInfo;

  constructor(id: OrderId, customerId: CustomerId, items: OrderItem[] = []) {
    super(id);
    this._customerId = customerId;
    this._items = [...items];
    this._status = OrderStatus.DRAFT;
    this._totalAmount = this.calculateTotalAmount();

    // 验证业务规则
    this.validateOrderRules();

    // 发布订单创建事件
    this.addDomainEvent(new OrderCreatedEvent(this.id, this.customerId));
  }

  /**
   * 添加订单项
   *
   * @param item 订单项
   * @throws OrderClosedException 订单已关闭时抛出
   * @throws InvalidOrderItemException 订单项无效时抛出
   */
  public addItem(item: OrderItem): void {
    // 业务规则验证
    if (this.isClosed()) {
      throw new OrderClosedException(this.id);
    }

    if (!item.isValid()) {
      throw new InvalidOrderItemException(item);
    }

    // 添加订单项
    this._items.push(item);
    this._totalAmount = this.calculateTotalAmount();

    // 发布订单项添加事件
    this.addDomainEvent(new OrderItemAddedEvent(this.id, item));
  }

  /**
   * 确认订单
   *
   * @throws OrderClosedException 订单已关闭时抛出
   * @throws EmptyOrderException 订单为空时抛出
   */
  public confirm(): void {
    if (this.isClosed()) {
      throw new OrderClosedException(this.id);
    }

    if (this._items.length === 0) {
      throw new EmptyOrderException(this.id);
    }

    this._status = OrderStatus.CONFIRMED;
    this.addDomainEvent(new OrderConfirmedEvent(this.id, this._totalAmount));
  }

  /**
   * 取消订单
   *
   * @param reason 取消原因
   * @throws OrderClosedException 订单已关闭时抛出
   */
  public cancel(reason: string): void {
    if (this.isClosed()) {
      throw new OrderClosedException(this.id);
    }

    this._status = OrderStatus.CANCELLED;
    this.addDomainEvent(new OrderCancelledEvent(this.id, reason));
  }

  /**
   * 检查订单是否已关闭
   *
   * @returns 是否已关闭
   */
  public isClosed(): boolean {
    return (
      this._status === OrderStatus.CANCELLED ||
      this._status === OrderStatus.COMPLETED
    );
  }

  /**
   * 计算订单总金额
   *
   * @returns 总金额
   */
  private calculateTotalAmount(): Money {
    return this._items.reduce(
      (total, item) => total.add(item.getSubtotal()),
      Money.zero(),
    );
  }

  /**
   * 验证订单业务规则
   *
   * @throws BusinessRuleValidationException 业务规则验证失败时抛出
   */
  private validateOrderRules(): void {
    const rules = [
      new OrderAmountRule(this._totalAmount),
      new OrderItemCountRule(this._items.length),
      new OrderCustomerRule(this._customerId),
    ];

    for (const rule of rules) {
      const result = rule.validate();
      if (!result.isValid) {
        throw new BusinessRuleValidationException(result.errors);
      }
    }
  }
}
````

### 1.2 值对象实现示例

#### 1.2.1 邮箱值对象

````typescript
/**
 * 邮箱值对象
 *
 * @description 邮箱值对象，表示用户邮箱地址
 * 提供邮箱格式验证和不可变性保证
 *
 * @example
 * ```typescript
 * const email = new Email('user@example.com');
 * console.log(email.value); // 'user@example.com'
 * console.log(email.domain); // 'example.com'
 * ```
 */
export class Email extends BaseValueObject {
  private readonly _value: string;
  private readonly _domain: string;
  private readonly _localPart: string;

  constructor(value: string) {
    super();
    this.validateEmail(value);
    this._value = value.toLowerCase().trim();
    [this._localPart, this._domain] = this._value.split("@");
  }

  /**
   * 获取邮箱值
   *
   * @returns 邮箱值
   */
  public get value(): string {
    return this._value;
  }

  /**
   * 获取邮箱域名
   *
   * @returns 域名
   */
  public get domain(): string {
    return this._domain;
  }

  /**
   * 获取邮箱本地部分
   *
   * @returns 本地部分
   */
  public get localPart(): string {
    return this._localPart;
  }

  /**
   * 验证邮箱格式
   *
   * @param email 邮箱地址
   * @throws InvalidEmailException 邮箱格式无效时抛出
   */
  private validateEmail(email: string): void {
    if (!email || typeof email !== "string") {
      throw new InvalidEmailException("邮箱地址不能为空");
    }

    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0) {
      throw new InvalidEmailException("邮箱地址不能为空");
    }

    if (trimmedEmail.length > 254) {
      throw new InvalidEmailException("邮箱地址长度不能超过254个字符");
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new InvalidEmailException("邮箱地址格式无效");
    }
  }

  /**
   * 比较邮箱是否相等
   *
   * @param other 其他邮箱对象
   * @returns 是否相等
   */
  public equals(other: Email): boolean {
    if (!(other instanceof Email)) {
      return false;
    }

    return this._value === other._value;
  }

  /**
   * 转换为字符串
   *
   * @returns 字符串表示
   */
  public toString(): string {
    return this._value;
  }
}
````

#### 1.2.2 金额值对象

````typescript
/**
 * 金额值对象
 *
 * @description 金额值对象，表示货币金额
 * 提供金额计算和货币转换功能
 *
 * @example
 * ```typescript
 * const amount = new Money(100, 'CNY');
 * const total = amount.add(new Money(50, 'CNY'));
 * console.log(total.value); // 150
 * ```
 */
export class Money extends BaseValueObject {
  private readonly _amount: number;
  private readonly _currency: string;

  constructor(amount: number, currency: string = "CNY") {
    super();
    this.validateAmount(amount);
    this.validateCurrency(currency);
    this._amount = Math.round(amount * 100) / 100; // 保留两位小数
    this._currency = currency.toUpperCase();
  }

  /**
   * 获取金额
   *
   * @returns 金额
   */
  public get amount(): number {
    return this._amount;
  }

  /**
   * 获取货币
   *
   * @returns 货币
   */
  public get currency(): string {
    return this._currency;
  }

  /**
   * 创建零金额
   *
   * @param currency 货币
   * @returns 零金额
   */
  public static zero(currency: string = "CNY"): Money {
    return new Money(0, currency);
  }

  /**
   * 添加金额
   *
   * @param other 其他金额
   * @returns 相加后的金额
   * @throws CurrencyMismatchException 货币不匹配时抛出
   */
  public add(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new CurrencyMismatchException(this._currency, other._currency);
    }

    return new Money(this._amount + other._amount, this._currency);
  }

  /**
   * 减去金额
   *
   * @param other 其他金额
   * @returns 相减后的金额
   * @throws CurrencyMismatchException 货币不匹配时抛出
   */
  public subtract(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new CurrencyMismatchException(this._currency, other._currency);
    }

    return new Money(this._amount - other._amount, this._currency);
  }

  /**
   * 乘以倍数
   *
   * @param multiplier 倍数
   * @returns 相乘后的金额
   */
  public multiply(multiplier: number): Money {
    return new Money(this._amount * multiplier, this._currency);
  }

  /**
   * 比较金额大小
   *
   * @param other 其他金额
   * @returns 比较结果
   * @throws CurrencyMismatchException 货币不匹配时抛出
   */
  public compareTo(other: Money): number {
    if (this._currency !== other._currency) {
      throw new CurrencyMismatchException(this._currency, other._currency);
    }

    return this._amount - other._amount;
  }

  /**
   * 验证金额
   *
   * @param amount 金额
   * @throws InvalidAmountException 金额无效时抛出
   */
  private validateAmount(amount: number): void {
    if (typeof amount !== "number" || isNaN(amount)) {
      throw new InvalidAmountException("金额必须是有效数字");
    }

    if (amount < 0) {
      throw new InvalidAmountException("金额不能为负数");
    }

    if (amount > Number.MAX_SAFE_INTEGER) {
      throw new InvalidAmountException("金额超出安全范围");
    }
  }

  /**
   * 验证货币
   *
   * @param currency 货币
   * @throws InvalidCurrencyException 货币无效时抛出
   */
  private validateCurrency(currency: string): void {
    if (!currency || typeof currency !== "string") {
      throw new InvalidCurrencyException("货币不能为空");
    }

    if (currency.length !== 3) {
      throw new InvalidCurrencyException("货币代码必须是3位字符");
    }
  }

  /**
   * 比较金额是否相等
   *
   * @param other 其他金额对象
   * @returns 是否相等
   */
  public equals(other: Money): boolean {
    if (!(other instanceof Money)) {
      return false;
    }

    return this._amount === other._amount && this._currency === other._currency;
  }

  /**
   * 转换为字符串
   *
   * @returns 字符串表示
   */
  public toString(): string {
    return `${this._amount} ${this._currency}`;
  }
}
````

### 1.3 领域事件示例

#### 1.3.1 用户相关事件

```typescript
/**
 * 用户创建事件
 *
 * @description 用户创建时发布的领域事件
 * 包含用户创建的相关信息
 */
export class UserCreatedEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly email: Email,
    public readonly username: Username,
    occurredAt: Date = new Date(),
  ) {
    super("UserCreated", occurredAt);
  }

  public getAggregateId(): EntityId {
    return this.userId;
  }

  public getEventData(): Record<string, any> {
    return {
      userId: this.userId.value,
      email: this.email.value,
      username: this.username.value,
      occurredAt: this.occurredAt,
    };
  }
}

/**
 * 用户邮箱更改事件
 *
 * @description 用户邮箱更改时发布的领域事件
 * 包含邮箱更改的相关信息
 */
export class UserEmailChangedEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly oldEmail: Email,
    public readonly newEmail: Email,
    occurredAt: Date = new Date(),
  ) {
    super("UserEmailChanged", occurredAt);
  }

  public getAggregateId(): EntityId {
    return this.userId;
  }

  public getEventData(): Record<string, any> {
    return {
      userId: this.userId.value,
      oldEmail: this.oldEmail.value,
      newEmail: this.newEmail.value,
      occurredAt: this.occurredAt,
    };
  }
}

/**
 * 用户激活事件
 *
 * @description 用户激活时发布的领域事件
 * 包含用户激活的相关信息
 */
export class UserActivatedEvent extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    occurredAt: Date = new Date(),
  ) {
    super("UserActivated", occurredAt);
  }

  public getAggregateId(): EntityId {
    return this.userId;
  }

  public getEventData(): Record<string, any> {
    return {
      userId: this.userId.value,
      occurredAt: this.occurredAt,
    };
  }
}
```

---

## 2. 应用层代码示例

### 2.1 用例实现示例

#### 2.1.1 创建用户用例

````typescript
/**
 * 创建用户用例
 *
 * @description 创建新用户的业务用例
 * 协调领域层和基础设施层，实现用户创建的业务流程
 *
 * @example
 * ```typescript
 * const useCase = new CreateUserUseCase(
 *   userRepository,
 *   eventBus,
 *   emailService
 * );
 *
 * const response = await useCase.execute({
 *   email: 'user@example.com',
 *   username: 'john_doe',
 *   password: 'password123'
 * });
 * ```
 */
export class CreateUserUseCase extends BaseUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus,
    private readonly emailService: IEmailService,
    private readonly passwordService: IPasswordService,
  ) {
    super();
  }

  /**
   * 执行创建用户用例
   *
   * @param request 创建用户请求
   * @returns 创建用户响应
   * @throws ValidationException 验证失败时抛出
   * @throws DuplicateUserException 用户已存在时抛出
   * @throws EmailServiceException 邮件服务异常时抛出
   */
  public async execute(
    request: CreateUserRequest,
  ): Promise<CreateUserResponse> {
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

  /**
   * 验证请求参数
   *
   * @param request 请求对象
   * @throws ValidationException 验证失败时抛出
   */
  private validateRequest(request: CreateUserRequest): void {
    const errors: ValidationError[] = [];

    if (!request.email) {
      errors.push(new ValidationError("email", "邮箱地址不能为空"));
    }

    if (!request.username) {
      errors.push(new ValidationError("username", "用户名不能为空"));
    }

    if (!request.password) {
      errors.push(new ValidationError("password", "密码不能为空"));
    }

    if (errors.length > 0) {
      throw new ValidationException("请求参数验证失败", errors);
    }
  }

  /**
   * 检查用户是否已存在
   *
   * @param email 邮箱地址
   * @param username 用户名
   * @throws DuplicateUserException 用户已存在时抛出
   */
  private async checkUserExists(
    email: string,
    username: string,
  ): Promise<void> {
    const existingUser = await this.userRepository.findByEmailOrUsername(
      email,
      username,
    );
    if (existingUser) {
      throw new DuplicateUserException("用户已存在");
    }
  }

  /**
   * 创建用户实体
   *
   * @param request 请求对象
   * @returns 用户实体
   */
  private createUser(request: CreateUserRequest): User {
    const userId = new UserId(uuid());
    const email = new Email(request.email);
    const username = new Username(request.username);
    const hashedPassword = this.passwordService.hash(request.password);

    return new User(userId, email, username, hashedPassword);
  }

  /**
   * 发送欢迎邮件
   *
   * @param user 用户实体
   * @throws EmailServiceException 邮件服务异常时抛出
   */
  private async sendWelcomeEmail(user: User): Promise<void> {
    const emailMessage = new EmailMessage({
      to: user.email.value,
      subject: "欢迎注册HL8平台",
      body: `欢迎 ${user.username.value} 注册HL8平台！`,
    });

    await this.emailService.sendEmail(emailMessage);
  }
}
````

#### 2.1.2 更新用户用例

````typescript
/**
 * 更新用户用例
 *
 * @description 更新用户信息的业务用例
 * 处理用户信息更新业务逻辑
 *
 * @example
 * ```typescript
 * const useCase = new UpdateUserUseCase(
 *   userRepository,
 *   eventBus
 * );
 *
 * const response = await useCase.execute({
 *   userId: 'user-123',
 *   profile: { firstName: 'John', lastName: 'Doe' }
 * });
 * ```
 */
export class UpdateUserUseCase extends BaseUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus,
  ) {
    super();
  }

  /**
   * 执行更新用户用例
   *
   * @param request 更新用户请求
   * @returns 更新用户响应
   * @throws UserNotFoundException 用户不存在时抛出
   * @throws ValidationException 验证失败时抛出
   */
  public async execute(
    request: UpdateUserRequest,
  ): Promise<UpdateUserResponse> {
    // 1. 验证输入
    this.validateRequest(request);

    // 2. 获取用户
    const user = await this.getUser(request.userId);

    // 3. 更新用户信息
    this.updateUser(user, request);

    // 4. 保存用户
    await this.userRepository.save(user);

    // 5. 发布领域事件
    await this.eventBus.publish(user.getDomainEvents());

    return new UpdateUserResponse(user.id, user.email, user.username);
  }

  /**
   * 验证请求参数
   *
   * @param request 请求对象
   * @throws ValidationException 验证失败时抛出
   */
  private validateRequest(request: UpdateUserRequest): void {
    const errors: ValidationError[] = [];

    if (!request.userId) {
      errors.push(new ValidationError("userId", "用户ID不能为空"));
    }

    if (!request.profile) {
      errors.push(new ValidationError("profile", "用户资料不能为空"));
    }

    if (errors.length > 0) {
      throw new ValidationException("请求参数验证失败", errors);
    }
  }

  /**
   * 获取用户
   *
   * @param userId 用户ID
   * @returns 用户实体
   * @throws UserNotFoundException 用户不存在时抛出
   */
  private async getUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(new UserId(userId));
    if (!user) {
      throw new UserNotFoundException(userId);
    }
    return user;
  }

  /**
   * 更新用户信息
   *
   * @param user 用户实体
   * @param request 更新请求
   */
  private updateUser(user: User, request: UpdateUserRequest): void {
    if (request.profile) {
      const profile = new UserProfile(
        request.profile.firstName,
        request.profile.lastName,
        request.profile.phone,
        request.profile.address,
      );
      user.updateProfile(profile);
    }

    if (request.email) {
      user.changeEmail(new Email(request.email));
    }
  }
}
````

### 2.2 命令处理器示例

#### 2.2.1 创建用户命令处理器

````typescript
/**
 * 创建用户命令处理器
 *
 * @description 处理创建用户命令
 * 实现CQRS模式的命令处理逻辑
 *
 * @example
 * ```typescript
 * const handler = new CreateUserCommandHandler(
 *   userRepository,
 *   eventBus,
 *   emailService
 * );
 *
 * const response = await handler.handle(new CreateUserCommand(
 *   'user@example.com',
 *   'john_doe',
 *   'password123'
 * ));
 * ```
 */
export class CreateUserCommandHandler
  implements CommandHandler<CreateUserCommand, CreateUserResponse>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus,
    private readonly emailService: IEmailService,
  ) {}

  /**
   * 处理创建用户命令
   *
   * @param command 创建用户命令
   * @returns 创建用户响应
   * @throws ValidationException 验证失败时抛出
   * @throws DuplicateUserException 用户已存在时抛出
   */
  public async handle(command: CreateUserCommand): Promise<CreateUserResponse> {
    // 1. 验证命令
    this.validateCommand(command);

    // 2. 检查用户是否已存在
    await this.checkUserExists(command.email, command.username);

    // 3. 创建用户实体
    const user = this.createUser(command);

    // 4. 保存用户
    await this.userRepository.save(user);

    // 5. 发送欢迎邮件
    await this.sendWelcomeEmail(user);

    // 6. 发布领域事件
    await this.eventBus.publish(user.getDomainEvents());

    return new CreateUserResponse(user.id, user.email, user.username);
  }

  /**
   * 验证命令
   *
   * @param command 命令对象
   * @throws ValidationException 验证失败时抛出
   */
  private validateCommand(command: CreateUserCommand): void {
    const errors: ValidationError[] = [];

    if (!command.email) {
      errors.push(new ValidationError("email", "邮箱地址不能为空"));
    }

    if (!command.username) {
      errors.push(new ValidationError("username", "用户名不能为空"));
    }

    if (!command.password) {
      errors.push(new ValidationError("password", "密码不能为空"));
    }

    if (errors.length > 0) {
      throw new ValidationException("命令验证失败", errors);
    }
  }

  /**
   * 检查用户是否已存在
   *
   * @param email 邮箱地址
   * @param username 用户名
   * @throws DuplicateUserException 用户已存在时抛出
   */
  private async checkUserExists(
    email: string,
    username: string,
  ): Promise<void> {
    const existingUser = await this.userRepository.findByEmailOrUsername(
      email,
      username,
    );
    if (existingUser) {
      throw new DuplicateUserException("用户已存在");
    }
  }

  /**
   * 创建用户实体
   *
   * @param command 命令对象
   * @returns 用户实体
   */
  private createUser(command: CreateUserCommand): User {
    const userId = new UserId(uuid());
    const email = new Email(command.email);
    const username = new Username(command.username);

    return new User(userId, email, username);
  }

  /**
   * 发送欢迎邮件
   *
   * @param user 用户实体
   * @throws EmailServiceException 邮件服务异常时抛出
   */
  private async sendWelcomeEmail(user: User): Promise<void> {
    const emailMessage = new EmailMessage({
      to: user.email.value,
      subject: "欢迎注册HL8平台",
      body: `欢迎 ${user.username.value} 注册HL8平台！`,
    });

    await this.emailService.sendEmail(emailMessage);
  }
}
````

---

## 3. 基础设施层代码示例

### 3.1 仓储实现示例

#### 3.1.1 用户仓储实现

````typescript
/**
 * 用户仓储实现
 *
 * @description 用户仓储的数据库实现
 * 实现领域层定义的仓储接口，负责用户数据的持久化
 *
 * @example
 * ```typescript
 * const repository = new UserRepository(
 *   entityManager,
 *   isolationContext
 * );
 *
 * await repository.save(user);
 * const foundUser = await repository.findById(userId);
 * ```
 */
export class UserRepository implements IUserRepository {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly isolationContext: IsolationContext,
  ) {}

  /**
   * 保存用户
   *
   * @param user 用户实体
   * @throws DatabaseException 数据库异常时抛出
   */
  public async save(user: User): Promise<void> {
    try {
      const userEntity = this.mapToEntity(user);
      await this.entityManager.persistAndFlush(userEntity);
    } catch (error) {
      throw new DatabaseException("保存用户失败", error);
    }
  }

  /**
   * 根据ID查找用户
   *
   * @param id 用户ID
   * @returns 用户实体或null
   * @throws DatabaseException 数据库异常时抛出
   */
  public async findById(id: UserId): Promise<User | null> {
    try {
      const userEntity = await this.entityManager.findOne(UserEntity, {
        id: id.value,
        tenantId: this.isolationContext.tenantId.value,
      });

      return userEntity ? this.mapToDomain(userEntity) : null;
    } catch (error) {
      throw new DatabaseException("查找用户失败", error);
    }
  }

  /**
   * 根据邮箱或用户名查找用户
   *
   * @param email 邮箱地址
   * @param username 用户名
   * @returns 用户实体或null
   * @throws DatabaseException 数据库异常时抛出
   */
  public async findByEmailOrUsername(
    email: string,
    username: string,
  ): Promise<User | null> {
    try {
      const userEntity = await this.entityManager.findOne(UserEntity, {
        $or: [{ email: email }, { username: username }],
        tenantId: this.isolationContext.tenantId.value,
      });

      return userEntity ? this.mapToDomain(userEntity) : null;
    } catch (error) {
      throw new DatabaseException("查找用户失败", error);
    }
  }

  /**
   * 删除用户
   *
   * @param id 用户ID
   * @throws DatabaseException 数据库异常时抛出
   */
  public async delete(id: UserId): Promise<void> {
    try {
      const userEntity = await this.entityManager.findOne(UserEntity, {
        id: id.value,
        tenantId: this.isolationContext.tenantId.value,
      });

      if (userEntity) {
        await this.entityManager.removeAndFlush(userEntity);
      }
    } catch (error) {
      throw new DatabaseException("删除用户失败", error);
    }
  }

  /**
   * 将领域对象映射为实体
   *
   * @param user 用户领域对象
   * @returns 用户实体
   */
  private mapToEntity(user: User): UserEntity {
    const userEntity = new UserEntity();
    userEntity.id = user.id.value;
    userEntity.email = user.email.value;
    userEntity.username = user.username.value;
    userEntity.status = user.status;
    userEntity.tenantId = this.isolationContext.tenantId.value;
    userEntity.organizationId = this.isolationContext.organizationId?.value;
    userEntity.departmentId = this.isolationContext.departmentId?.value;
    userEntity.createdAt = user.auditInfo.createdAt;
    userEntity.updatedAt = user.auditInfo.updatedAt;

    return userEntity;
  }

  /**
   * 将实体映射为领域对象
   *
   * @param userEntity 用户实体
   * @returns 用户领域对象
   */
  private mapToDomain(userEntity: UserEntity): User {
    const userId = new UserId(userEntity.id);
    const email = new Email(userEntity.email);
    const username = new Username(userEntity.username);

    const user = new User(userId, email, username);

    // 设置用户状态
    if (userEntity.status === UserStatus.ACTIVE) {
      user.activate();
    }

    return user;
  }
}
````

### 3.2 外部服务适配器示例

#### 3.2.1 邮件服务适配器

````typescript
/**
 * 邮件服务适配器
 *
 * @description 邮件服务的实现，负责发送邮件
 * 实现领域层定义的服务接口，确保外部服务的一致性
 *
 * @example
 * ```typescript
 * const emailService = new EmailService(smtpClient);
 * await emailService.sendEmail(emailMessage);
 * ```
 */
export class EmailService implements IEmailService {
  constructor(private readonly smtpClient: SmtpClient) {}

  /**
   * 发送邮件
   *
   * @param emailMessage 邮件消息
   * @throws EmailServiceException 邮件服务异常时抛出
   */
  public async sendEmail(emailMessage: EmailMessage): Promise<void> {
    try {
      await this.smtpClient.send({
        to: emailMessage.to,
        subject: emailMessage.subject,
        body: emailMessage.body,
        from: emailMessage.from || "noreply@hl8.com",
      });
    } catch (error) {
      throw new EmailServiceException("发送邮件失败", error);
    }
  }

  /**
   * 发送欢迎邮件
   *
   * @param email 邮箱地址
   * @param username 用户名
   * @throws EmailServiceException 邮件服务异常时抛出
   */
  public async sendWelcomeEmail(
    email: string,
    username: string,
  ): Promise<void> {
    const emailMessage = new EmailMessage({
      to: email,
      subject: "欢迎注册HL8平台",
      body: `欢迎 ${username} 注册HL8平台！`,
    });

    await this.sendEmail(emailMessage);
  }
}
````

### 3.3 消息队列适配器示例

#### 3.3.1 Kafka消息队列适配器

````typescript
/**
 * Kafka消息队列适配器
 *
 * @description Kafka消息队列的实现，负责消息的发布和订阅
 * 实现领域层定义的消息队列接口，确保消息处理的一致性
 *
 * @example
 * ```typescript
 * const messageQueue = new KafkaMessageQueue(kafkaProducer, kafkaConsumer);
 * await messageQueue.publish('user-created', userData);
 * ```
 */
export class KafkaMessageQueue implements IMessageQueue {
  constructor(
    private readonly kafkaProducer: KafkaProducer,
    private readonly kafkaConsumer: KafkaConsumer,
  ) {}

  /**
   * 发布消息
   *
   * @param topic 主题
   * @param message 消息内容
   * @throws MessageQueueException 消息队列异常时抛出
   */
  public async publish(topic: string, message: any): Promise<void> {
    try {
      await this.kafkaProducer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
    } catch (error) {
      throw new MessageQueueException("发布消息失败", error);
    }
  }

  /**
   * 订阅消息
   *
   * @param topic 主题
   * @param handler 消息处理器
   * @throws MessageQueueException 消息队列异常时抛出
   */
  public async subscribe(
    topic: string,
    handler: (message: any) => Promise<void>,
  ): Promise<void> {
    try {
      await this.kafkaConsumer.subscribe({ topic });
      await this.kafkaConsumer.run({
        eachMessage: async ({ message }) => {
          const data = JSON.parse(message.value.toString());
          await handler(data);
        },
      });
    } catch (error) {
      throw new MessageQueueException("订阅消息失败", error);
    }
  }
}
````

---

## 4. 接口层代码示例

### 4.1 控制器实现示例

#### 4.1.1 用户控制器

````typescript
/**
 * 用户控制器
 *
 * @description 用户相关的REST API端点
 * 处理用户相关的HTTP请求，协调应用层服务
 *
 * @example
 * ```typescript
 * // 创建用户
 * POST /api/users
 * {
 *   "email": "user@example.com",
 *   "username": "john_doe",
 *   "password": "password123"
 * }
 *
 * // 获取用户
 * GET /api/users/:id
 * ```
 */
@Controller("users")
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  /**
   * 创建用户
   *
   * @param request 创建用户请求
   * @returns 创建用户响应
   * @throws ValidationException 验证失败时抛出
   * @throws DuplicateUserException 用户已存在时抛出
   */
  @Post()
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ summary: "创建用户" })
  @ApiResponse({
    status: 201,
    description: "用户创建成功",
    type: CreateUserResponse,
  })
  @ApiResponse({ status: 400, description: "请求参数无效" })
  @ApiResponse({ status: 409, description: "用户已存在" })
  public async createUser(
    @Body() request: CreateUserRequest,
  ): Promise<CreateUserResponse> {
    return await this.createUserUseCase.execute(request);
  }

  /**
   * 获取用户
   *
   * @param id 用户ID
   * @returns 用户信息
   * @throws UserNotFoundException 用户不存在时抛出
   */
  @Get(":id")
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiOperation({ summary: "获取用户" })
  @ApiResponse({
    status: 200,
    description: "获取用户成功",
    type: GetUserResponse,
  })
  @ApiResponse({ status: 404, description: "用户不存在" })
  public async getUser(@Param("id") id: string): Promise<GetUserResponse> {
    return await this.getUserUseCase.execute(new GetUserRequest(id));
  }

  /**
   * 更新用户
   *
   * @param id 用户ID
   * @param request 更新用户请求
   * @returns 更新用户响应
   * @throws UserNotFoundException 用户不存在时抛出
   * @throws ValidationException 验证失败时抛出
   */
  @Put(":id")
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiOperation({ summary: "更新用户" })
  @ApiResponse({
    status: 200,
    description: "更新用户成功",
    type: UpdateUserResponse,
  })
  @ApiResponse({ status: 404, description: "用户不存在" })
  @ApiResponse({ status: 400, description: "请求参数无效" })
  public async updateUser(
    @Param("id") id: string,
    @Body() request: UpdateUserRequest,
  ): Promise<UpdateUserResponse> {
    return await this.updateUserUseCase.execute(
      new UpdateUserRequest(id, request),
    );
  }

  /**
   * 删除用户
   *
   * @param id 用户ID
   * @returns 删除用户响应
   * @throws UserNotFoundException 用户不存在时抛出
   */
  @Delete(":id")
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiOperation({ summary: "删除用户" })
  @ApiResponse({
    status: 200,
    description: "删除用户成功",
    type: DeleteUserResponse,
  })
  @ApiResponse({ status: 404, description: "用户不存在" })
  public async deleteUser(
    @Param("id") id: string,
  ): Promise<DeleteUserResponse> {
    return await this.deleteUserUseCase.execute(new DeleteUserRequest(id));
  }
}
````

### 4.2 GraphQL解析器示例

#### 4.2.1 用户GraphQL解析器

````typescript
/**
 * 用户GraphQL解析器
 *
 * @description 用户相关的GraphQL查询和变更
 * 处理GraphQL请求，提供类型安全的API
 *
 * @example
 * ```typescript
 * // 创建用户
 * mutation CreateUser($input: CreateUserInput!) {
 *   createUser(input: $input) {
 *     id
 *     email
 *     username
 *   }
 * }
 *
 * // 获取用户
 * query GetUser($id: ID!) {
 *   user(id: $id) {
 *     id
 *     email
 *     username
 *     status
 *   }
 * }
 * ```
 */
@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
  ) {}

  /**
   * 创建用户
   *
   * @param input 创建用户输入
   * @returns 用户信息
   */
  @Mutation(() => User)
  @UseGuards(AuthenticationGuard)
  public async createUser(
    @Args("input") input: CreateUserInput,
  ): Promise<User> {
    const response = await this.createUserUseCase.execute(input);
    return response.user;
  }

  /**
   * 获取用户
   *
   * @param id 用户ID
   * @returns 用户信息
   */
  @Query(() => User)
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  public async getUser(@Args("id") id: string): Promise<User> {
    const response = await this.getUserUseCase.execute(new GetUserRequest(id));
    return response.user;
  }
}
````

### 4.3 中间件示例

#### 4.3.1 认证中间件

````typescript
/**
 * 认证中间件
 *
 * @description 处理用户认证，验证JWT令牌
 * 自动提取用户信息，设置认证上下文
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class AuthenticationMiddleware implements NestMiddleware {
 *   public async use(req: Request, res: Response, next: NextFunction): Promise<void> {
 *     const token = this.extractToken(req);
 *     if (!token) {
 *       throw new UnauthorizedException('未提供认证令牌');
 *     }
 *
 *     try {
 *       const payload = await this.jwtService.verifyAsync(token);
 *       req.user = payload;
 *       next();
 *     } catch (error) {
 *       throw new UnauthorizedException('认证令牌无效');
 *     }
 *   }
 * }
 * ```
 */
@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  public async use(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const token = this.extractToken(req);
    if (!token) {
      throw new UnauthorizedException("未提供认证令牌");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      req.user = payload;
      next();
    } catch (error) {
      throw new UnauthorizedException("认证令牌无效");
    }
  }

  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }
    return null;
  }
}
````

---

## 5. 完整业务模块示例

### 5.1 用户管理模块

#### 5.1.1 模块结构

```
user-management/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── value-objects/
│   │   │   ├── email.vo.ts
│   │   │   └── username.vo.ts
│   │   ├── domain-events/
│   │   │   ├── user-created.event.ts
│   │   │   └── user-updated.event.ts
│   │   └── interfaces/
│   │       └── user-repository.interface.ts
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── create-user.use-case.ts
│   │   │   └── update-user.use-case.ts
│   │   ├── commands/
│   │   │   └── create-user.command.ts
│   │   └── queries/
│   │       └── get-user.query.ts
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   └── user.repository.ts
│   │   └── external-services/
│   │       └── email.service.ts
│   ├── interface/
│   │   ├── controllers/
│   │   │   └── user.controller.ts
│   │   ├── resolvers/
│   │   │   └── user.resolver.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── user.dto.ts
│   └── module/
│       └── user.module.ts
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── package.json
```

#### 5.1.2 模块配置

```typescript
/**
 * 用户模块
 *
 * @description 用户管理模块配置
 * 集成领域层、应用层、基础设施层和接口层
 */
@Module({
  imports: [
    // 领域层模块
    DomainModule,

    // 应用层模块
    ApplicationModule,

    // 基础设施层模块
    InfrastructureModule,

    // 接口层模块
    InterfaceModule,
  ],
  providers: [
    // 用例
    CreateUserUseCase,
    UpdateUserUseCase,
    GetUserUseCase,
    DeleteUserUseCase,

    // 命令处理器
    CreateUserCommandHandler,
    UpdateUserCommandHandler,

    // 查询处理器
    GetUserQueryHandler,

    // 仓储
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },

    // 外部服务
    {
      provide: IEmailService,
      useClass: EmailService,
    },
  ],
  controllers: [UserController],
  resolvers: [UserResolver],
  exports: [
    CreateUserUseCase,
    UpdateUserUseCase,
    GetUserUseCase,
    DeleteUserUseCase,
  ],
})
export class UserModule {}
```

### 5.2 订单管理模块

#### 5.2.1 模块结构

```
order-management/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── order.entity.ts
│   │   ├── aggregates/
│   │   │   └── order.aggregate.ts
│   │   ├── value-objects/
│   │   │   ├── money.vo.ts
│   │   │   └── order-item.vo.ts
│   │   └── domain-events/
│   │       ├── order-created.event.ts
│   │       └── order-confirmed.event.ts
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── create-order.use-case.ts
│   │   │   └── confirm-order.use-case.ts
│   │   └── commands/
│   │       └── create-order.command.ts
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   └── order.repository.ts
│   │   └── external-services/
│   │       └── payment.service.ts
│   ├── interface/
│   │   ├── controllers/
│   │   │   └── order.controller.ts
│   │   └── dto/
│   │       └── order.dto.ts
│   └── module/
│       └── order.module.ts
├── test/
└── package.json
```

#### 5.2.2 订单聚合根

```typescript
/**
 * 订单聚合根
 *
 * @description 订单聚合根，管理订单相关的业务逻辑
 * 负责维护订单的一致性边界和业务规则
 */
export class Order extends AggregateRoot {
  private _customerId: CustomerId;
  private _items: OrderItem[];
  private _status: OrderStatus;
  private _totalAmount: Money;
  private _shippingAddress: Address;
  private _paymentInfo: PaymentInfo;

  constructor(id: OrderId, customerId: CustomerId, items: OrderItem[] = []) {
    super(id);
    this._customerId = customerId;
    this._items = [...items];
    this._status = OrderStatus.DRAFT;
    this._totalAmount = this.calculateTotalAmount();

    // 验证业务规则
    this.validateOrderRules();

    // 发布订单创建事件
    this.addDomainEvent(new OrderCreatedEvent(this.id, this.customerId));
  }

  /**
   * 添加订单项
   *
   * @param item 订单项
   * @throws OrderClosedException 订单已关闭时抛出
   * @throws InvalidOrderItemException 订单项无效时抛出
   */
  public addItem(item: OrderItem): void {
    // 业务规则验证
    if (this.isClosed()) {
      throw new OrderClosedException(this.id);
    }

    if (!item.isValid()) {
      throw new InvalidOrderItemException(item);
    }

    // 添加订单项
    this._items.push(item);
    this._totalAmount = this.calculateTotalAmount();

    // 发布订单项添加事件
    this.addDomainEvent(new OrderItemAddedEvent(this.id, item));
  }

  /**
   * 确认订单
   *
   * @throws OrderClosedException 订单已关闭时抛出
   * @throws EmptyOrderException 订单为空时抛出
   */
  public confirm(): void {
    if (this.isClosed()) {
      throw new OrderClosedException(this.id);
    }

    if (this._items.length === 0) {
      throw new EmptyOrderException(this.id);
    }

    this._status = OrderStatus.CONFIRMED;
    this.addDomainEvent(new OrderConfirmedEvent(this.id, this._totalAmount));
  }

  /**
   * 取消订单
   *
   * @param reason 取消原因
   * @throws OrderClosedException 订单已关闭时抛出
   */
  public cancel(reason: string): void {
    if (this.isClosed()) {
      throw new OrderClosedException(this.id);
    }

    this._status = OrderStatus.CANCELLED;
    this.addDomainEvent(new OrderCancelledEvent(this.id, reason));
  }

  /**
   * 检查订单是否已关闭
   *
   * @returns 是否已关闭
   */
  public isClosed(): boolean {
    return (
      this._status === OrderStatus.CANCELLED ||
      this._status === OrderStatus.COMPLETED
    );
  }

  /**
   * 计算订单总金额
   *
   * @returns 总金额
   */
  private calculateTotalAmount(): Money {
    return this._items.reduce(
      (total, item) => total.add(item.getSubtotal()),
      Money.zero(),
    );
  }

  /**
   * 验证订单业务规则
   *
   * @throws BusinessRuleValidationException 业务规则验证失败时抛出
   */
  private validateOrderRules(): void {
    const rules = [
      new OrderAmountRule(this._totalAmount),
      new OrderItemCountRule(this._items.length),
      new OrderCustomerRule(this._customerId),
    ];

    for (const rule of rules) {
      const result = rule.validate();
      if (!result.isValid) {
        throw new BusinessRuleValidationException(result.errors);
      }
    }
  }
}
```

---

## 📝 总结

代码示例为HL8 SAAS平台的开发提供了详细的实现参考。通过这些示例，开发团队可以：

- **理解架构模式**: 通过具体代码理解混合架构模式
- **学习最佳实践**: 通过示例代码学习最佳实践
- **快速开发**: 基于示例代码快速开发业务模块
- **保持一致性**: 确保代码风格和架构的一致性

这些代码示例涵盖了从领域层到接口层的完整实现，为业务模块开发提供了清晰的指导。
