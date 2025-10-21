/**
 * 基础查询抽象类
 *
 * 提供所有领域查询的通用属性和行为
 * 与 domain-kernel 集成，使用 EntityId 和 IsolationContext
 *
 * @since 1.0.0
 */
import { GenericEntityId } from "@hl8/domain-kernel";
import { IsolationContext } from "@hl8/domain-kernel";

/**
 * 基础查询抽象类
 *
 * 所有业务模块的查询都应该继承此类
 * 提供统一的查询结构和行为
 */
export abstract class BaseQuery {
  /**
   * 查询唯一标识符
   */
  public readonly queryId: GenericEntityId;

  /**
   * 查询名称
   */
  public readonly queryName: string;

  /**
   * 查询描述
   */
  public readonly description: string;

  /**
   * 查询创建时间戳
   */
  public readonly timestamp: Date;

  /**
   * 隔离上下文（多租户支持）
   */
  public readonly isolationContext?: IsolationContext;

  /**
   * 查询元数据
   */
  public readonly metadata?: Record<string, unknown>;

  /**
   * 构造函数
   *
   * @param queryName - 查询名称
   * @param description - 查询描述
   * @param isolationContext - 隔离上下文（可选）
   * @param metadata - 查询元数据（可选）
   */
  constructor(
    queryName: string,
    description: string,
    isolationContext?: IsolationContext,
    metadata?: Record<string, unknown>,
  ) {
    this.queryId = GenericEntityId.generate();
    this.queryName = queryName;
    this.description = description;
    this.timestamp = new Date();
    this.isolationContext = isolationContext;
    this.metadata = metadata;
  }

  /**
   * 获取查询的字符串表示
   *
   * @returns 查询的字符串表示
   */
  toString(): string {
    return `${this.queryName}(${this.queryId.getValue()})`;
  }

  /**
   * 获取查询的 JSON 表示
   *
   * @returns 查询的 JSON 对象
   */
  toJSON(): Record<string, unknown> {
    return {
      queryId: this.queryId.getValue(),
      queryName: this.queryName,
      description: this.description,
      timestamp: this.timestamp.toISOString(),
      isolationContext: this.isolationContext?.buildLogContext(),
      metadata: this.metadata,
    };
  }
}
