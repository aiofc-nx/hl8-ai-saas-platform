/**
 * 查询基类
 * @description CQRS 查询的抽象基类
 */
export abstract class Query {
  constructor(
    public readonly queryId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
