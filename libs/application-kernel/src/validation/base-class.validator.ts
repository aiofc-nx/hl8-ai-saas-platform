/**
 * 基础类验证器
 *
 * 提供验证业务模块是否正确继承基础类的功能
 * 确保应用层一致性
 *
 * @since 1.0.0
 */
import { BaseCommand } from "../cqrs/commands/base-command";
import { BaseQuery } from "../cqrs/queries/base-query";
import { BaseUseCase } from "../use-cases/base-use-case";
import { BaseCommandUseCase } from "../use-cases/base-command-use-case";
import { GeneralBadRequestException } from "@hl8/exceptions";

/**
 * 基础类验证结果
 */
export interface BaseClassValidationResult {
  /**
   * 是否有效
   */
  isValid: boolean;

  /**
   * 验证错误列表
   */
  errors: string[];

  /**
   * 建议改进项
   */
  suggestions: string[];
}

/**
 * 基础类验证器
 *
 * 提供验证业务模块是否正确继承基础类的功能
 */
export class BaseClassValidator {
  /**
   * 验证命令类是否正确继承 BaseCommand
   *
   * @param commandClass - 命令类
   * @returns 验证结果
   */
  static validateCommandClass(commandClass: any): BaseClassValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // 检查是否继承自 BaseCommand
    if (!this.isSubclassOf(commandClass, BaseCommand)) {
      const errorMessage = `命令类 ${commandClass.name} 必须继承自 BaseCommand`;
      errors.push(errorMessage);
      suggestions.push(`将 ${commandClass.name} 改为继承自 BaseCommand`);
      
      // 抛出验证异常
      throw new GeneralBadRequestException(
        errorMessage,
        `将 ${commandClass.name} 改为继承自 BaseCommand`,
        {
          className: commandClass.name,
          expectedBaseClass: "BaseCommand",
          suggestion: `将 ${commandClass.name} 改为继承自 BaseCommand`,
        }
      );
    }

    // 检查构造函数
    if (!this.hasValidCommandConstructor(commandClass)) {
      const errorMessage = `命令类 ${commandClass.name} 构造函数不符合规范`;
      errors.push(errorMessage);
      suggestions.push(
        `确保构造函数调用 super() 并传递 commandName 和 description`,
      );
      
      // 抛出验证异常
      throw new GeneralBadRequestException(
        errorMessage,
        `确保构造函数调用 super() 并传递 commandName 和 description`,
        {
          className: commandClass.name,
          suggestion: `确保构造函数调用 super() 并传递 commandName 和 description`,
        }
      );
    }

    // 检查属性
    if (!this.hasValidCommandProperties(commandClass)) {
      const errorMessage = `命令类 ${commandClass.name} 属性不符合规范`;
      errors.push(errorMessage);
      suggestions.push(`确保所有属性都是 readonly 并且类型正确`);
      
      // 抛出验证异常
      throw new GeneralBadRequestException(
        "commandProperties",
        errorMessage,
        {
          className: commandClass.name,
          suggestion: `确保所有属性都是 readonly 并且类型正确`,
        }
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions,
    };
  }

  /**
   * 验证查询类是否正确继承 BaseQuery
   *
   * @param queryClass - 查询类
   * @returns 验证结果
   */
  static validateQueryClass(queryClass: any): BaseClassValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // 检查是否继承自 BaseQuery
    if (!this.isSubclassOf(queryClass, BaseQuery)) {
      const errorMessage = `查询类 ${queryClass.name} 必须继承自 BaseQuery`;
      errors.push(errorMessage);
      suggestions.push(`将 ${queryClass.name} 改为继承自 BaseQuery`);
      
      // 抛出验证异常
      throw new GeneralBadRequestException(
        "queryClass",
        errorMessage,
        {
          className: queryClass.name,
          expectedBaseClass: "BaseQuery",
          suggestion: `将 ${queryClass.name} 改为继承自 BaseQuery`,
        }
      );
    }

    // 检查构造函数
    if (!this.hasValidQueryConstructor(queryClass)) {
      const errorMessage = `查询类 ${queryClass.name} 构造函数不符合规范`;
      errors.push(errorMessage);
      suggestions.push(
        `确保构造函数调用 super() 并传递 queryName 和 description`,
      );
      
      // 抛出验证异常
      throw new GeneralBadRequestException(
        "queryConstructor",
        errorMessage,
        {
          className: queryClass.name,
          suggestion: `确保构造函数调用 super() 并传递 queryName 和 description`,
        }
      );
    }

