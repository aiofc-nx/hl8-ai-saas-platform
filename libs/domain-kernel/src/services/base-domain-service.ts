/**
 * 基础领域服务类
 * @description 所有领域服务的基类，提供跨聚合的业务逻辑处理
 *
 * ## 领域服务职责
 * - 处理跨聚合的业务逻辑
 * - 协调多个聚合的操作
 * - 实现复杂的业务规则
 * - 提供业务逻辑的复用
 *
 * @since 1.0.0
 */

/**
 * 基础领域服务类
 * @description 提供领域服务的通用功能和接口
 */
export abstract class BaseDomainService {
  /**
   * 构造函数
   */
  constructor() {
    // 领域服务初始化
  }

  /**
   * 验证业务规则
   * @description 子类可以重写此方法进行业务规则验证
   *
   * @param context - 业务上下文
   * @throws {Error} 当业务规则验证失败时抛出异常
   */
  protected validateBusinessRules(context?: any): void {
    // 子类可以重写此方法进行业务规则验证
  }

  /**
   * 执行业务逻辑
   * @description 子类必须实现此方法执行具体的业务逻辑
   *
   * @param input - 输入参数
   * @returns 执行结果
   */
  abstract execute(input: any): Promise<any> | any;

  /**
   * 检查服务是否可用
   * @returns 是否可用
   */
  isAvailable(): boolean {
    return true;
  }

  /**
   * 获取服务名称
   * @returns 服务名称
   */
  getServiceName(): string {
    return this.constructor.name;
  }

  /**
   * 获取服务版本
   * @returns 服务版本
   */
  getServiceVersion(): string {
    return "1.0.0";
  }
}
