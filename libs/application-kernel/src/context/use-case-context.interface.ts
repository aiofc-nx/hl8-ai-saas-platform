/**
 * 用例执行上下文接口
 *
 * 提供用例执行所需的上下文信息
 * 包括租户信息、用户信息、请求标识等
 *
 * @since 1.0.0
 */

/**
 * 用例执行上下文接口
 *
 * 所有用例执行时都需要提供此上下文
 * 用于传递执行环境信息
 */
export interface IUseCaseContext {
  /**
   * 租户信息
   */
  tenant?: {
    id: string;
    name: string;
  };

  /**
   * 用户信息
   */
  user?: {
    id: string;
    username: string;
  };

  /**
   * 请求标识符
   */
  requestId: string;

  /**
   * 上下文时间戳
   */
  timestamp: Date;

  /**
   * 附加元数据
   */
  metadata?: Record<string, unknown>;
}
