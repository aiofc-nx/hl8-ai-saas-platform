/**
 * 查询处理器接口
 * @description 定义查询处理的契约
 */
import { Query } from "./query.js";

/**
 * 查询处理器接口
 * @template TQuery - 查询类型
 * @template TResult - 结果类型
 */
export interface QueryHandler<
  TQuery extends Query = Query,
  // 必须使用 any 类型：查询结果类型可以是任意结构，由具体的查询类型决定
  // 这是 CQRS 模式的核心需求，无法预先定义所有可能的查询结果类型
  TResult = any,
> {
  /**
   * 处理查询
   * @param query - 查询
   * @returns 查询结果
   */
  handle(query: TQuery): Promise<TResult>;
}
