/**
 * 读模型仓储接口
 * @description 定义查询模型访问契约
 */
import { Query } from "@hl8/application-kernel";

/**
 * 读模型仓储接口
 * @template TQuery - 查询类型
 * @template TResult - 结果类型
 */
export interface ReadModelRepository<
  TQuery extends Query = Query,
  TResult = any,
> {
  /**
   * 执行查询
   * @param query - 查询
   * @returns 查询结果
   */
  execute(query: TQuery): Promise<TResult>;
}