    // 检查属性
    if (!this.hasValidQueryProperties(queryClass)) {
      const errorMessage = `查询类 ${queryClass.name} 属性不符合规范`;
      errors.push(errorMessage);
      suggestions.push(`确保所有属性都是 readonly 并且类型正确`);
      
      // 抛出验证异常
      throw new GeneralBadRequestException(
        "queryProperties",
        errorMessage,
        {
          className: queryClass.name,
          suggestion: `确保所有属性都是 readonly 并且类型正确`,
        }
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions,
    };
  }

  /**
   * 验证用例类是否正确继承 BaseUseCase
   *
   * @param useCaseClass - 用例类
   * @returns 验证结果
   */
  static validateUseCaseClass(useCaseClass: any): BaseClassValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // 检查是否继承自 BaseUseCase 或 BaseCommandUseCase
    if (
      !this.isSubclassOf(useCaseClass, BaseUseCase) &&
      !this.isSubclassOf(useCaseClass, BaseCommandUseCase)
    ) {
      const errorMessage = `用例类 ${useCaseClass.name} 必须继承自 BaseUseCase 或 BaseCommandUseCase`;
      errors.push(errorMessage);
      suggestions.push(
        `将 ${useCaseClass.name} 改为继承自 BaseUseCase 或 BaseCommandUseCase`,
      );
      
      // 抛出验证异常
      throw new GeneralBadRequestException(
        "useCaseClass",
        errorMessage,
        {
          className: useCaseClass.name,
          expectedBaseClass: "BaseUseCase 或 BaseCommandUseCase",
          suggestion: `将 ${useCaseClass.name} 改为继承自 BaseUseCase 或 BaseCommandUseCase`,
        }
      );
    }

    // 检查构造函数
    if (!this.hasValidUseCaseConstructor(useCaseClass)) {
      const errorMessage = `用例类 ${useCaseClass.name} 构造函数不符合规范`;
      errors.push(errorMessage);
      suggestions.push(`确保构造函数调用 super() 并传递必要的参数`);
      
      // 抛出验证异常
      throw new GeneralBadRequestException(
        "useCaseConstructor",
        errorMessage,
        {
          className: useCaseClass.name,
          suggestion: `确保构造函数调用 super() 并传递必要的参数`,
        }
      );
    }

    // 检查必需方法
    if (!this.hasRequiredUseCaseMethods(useCaseClass)) {
      const errorMessage = `用例类 ${useCaseClass.name} 缺少必需的方法`;
      errors.push(errorMessage);
      suggestions.push(`实现 executeUseCase 或 executeCommand 方法`);
      
      // 抛出验证异常
      throw new GeneralBadRequestException(
        "useCaseMethods",
        errorMessage,
        {
          className: useCaseClass.name,
          suggestion: `实现 executeUseCase 或 executeCommand 方法`,
        }
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions,
    };
  }

  /**
   * 检查是否为子类
   */
  private static isSubclassOf(child: any, parent: any): boolean {
    return child.prototype instanceof parent;
  }

  /**
   * 检查命令构造函数是否有效
   */
  private static hasValidCommandConstructor(commandClass: any): boolean {
    const constructor = commandClass.toString();
    return (
      constructor.includes("super(") &&
      constructor.includes("commandName") &&
      constructor.includes("description")
    );
  }

  /**
   * 检查查询构造函数是否有效
   */
  private static hasValidQueryConstructor(queryClass: any): boolean {
    const constructor = queryClass.toString();
    return (
      constructor.includes("super(") &&
      constructor.includes("queryName") &&
      constructor.includes("description")
    );
  }

  /**
   * 检查用例构造函数是否有效
   */
  private static hasValidUseCaseConstructor(useCaseClass: any): boolean {
    const constructor = useCaseClass.toString();
    return constructor.includes("super(");
  }

  /**
   * 检查命令属性是否有效
   */
  private static hasValidCommandProperties(_commandClass: any): boolean {
    // 这里简化实现，实际应该检查属性定义
    return true;
  }

  /**
   * 检查查询属性是否有效
   */
  private static hasValidQueryProperties(_queryClass: any): boolean {
    // 这里简化实现，实际应该检查属性定义
    return true;
  }

  /**
   * 检查用例必需方法
   */
  private static hasRequiredUseCaseMethods(useCaseClass: any): boolean {
    const prototype = useCaseClass.prototype;
    return (
      typeof prototype.executeUseCase === "function" ||
      typeof prototype.executeCommand === "function"
    );
  }
}
