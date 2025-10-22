/**
 * 查询处理器接口
 *
 * 提供处理领域查询的统一接口
 * 支持查询验证、执行和结果格式化
 *
 * @since 1.0.0
 */
import { BaseQuery } from "./base-query.js";

/**
 * 查询处理器接口
 *
 * 所有业务模块的查询处理器都应该实现此接口
 * 提供统一的查询处理模式
 *
 * @template TQuery - 查询类型
 * @template TResult - 查询结果类型
 */
export interface QueryHandler<
  TQuery extends BaseQuery = BaseQuery,
  TResult = any,
> {
  /**
   * 处理查询
   *
   * @param query - 要处理的查询
   * @returns 查询执行结果
   */
  handle(query: TQuery): Promise<TResult>;

  /**
   * 验证查询
   *
   * @param query - 要验证的查询
   * @throws {ApplicationLayerException} 如果查询无效则抛出应用层异常
   */
  validateQuery(query: TQuery): void;

  /**
   * 检查是否可以处理查询
   *
   * @param query - 要检查的查询
   * @returns 是否可以处理
   */
  canHandle(query: TQuery): boolean;

  /**
   * 获取处理器名称
   *
   * @returns 处理器名称
   */
  getHandlerName(): string;
}
