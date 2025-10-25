import {
  BaseEntity,
  GenericEntityId,
  UserId,
  RoleId,
  TenantId,
  OrganizationId,
  DepartmentId,
  IsolationContext,
  IPartialAuditInfo,
} from "@hl8/domain-kernel";
import { CaslCondition } from "../value-objects/casl-condition.vo.js";

/**
 * CASL权限能力实体
 *
 * @description 表示用户的CASL权限能力，包含具体的操作权限和条件
 * @since 1.0.0
 */
export class CaslAbility extends BaseEntity {
  private readonly _abilityUserId: UserId;
  private _roleId: RoleId | null;
  private _subject: string;
  private _action: string;
  private _conditions: CaslCondition[];
  private _context: IsolationContext;

  /**
   * 创建CASL权限能力实体
   *
   * @param id - 权限能力ID
   * @param userId - 用户ID
   * @param subject - 权限主体
   * @param action - 操作类型
   * @param context - 隔离上下文
   * @param roleId - 角色ID（可选）
   * @param conditions - 权限条件（可选）
   * @param auditInfo - 审计信息
   */
  constructor(
    id: GenericEntityId,
    tenantId: TenantId,
    userId: UserId,
    subject: string,
    action: string,
    context: IsolationContext,
    roleId: RoleId | null = null,
    conditions: CaslCondition[] = [],
    organizationId?: OrganizationId,
    departmentId?: DepartmentId,
    auditInfo?: IPartialAuditInfo,
  ) {
    super(
      id,
      tenantId,
      organizationId,
      departmentId,
      userId, // Pass userId to BaseEntity
      false,
      undefined,
      auditInfo,
    );
    this._abilityUserId = userId;
    this._roleId = roleId;
    this._subject = subject;
    this._action = action;
    this._conditions = [...conditions];
    this._context = context;
  }

  /**
   * 获取用户ID
   *
   * @returns 用户ID
   */
  get userId(): UserId {
    return this._abilityUserId;
  }

  /**
   * 获取角色ID
   *
   * @returns 角色ID或null
   */
  get roleId(): RoleId | null {
    return this._roleId;
  }

  /**
   * 获取权限主体
   *
   * @returns 权限主体
   */
  get subject(): string {
    return this._subject;
  }

  /**
   * 获取操作类型
   *
   * @returns 操作类型
   */
  get action(): string {
    return this._action;
  }

  /**
   * 获取权限条件
   *
   * @returns 权限条件数组
   */
  get conditions(): CaslCondition[] {
    return [...this._conditions];
  }

  /**
   * 获取隔离上下文
   *
   * @returns 隔离上下文
   */
  get context(): IsolationContext {
    return this._context;
  }

  /**
   * 更新权限主体
   *
   * @param subject - 新的权限主体
   */
  updateSubject(subject: string): void {
    if (!subject || subject.trim().length === 0) {
      throw new Error("权限主体不能为空");
    }

    this._subject = subject;
    this.updateTimestamp();
  }

  /**
   * 更新操作类型
   *
   * @param action - 新的操作类型
   */
  updateAction(action: string): void {
    if (!action || action.trim().length === 0) {
      throw new Error("操作类型不能为空");
    }

    this._action = action;
    this.updateTimestamp();
  }

  /**
   * 更新角色ID
   *
   * @param roleId - 新的角色ID
   */
  updateRoleId(roleId: RoleId | null): void {
    this._roleId = roleId;
    this.updateTimestamp();
  }

  /**
   * 添加权限条件
   *
   * @param condition - 权限条件
   */
  addCondition(condition: CaslCondition): void {
    if (!condition) {
      throw new Error("权限条件不能为空");
    }

    this._conditions.push(condition);
    this.updateTimestamp();
  }

  /**
   * 移除权限条件
   *
   * @param condition - 要移除的权限条件
   */
  removeCondition(condition: CaslCondition): void {
    const index = this._conditions.findIndex((c) => c.equals(condition));
    if (index >= 0) {
      this._conditions.splice(index, 1);
      this.updateTimestamp();
    }
  }

  /**
   * 更新权限条件
   *
   * @param conditions - 新的权限条件数组
   */
  updateConditions(conditions: CaslCondition[]): void {
    if (!conditions) {
      throw new Error("权限条件数组不能为空");
    }

    this._conditions = [...conditions];
    this.updateTimestamp();
  }

  /**
   * 更新隔离上下文
   *
   * @param context - 新的隔离上下文
   */
  updateContext(context: IsolationContext): void {
    if (!context) {
      throw new Error("隔离上下文不能为空");
    }

    this._context = context;
    this.updateTimestamp();
  }

  /**
   * 检查是否具有特定操作权限
   *
   * @param action - 操作类型
   * @returns 是否具有权限
   */
  canPerform(action: string): boolean {
    return this._action === action || this._action === "manage";
  }

  /**
   * 检查是否针对特定主体
   *
   * @param subject - 权限主体
   * @returns 是否针对该主体
   */
  isForSubject(subject: string): boolean {
    return this._subject === subject || this._subject === "all";
  }

  /**
   * 检查权限条件是否匹配
   *
   * @param target - 目标对象
   * @returns 是否匹配
   */
  matchesConditions(target: Record<string, unknown>): boolean {
    if (this._conditions.length === 0) {
      return true;
    }

    return this._conditions.every((condition) => condition.evaluate(target));
  }

  /**
   * 检查权限是否适用于指定上下文
   *
   * @param context - 目标上下文
   * @returns 是否适用
   */
  appliesToContext(context: IsolationContext): boolean {
    // Compare isolation contexts by comparing their constituent IDs
    return (
      this._context.tenantId?.equals(context.tenantId) === true &&
      this._context.organizationId?.equals(context.organizationId) === true &&
      this._context.departmentId?.equals(context.departmentId) === true &&
      this._context.userId?.equals(context.userId) === true
    );
  }

  /**
   * 获取权限描述
   *
   * @returns 权限描述字符串
   */
  getDescription(): string {
    const conditionsDesc =
      this._conditions.length > 0
        ? ` with conditions: ${this._conditions.map((c) => c.toString()).join(", ")}`
        : "";

    return `${this._action} ${this._subject}${conditionsDesc}`;
  }

  /**
   * 检查是否为管理权限
   *
   * @returns 是否为管理权限
   */
  isManagePermission(): boolean {
    return this._action === "manage";
  }

  /**
   * 检查是否为全局权限
   *
   * @returns 是否为全局权限
   */
  isGlobalPermission(): boolean {
    return this._subject === "all";
  }
}
