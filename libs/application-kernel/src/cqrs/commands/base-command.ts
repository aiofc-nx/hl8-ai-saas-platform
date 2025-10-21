/**
 * 基础命令抽象类
 *
 * 提供所有领域命令的通用属性和行为
 * 与 domain-kernel 集成，使用 EntityId 和 IsolationContext
 *
 * @since 1.0.0
 */
import { GenericEntityId } from "@hl8/domain-kernel";
import { IsolationContext } from "@hl8/domain-kernel";

/**
 * 基础命令抽象类
 *
 * 所有业务模块的命令都应该继承此类
 * 提供统一的命令结构和行为
 */
export abstract class BaseCommand {
  /**
   * 命令唯一标识符
   */
  public readonly commandId: GenericEntityId;

  /**
   * 命令名称
   */
  public readonly commandName: string;

  /**
   * 命令描述
   */
  public readonly description: string;

  /**
   * 命令创建时间戳
   */
  public readonly timestamp: Date;

  /**
   * 隔离上下文（多租户支持）
   */
  public readonly isolationContext?: IsolationContext;

  /**
   * 命令元数据
   */
  public readonly metadata?: Record<string, unknown>;

  /**
   * 构造函数
   *
   * @param commandName - 命令名称
   * @param description - 命令描述
   * @param isolationContext - 隔离上下文（可选）
   * @param metadata - 命令元数据（可选）
   */
  constructor(
    commandName: string,
    description: string,
    isolationContext?: IsolationContext,
    metadata?: Record<string, unknown>,
  ) {
    this.commandId = GenericEntityId.generate();
    this.commandName = commandName;
    this.description = description;
    this.timestamp = new Date();
    this.isolationContext = isolationContext;
    this.metadata = metadata;
  }

  /**
   * 获取命令的字符串表示
   *
   * @returns 命令的字符串表示
   */
  toString(): string {
    return `${this.commandName}(${this.commandId.getValue()})`;
  }

  /**
   * 获取命令的 JSON 表示
   *
   * @returns 命令的 JSON 对象
   */
  toJSON(): Record<string, unknown> {
    return {
      commandId: this.commandId.getValue(),
      commandName: this.commandName,
      description: this.description,
      timestamp: this.timestamp.toISOString(),
      isolationContext: this.isolationContext?.buildLogContext(),
      metadata: this.metadata,
    };
  }
}
