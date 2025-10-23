/**
 * 模式合规性验证器
 *
 * 提供验证业务模块是否遵循应用内核模式的工具
 * 确保应用层一致性
 *
 * @since 1.0.0
 */
import { BaseCommand } from "../cqrs/commands/base-command.js";
import { BaseQuery } from "../cqrs/queries/base-query.js";
import { BaseUseCase } from "../use-cases/base-use-case.js";
import { BaseCommandUseCase } from "../use-cases/base-command-use-case.js";
// import type { CommandHandler } from "../cqrs/commands/command-handler.interface.js";
// import type { QueryHandler } from "../cqrs/queries/query-handler.interface.js";

/**
 * 模式合规性验证结果
 */
export interface PatternComplianceResult {
  /**
   * 是否合规
   */
  isCompliant: boolean;

  /**
   * 违规项目列表
   */
  violations: string[];

  /**
   * 建议改进项
   */
  suggestions: string[];
}

/**
 * 模式合规性验证器
 *
 * 提供验证业务模块是否遵循应用内核模式的功能
 */
export class PatternComplianceValidator {
  /**
   * 验证模块是否遵循应用内核模式
   *
   * @param module - 要验证的模块
   * @returns 验证结果
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // 必须使用 any 类型：需要验证任意类型的模块，无法预先确定具体的模块结构
  // 这是模式合规性验证的核心需求，用于检查模块是否符合设计模式
  static validateModule(module: any): PatternComplianceResult {
    const violations: string[] = [];
    const suggestions: string[] = [];

    // 检查命令类
    this.validateCommands(module, violations, suggestions);

    // 检查查询类
    this.validateQueries(module, violations, suggestions);

    // 检查用例类
    this.validateUseCases(module, violations, suggestions);

    // 检查处理器
    this.validateHandlers(module, violations, suggestions);

    return {
      isCompliant: violations.length === 0,
      violations,
      suggestions,
    };
  }

  /**
   * 验证命令类
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // 必须使用 any 类型：需要验证任意类型的模块中的命令类，无法预先确定具体的类结构
  // 这是模式合规性验证的核心需求，用于检查命令类是否符合设计模式
  private static validateCommands(
    module: any,
    violations: string[],
    suggestions: string[],
  ): void {
    const commandClasses = this.findClassesByPattern(module, /Command$/);

    for (const commandClass of commandClasses) {
      if (!this.isSubclassOf(commandClass, BaseCommand)) {
        violations.push(`命令类 ${commandClass.name} 必须继承自 BaseCommand`);
        suggestions.push(`将 ${commandClass.name} 改为继承自 BaseCommand`);
      }

      // 检查构造函数参数
      if (!this.hasValidCommandConstructor(commandClass)) {
        violations.push(`命令类 ${commandClass.name} 构造函数参数不符合规范`);
        suggestions.push(`确保构造函数包含 commandName 和 description 参数`);
      }
    }
  }

  /**
   * 验证查询类
   */
  private static validateQueries(
    module: any,
    violations: string[],
    suggestions: string[],
  ): void {
    const queryClasses = this.findClassesByPattern(module, /Query$/);

    for (const queryClass of queryClasses) {
      if (!this.isSubclassOf(queryClass, BaseQuery)) {
        violations.push(`查询类 ${queryClass.name} 必须继承自 BaseQuery`);
        suggestions.push(`将 ${queryClass.name} 改为继承自 BaseQuery`);
      }

      // 检查构造函数参数
      if (!this.hasValidQueryConstructor(queryClass)) {
        violations.push(`查询类 ${queryClass.name} 构造函数参数不符合规范`);
        suggestions.push(`确保构造函数包含 queryName 和 description 参数`);
      }
    }
  }

  /**
   * 验证用例类
   */
  private static validateUseCases(
    module: any,
    violations: string[],
    suggestions: string[],
  ): void {
    const useCaseClasses = this.findClassesByPattern(module, /UseCase$/);

    for (const useCaseClass of useCaseClasses) {
      if (
        !this.isSubclassOf(useCaseClass, BaseUseCase) &&
        !this.isSubclassOf(useCaseClass, BaseCommandUseCase)
      ) {
        violations.push(
          `用例类 ${useCaseClass.name} 必须继承自 BaseUseCase 或 BaseCommandUseCase`,
        );
        suggestions.push(
          `将 ${useCaseClass.name} 改为继承自 BaseUseCase 或 BaseCommandUseCase`,
        );
      }
    }
  }

  /**
   * 验证处理器
   */
  private static validateHandlers(
    module: any,
    violations: string[],
    suggestions: string[],
  ): void {
    const handlerClasses = this.findClassesByPattern(module, /Handler$/);

    for (const handlerClass of handlerClasses) {
      if (
        !this.implementsInterface(handlerClass, "CommandHandler") &&
        !this.implementsInterface(handlerClass, "QueryHandler")
      ) {
        violations.push(
          `处理器类 ${handlerClass.name} 必须实现 CommandHandler 或 QueryHandler 接口`,
        );
        suggestions.push(
          `将 ${handlerClass.name} 改为实现 CommandHandler 或 QueryHandler 接口`,
        );
      }
    }
  }

  /**
   * 查找匹配模式的类
   */
  private static findClassesByPattern(module: any, pattern: RegExp): any[] {
    const classes: any[] = [];

    for (const key in module) {
      const value = module[key];
      if (
        typeof value === "function" &&
        value.name &&
        pattern.test(value.name) &&
        value.prototype
      ) {
        classes.push(value);
      }
    }

    return classes;
  }

  /**
   * 检查是否为子类
   */
  private static isSubclassOf(child: any, parent: any): boolean {
    return child.prototype instanceof parent;
  }

  /**
   * 检查是否实现接口
   */
  private static implementsInterface(cls: any, _interfaceType: any): boolean {
    // 这里简化实现，实际应该检查类是否实现了接口的所有方法
    return typeof cls.prototype.handle === "function";
  }

  /**
   * 检查命令构造函数是否有效
   */
  private static hasValidCommandConstructor(commandClass: any): boolean {
    // 检查构造函数参数数量（至少应该有 commandName 和 description）
    const constructor = commandClass.toString();
    return (
      constructor.includes("commandName") && constructor.includes("description")
    );
  }

  /**
   * 检查查询构造函数是否有效
   */
  private static hasValidQueryConstructor(queryClass: any): boolean {
    // 检查构造函数参数数量（至少应该有 queryName 和 description）
    const constructor = queryClass.toString();
    return (
      constructor.includes("queryName") && constructor.includes("description")
    );
  }
}
