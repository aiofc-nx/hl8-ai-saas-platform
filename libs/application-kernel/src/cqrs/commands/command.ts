/**
 * 命令基类
 * @description CQRS 命令的抽象基类
 */
export abstract class Command {
  constructor(
    public readonly commandId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
