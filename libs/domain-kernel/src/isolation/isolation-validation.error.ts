/**
 * 隔离验证异常
 *
 * @description 当隔离上下文或 ID 验证失败时抛出
 * 根据错误代码自动选择合适的异常类型
 *
 * ## 错误代码映射
 *
 * - INVALID_TENANT_ID, TENANT_ID_TOO_LONG, INVALID_TENANT_ID_FORMAT: TenantContextViolationException
 * - INVALID_ORGANIZATION_ID, INVALID_ORGANIZATION_CONTEXT: OrganizationIsolationException
 * - INVALID_DEPARTMENT_ID, INVALID_DEPARTMENT_CONTEXT: DepartmentIsolationException
 * - INVALID_USER_ID: TenantDataIsolationException
 * - ACCESS_DENIED: TenantPermissionViolationException
 * - 其他: TenantDataIsolationException
 *
 * @example
 * ```typescript
 * throw new IsolationValidationError(
 *   '租户 ID 必须是非空字符串',
 *   'INVALID_TENANT_ID',
 *   { value: '' }
 * );
 * ```
 *
 * @since 0.1.0
 */
import {
  TenantDataIsolationException,
  OrganizationIsolationException,
  DepartmentIsolationException,
  TenantContextViolationException,
  TenantPermissionViolationException,
} from "/home/arligle/hl8/hl8-ai-saas-platform/libs/exceptions/dist/core/tenant/index.js";

export class IsolationValidationError {
  private _exception:
    | TenantDataIsolationException
    | OrganizationIsolationException
    | DepartmentIsolationException
    | TenantContextViolationException
    | TenantPermissionViolationException;

  constructor(
    message: string,
    /** 错误代码 */
    code: string,
    /** 上下文信息 */
    context?: Record<string, unknown>,
  ) {
    // 根据错误代码选择合适的异常类型
    switch (code) {
      case "INVALID_TENANT_ID":
      case "TENANT_ID_TOO_LONG":
      case "INVALID_TENANT_ID_FORMAT":
        this._exception = new TenantContextViolationException(message, {
          contextType: "tenant_id",
          providedValue: context?.value,
          expectedFormat: "uuid",
          ...context,
        });
        break;

      case "INVALID_ORGANIZATION_ID":
      case "INVALID_ORGANIZATION_CONTEXT":
        this._exception = new OrganizationIsolationException(message, {
          violationType: "invalid_organization_context",
          ...context,
        });
        break;

      case "INVALID_DEPARTMENT_ID":
      case "INVALID_DEPARTMENT_CONTEXT":
        this._exception = new DepartmentIsolationException(message, {
          violationType: "invalid_department_context",
          ...context,
        });
        break;

      case "INVALID_USER_ID":
        this._exception = new TenantDataIsolationException(message, {
          resourceType: "user",
          violationType: "invalid_user_id",
          ...context,
        });
        break;

      case "ACCESS_DENIED":
        this._exception = new TenantPermissionViolationException(message, {
          permission: context?.permission || "access",
          resource: context?.resource || "data",
          ...context,
        });
        break;

      default:
        this._exception = new TenantDataIsolationException(message, {
          violationType: "isolation_validation_failed",
          ...context,
        });
        break;
    }
  }

  // 代理所有异常属性到内部异常
  get errorCode(): string {
    return this._exception.errorCode;
  }
  get title(): string {
    return this._exception.title;
  }
  get detail(): string {
    return this._exception.detail;
  }
  get status(): number {
    return (this._exception as unknown as { status: number }).status;
  }
  get data(): Record<string, unknown> | undefined {
    return this._exception.data;
  }
  get type(): string {
    return this._exception.type;
  }
  get name(): string {
    return "IsolationValidationError";
  }

  // 代理所有异常方法到内部异常
  toRFC7807() {
    return this._exception.toRFC7807();
  }
  getStackTrace() {
    return (
      (this._exception as { getStackTrace?: () => string }).getStackTrace?.() ||
      ""
    );
  }
  getRootCause() {
    return (this._exception as { rootCause?: Error }).rootCause;
  }
  getCategory() {
    return this._exception.getCategory();
  }
  getLayer() {
    return this._exception.getLayer();
  }

  /**
   * 获取隔离验证信息
   * @returns 隔离验证详细信息
   */
  getIsolationInfo(): {
    isolationCode: string;
    isolationMessage: string;
    isolationContext: Record<string, unknown>;
    timestamp: string;
  } {
    return {
      isolationCode: this.errorCode,
      isolationMessage: this.detail,
      isolationContext: this.data || {},
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 获取内部异常实例
   * @returns 内部异常实例
   */
  getInternalException():
    | TenantDataIsolationException
    | OrganizationIsolationException
    | DepartmentIsolationException
    | TenantContextViolationException
    | TenantPermissionViolationException {
    return this._exception;
  }
}
