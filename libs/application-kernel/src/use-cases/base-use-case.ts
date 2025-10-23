/**
 * 基础用例抽象类
 *
 * 提供所有业务用例的通用生命周期管理和验证
 * 支持上下文管理和权限控制
 *
 * @since 1.0.0
 */
import { IUseCaseContext } from "../context/use-case-context.interface.js";
import { GeneralBadRequestException } from "@hl8/exceptions";

/**
 * 基础用例抽象类
 *
 * 所有业务模块的用例都应该继承此类
 * 提供统一的用例结构和行为
 *
 * @template TRequest - 请求类型
 * @template TResponse - 响应类型
 */
export abstract class BaseUseCase<TRequest, TResponse> {
  /**
   * 用例名称
   */
  protected readonly useCaseName: string;

  /**
   * 用例描述
   */
  protected readonly useCaseDescription: string;

  /**
   * 用例版本
   */
  protected readonly useCaseVersion: string;

  /**
   * 所需权限
   */
  protected readonly requiredPermissions: string[];

  /**
   * 构造函数
   *
   * @param useCaseName - 用例名称
   * @param useCaseDescription - 用例描述
   * @param useCaseVersion - 用例版本（可选，默认为 "1.0.0"）
   * @param requiredPermissions - 所需权限（可选）
   */
  constructor(
    useCaseName: string,
    useCaseDescription: string,
    useCaseVersion: string = "1.0.0",
    requiredPermissions: string[] = [],
  ) {
    this.useCaseName = useCaseName;
    this.useCaseDescription = useCaseDescription;
    this.useCaseVersion = useCaseVersion;
    this.requiredPermissions = requiredPermissions;
  }

  /**
   * 执行用例
   *
   * @param request - 请求对象
   * @param context - 用例执行上下文
   * @returns 用例执行结果
   */
  async execute(
    request: TRequest,
    context: IUseCaseContext,
  ): Promise<TResponse> {
    // 验证请求
    this.validateRequest(request);

    // 验证权限
    await this.validatePermissions(context);

    // 执行用例逻辑
    return await this.executeUseCase(request, context);
  }

  /**
   * 执行用例逻辑（子类必须实现）
   *
   * @param request - 请求对象
   * @param context - 用例执行上下文
   * @returns 用例执行结果
   */
  protected abstract executeUseCase(
    request: TRequest,
    context: IUseCaseContext,
  ): Promise<TResponse>;

  /**
   * 验证请求（子类可以重写）
   *
   * @param request - 请求对象
   */
  protected validateRequest(request: TRequest): void {
    if (!request) {
      throw new GeneralBadRequestException(
        "应用层请求验证失败",
        "请求对象不能为空",
        {
          useCaseName: this.useCaseName,
          useCaseVersion: this.useCaseVersion,
          requestType: typeof request,
        },
      );
    }
  }

  /**
   * 验证权限
   *
   * @param context - 用例执行上下文
   */
  protected async validatePermissions(
    _context: IUseCaseContext,
  ): Promise<void> {
    if (this.requiredPermissions.length === 0) {
      return;
    }

    // 这里应该实现权限验证逻辑
    // 在实际实现中，应该检查用户是否具有所需权限
    // 为了简化，这里只是示例
    console.log(`验证权限: ${this.requiredPermissions.join(", ")}`);

    // 如果权限验证失败，应该抛出异常
    // 这里提供一个示例，实际实现需要根据具体的权限验证逻辑
    // if (!await this.checkPermissions(context)) {
    //   throw new ApplicationLayerException(
    //     "APPLICATION_PERMISSION_DENIED",
    //     "应用层权限验证失败",
    //     `缺少所需权限: ${this.requiredPermissions.join(', ')}`,
    //     403,
    //     {
    //       useCaseName: this.useCaseName,
    //       requiredPermissions: this.requiredPermissions,
    //       userId: context.userId,
    //       tenantId: context.tenantId,
    //     }
    //   );
    // }
  }

  /**
   * 获取用例名称
   *
   * @returns 用例名称
   */
  getUseCaseName(): string {
    return this.useCaseName;
  }

  /**
   * 获取用例描述
   *
   * @returns 用例描述
   */
  getUseCaseDescription(): string {
    return this.useCaseDescription;
  }

  /**
   * 获取用例版本
   *
   * @returns 用例版本
   */
  getUseCaseVersion(): string {
    return this.useCaseVersion;
  }

  /**
   * 获取所需权限
   *
   * @returns 所需权限列表
   */
  getRequiredPermissions(): string[] {
    return [...this.requiredPermissions];
  }
}
