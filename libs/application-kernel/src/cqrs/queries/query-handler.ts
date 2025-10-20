/**
 * 查询处理器接口
 * @description 定义查询处理的契约
 */
import { Query } from "./query";

/**
 * 查询处理器接口
 * @template TQuery - 查询类型
 * @template TResult - 结果类型
 */
export interface QueryHandler<TQuery extends Query = Query, TResult = any> {
  /**
   * 处理查询
   * @param query - 查询
   * @returns 查询结果
   */
  handle(query: TQuery): Promise<TResult>;
}
