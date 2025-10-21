/**
 * 基础使用示例
 *
 * 演示如何使用应用内核的基础功能
 * 包括命令、查询、用例和事件处理
 *
 * @since 1.0.0
 */
import {
  BaseCommand,
  BaseQuery,
  BaseUseCase,
  BaseCommandUseCase,
} from "@hl8/application-kernel";
import {
  EntityId,
  IsolationContext,
  TenantId,
  UserId,
} from "@hl8/domain-kernel";
import {
  IUseCaseContext,
  IEventBus,
  ITransactionManager,
} from "@hl8/application-kernel";

// 示例：创建用户命令
export class CreateUserCommand extends BaseCommand {
  constructor(
    public readonly email: string,
    public readonly username: string,
    public readonly displayName: string,
    isolationContext?: IsolationContext,
  ) {
    super("CreateUserCommand", "创建用户命令", isolationContext);
  }
}

// 示例：获取用户查询
export class GetUserQuery extends BaseQuery {
  constructor(
    public readonly userId: UserId,
    isolationContext?: IsolationContext,
  ) {
    super("GetUserQuery", "获取用户查询", isolationContext);
  }
}

// 示例：创建用户用例
export class CreateUserUseCase extends BaseCommandUseCase<
  CreateUserCommand,
  CreateUserResult
> {
  constructor(
    private readonly userRepository: IUserRepository,
    eventBus?: IEventBus,
    transactionManager?: ITransactionManager,
  ) {
    super(
      "CreateUser",
      "创建用户用例",
      "1.0.0",
      ["user:create"],
      eventBus,
      transactionManager,
    );
  }

  protected async executeCommand(
    request: CreateUserCommand,
    context: IUseCaseContext,
  ): Promise<CreateUserResult> {
    // 创建用户逻辑
    const user = new User(
      EntityId.create(),
      request.email,
      request.username,
      request.displayName,
    );

    // 保存用户
    await this.userRepository.save(user);

    // 发布领域事件
    await this.publishDomainEvents(user);

    return new CreateUserResult(
      user.getId(),
      user.getEmail(),
      user.getUsername(),
    );
  }
}

// 示例：获取用户用例
export class GetUserUseCase extends BaseUseCase<GetUserQuery, GetUserResult> {
  constructor(private readonly userRepository: IUserRepository) {
    super("GetUser", "获取用户用例", "1.0.0");
  }

  protected async executeUseCase(
    request: GetUserQuery,
    context: IUseCaseContext,
  ): Promise<GetUserResult> {
    const user = await this.userRepository.findById(request.userId);

    if (!user) {
      throw new Error("用户不存在");
    }

    return new GetUserResult(
      user.getId(),
      user.getEmail(),
      user.getUsername(),
      user.getDisplayName(),
    );
  }
}

// 示例：使用应用内核
export async function exampleUsage() {
  // 创建隔离上下文
  const isolationContext = IsolationContext.tenant(
    TenantId.create("tenant-123"),
  );

  // 创建用例上下文
  const useCaseContext: IUseCaseContext = {
    tenant: { id: "tenant-123", name: "企业租户" },
    user: { id: "user-456", username: "admin" },
    requestId: "req-789",
    timestamp: new Date(),
  };

  // 创建命令
  const createUserCommand = new CreateUserCommand(
    "user@example.com",
    "username",
    "User Name",
    isolationContext,
  );

  // 创建查询
  const getUserQuery = new GetUserQuery(
    UserId.create("user-456"),
    isolationContext,
  );

  // 执行用例
  const createUserUseCase = new CreateUserUseCase(
    new UserRepository(),
    new EventBus(),
    new TransactionManager(),
  );

  const result = await createUserUseCase.execute(
    createUserCommand,
    useCaseContext,
  );
  console.log("用户创建成功:", result);
}

// 辅助类型和类
interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
}

class User {
  constructor(
    private readonly id: EntityId,
    private readonly email: string,
    private readonly username: string,
    private readonly displayName: string,
  ) {}

  getId(): EntityId {
    return this.id;
  }
  getEmail(): string {
    return this.email;
  }
  getUsername(): string {
    return this.username;
  }
  getDisplayName(): string {
    return this.displayName;
  }
  getUncommittedEvents(): unknown[] {
    return [];
  }
  markEventsAsCommitted(): void {}
}

class CreateUserResult {
  constructor(
    public readonly userId: EntityId,
    public readonly email: string,
    public readonly username: string,
  ) {}
}

class GetUserResult {
  constructor(
    public readonly userId: EntityId,
    public readonly email: string,
    public readonly username: string,
    public readonly displayName: string,
  ) {}
}

class UserRepository implements IUserRepository {
  async save(user: User): Promise<void> {
    // 实现保存逻辑
  }

  async findById(id: UserId): Promise<User | null> {
    // 实现查找逻辑
    return null;
  }
}

class EventBus implements IEventBus {
  async publish(event: any): Promise<void> {
    // 实现事件发布
  }

  async publishAll(events: any[]): Promise<void> {
    // 实现批量事件发布
  }

  subscribe(eventType: string, handler: any): void {
    // 实现事件订阅
  }

  unsubscribe(eventType: string, handler: any): void {
    // 实现事件取消订阅
  }
}

class TransactionManager implements ITransactionManager {
  async begin(): Promise<void> {
    // 实现事务开始
  }

  async commit(): Promise<void> {
    // 实现事务提交
  }

  async rollback(): Promise<void> {
    // 实现事务回滚
  }

  isActive(): boolean {
    // 实现事务状态检查
    return false;
  }
}
