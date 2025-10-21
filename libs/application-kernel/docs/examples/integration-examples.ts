/**
 * 集成示例
 *
 * 演示多个业务模块如何使用相同的应用内核模式
 * 展示应用层一致性的实现
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
  OrganizationId,
  DepartmentId,
  UserId,
} from "@hl8/domain-kernel";
import { IUseCaseContext } from "@hl8/application-kernel";

// 用户模块示例
export class UserModule {
  // 用户命令
  static CreateUserCommand = class extends BaseCommand {
    constructor(
      public readonly email: string,
      public readonly username: string,
      isolationContext?: IsolationContext,
    ) {
      super("CreateUserCommand", "创建用户命令", isolationContext);
    }
  };

  // 用户查询
  static GetUserQuery = class extends BaseQuery {
    constructor(
      public readonly userId: UserId,
      isolationContext?: IsolationContext,
    ) {
      super("GetUserQuery", "获取用户查询", isolationContext);
    }
  };

  // 用户用例
  static CreateUserUseCase = class extends BaseCommandUseCase<any, any> {
    protected async executeCommand(
      request: any,
      context: IUseCaseContext,
    ): Promise<any> {
      // 用户创建逻辑
      return { success: true };
    }
  };
}

// 组织模块示例
export class OrganizationModule {
  // 组织命令
  static CreateOrganizationCommand = class extends BaseCommand {
    constructor(
      public readonly name: string,
      public readonly description: string,
      isolationContext?: IsolationContext,
    ) {
      super("CreateOrganizationCommand", "创建组织命令", isolationContext);
    }
  };

  // 组织查询
  static GetOrganizationQuery = class extends BaseQuery {
    constructor(
      public readonly organizationId: OrganizationId,
      isolationContext?: IsolationContext,
    ) {
      super("GetOrganizationQuery", "获取组织查询", isolationContext);
    }
  };

  // 组织用例
  static CreateOrganizationUseCase = class extends BaseCommandUseCase<
    any,
    any
  > {
    protected async executeCommand(
      request: any,
      context: IUseCaseContext,
    ): Promise<any> {
      // 组织创建逻辑
      return { success: true };
    }
  };
}

// 部门模块示例
export class DepartmentModule {
  // 部门命令
  static CreateDepartmentCommand = class extends BaseCommand {
    constructor(
      public readonly name: string,
      public readonly organizationId: OrganizationId,
      isolationContext?: IsolationContext,
    ) {
      super("CreateDepartmentCommand", "创建部门命令", isolationContext);
    }
  };

  // 部门查询
  static GetDepartmentQuery = class extends BaseQuery {
    constructor(
      public readonly departmentId: DepartmentId,
      isolationContext?: IsolationContext,
    ) {
      super("GetDepartmentQuery", "获取部门查询", isolationContext);
    }
  };

  // 部门用例
  static CreateDepartmentUseCase = class extends BaseCommandUseCase<any, any> {
    protected async executeCommand(
      request: any,
      context: IUseCaseContext,
    ): Promise<any> {
      // 部门创建逻辑
      return { success: true };
    }
  };
}

// 一致性验证示例
export class ConsistencyValidator {
  /**
   * 验证模块是否遵循应用内核模式
   */
  static validateModuleConsistency(module: any): boolean {
    // 检查是否继承自正确的基类
    const hasBaseCommand = this.hasBaseCommand(module);
    const hasBaseQuery = this.hasBaseQuery(module);
    const hasBaseUseCase = this.hasBaseUseCase(module);

    return hasBaseCommand && hasBaseQuery && hasBaseUseCase;
  }

  private static hasBaseCommand(module: any): boolean {
    // 检查是否有继承自 BaseCommand 的类
    return Object.values(module).some(
      (cls: any) => cls.prototype instanceof BaseCommand,
    );
  }

  private static hasBaseQuery(module: any): boolean {
    // 检查是否有继承自 BaseQuery 的类
    return Object.values(module).some(
      (cls: any) => cls.prototype instanceof BaseQuery,
    );
  }

  private static hasBaseUseCase(module: any): boolean {
    // 检查是否有继承自 BaseUseCase 的类
    return Object.values(module).some(
      (cls: any) => cls.prototype instanceof BaseUseCase,
    );
  }
}

// 使用示例
export async function demonstrateConsistency() {
  // 创建隔离上下文
  const tenantContext = IsolationContext.tenant(TenantId.create("tenant-123"));
  const orgContext = IsolationContext.organization(
    TenantId.create("tenant-123"),
    OrganizationId.create("org-456"),
  );
  const deptContext = IsolationContext.department(
    TenantId.create("tenant-123"),
    OrganizationId.create("org-456"),
    DepartmentId.create("dept-789"),
  );

  // 创建用例上下文
  const useCaseContext: IUseCaseContext = {
    tenant: { id: "tenant-123", name: "企业租户" },
    user: { id: "user-456", username: "admin" },
    requestId: "req-789",
    timestamp: new Date(),
  };

  // 用户模块操作
  const createUserCommand = new UserModule.CreateUserCommand(
    "user@example.com",
    "username",
    tenantContext,
  );

  const getUserQuery = new UserModule.GetUserQuery(
    UserId.create("user-456"),
    tenantContext,
  );

  // 组织模块操作
  const createOrgCommand = new OrganizationModule.CreateOrganizationCommand(
    "组织名称",
    "组织描述",
    orgContext,
  );

  const getOrgQuery = new OrganizationModule.GetOrganizationQuery(
    OrganizationId.create("org-456"),
    orgContext,
  );

  // 部门模块操作
  const createDeptCommand = new DepartmentModule.CreateDepartmentCommand(
    "部门名称",
    OrganizationId.create("org-456"),
    deptContext,
  );

  const getDeptQuery = new DepartmentModule.GetDepartmentQuery(
    DepartmentId.create("dept-789"),
    deptContext,
  );

  // 验证一致性
  const userModuleConsistent =
    ConsistencyValidator.validateModuleConsistency(UserModule);
  const orgModuleConsistent =
    ConsistencyValidator.validateModuleConsistency(OrganizationModule);
  const deptModuleConsistent =
    ConsistencyValidator.validateModuleConsistency(DepartmentModule);

  console.log("用户模块一致性:", userModuleConsistent);
  console.log("组织模块一致性:", orgModuleConsistent);
  console.log("部门模块一致性:", deptModuleConsistent);

  // 所有模块都应该遵循相同的模式
  console.log(
    "所有模块都遵循应用内核模式:",
    userModuleConsistent && orgModuleConsistent && deptModuleConsistent,
  );
}
