import { BaseQuery } from "@hl8/application-kernel";
import { UserId } from "../../domain/value-objects/user-id.vo.js";
import { IsolationContext } from "../../domain/value-objects/isolation-context.vo.js";

/**
 * 权限检查查询参数
 *
 * @description 权限检查查询的参数配置
 * @since 1.0.0
 */
export interface CheckPermissionQueryParams {
  subject: string;
  action: string;
  resource?: string;
  conditions?: Record<string, unknown>;
}

/**
 * 权限检查查询
 *
 * @description 用于检查用户权限的查询对象
 * @since 1.0.0
 */
export class CheckPermissionQuery extends BaseQuery {
  /**
   * 创建权限检查查询
   *
   * @param userId - 用户ID
   * @param context - 隔离上下文
   * @param params - 查询参数
   * @param requestedBy - 请求者ID
   */
  constructor(
    public readonly userId: UserId,
    public readonly context: IsolationContext,
    public readonly params: CheckPermissionQueryParams,
    public readonly requestedBy?: string,
  ) {
    super();
  }

  /**
   * 获取查询类型
   *
   * @returns 查询类型
   */
  getQueryType(): string {
    return "CheckPermission";
  }

  /**
   * 获取查询数据
   *
   * @returns 查询数据
   */
  getQueryData(): Record<string, unknown> {
    return {
      userId: this.userId.getValue(),
      context: this.context.getValue(),
      params: this.params,
      requestedBy: this.requestedBy,
    };
  }

  /**
   * 验证查询
   *
   * @throws {Error} 当查询无效时抛出错误
   */
  validate(): void {
    if (!this.userId) {
      throw new Error("用户ID不能为空");
    }

    if (!this.context) {
      throw new Error("隔离上下文不能为空");
    }

    if (!this.params.subject) {
      throw new Error("权限主体不能为空");
    }

    if (!this.params.action) {
      throw new Error("操作类型不能为空");
    }
  }
}
