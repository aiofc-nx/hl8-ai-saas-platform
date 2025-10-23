/**
 * 接口合规性验证器
 *
 * 提供验证业务模块是否正确实现接口的功能
 * 确保应用层一致性
 *
 * @since 1.0.0
 */
// import type { CommandHandler } from "../cqrs/commands/command-handler.interface.js";
// import type { QueryHandler } from "../cqrs/queries/query-handler.interface.js";

/**
 * 接口合规性验证结果
 */
export interface InterfaceComplianceResult {
  /**
   * 是否合规
   */
  isCompliant: boolean;

  /**
   * 违规项列表
   */
  violations: string[];

  /**
   * 建议改进项
   */
  suggestions: string[];
}

/**
 * 接口合规性验证器
 *
 * 提供验证业务模块是否正确实现接口的功能
 */
export class InterfaceComplianceValidator {
  /**
   * 验证命令处理器是否正确实现 CommandHandler 接口
   *
   * @param handlerClass - 处理器类
   * @returns 验证结果
   */

  // 必须使用 any 类型：需要验证任意类型的命令处理器类，无法预先确定具体的类结构
  // 这是接口合规性验证的核心需求，用于检查类是否实现了 CommandHandler 接口
  static validateCommandHandler(handlerClass: any): InterfaceComplianceResult {
    const violations: string[] = [];
    const suggestions: string[] = [];

    // 检查是否实现 CommandHandler 接口
    if (!this.implementsCommandHandler(handlerClass)) {
      violations.push(
        `处理器类 ${handlerClass.name} 必须实现 CommandHandler 接口`,
      );
      suggestions.push(`将 ${handlerClass.name} 改为实现 CommandHandler 接口`);
    }

    // 检查必需方法
    const requiredMethods = [
      "handle",
      "validateCommand",
      "canHandle",
      "getHandlerName",
      "getPriority",
    ];
    for (const method of requiredMethods) {
      if (!this.hasMethod(handlerClass, method)) {
        violations.push(`处理器类 ${handlerClass.name} 缺少必需方法 ${method}`);
        suggestions.push(`在 ${handlerClass.name} 中实现 ${method} 方法`);
      }
    }

    // 检查方法签名
    if (!this.hasValidCommandHandlerSignatures(handlerClass)) {
      violations.push(`处理器类 ${handlerClass.name} 方法签名不符合规范`);
      suggestions.push(`确保方法签名与 CommandHandler 接口一致`);
    }

    return {
      isCompliant: violations.length === 0,
      violations,
      suggestions,
    };
  }

  /**
   * 验证查询处理器是否正确实现 QueryHandler 接口
   *
   * @param handlerClass - 处理器类
   * @returns 验证结果
   */

  // 必须使用 any 类型：需要验证任意类型的查询处理器类，无法预先确定具体的类结构
  // 这是接口合规性验证的核心需求，用于检查类是否实现了 QueryHandler 接口
  static validateQueryHandler(handlerClass: any): InterfaceComplianceResult {
    const violations: string[] = [];
    const suggestions: string[] = [];

    // 检查是否实现 QueryHandler 接口
    if (!this.implementsQueryHandler(handlerClass)) {
      violations.push(
        `处理器类 ${handlerClass.name} 必须实现 QueryHandler 接口`,
      );
      suggestions.push(`将 ${handlerClass.name} 改为实现 QueryHandler 接口`);
    }

    // 检查必需方法
    const requiredMethods = [
      "handle",
      "validateQuery",
      "canHandle",
      "getHandlerName",
    ];
    for (const method of requiredMethods) {
      if (!this.hasMethod(handlerClass, method)) {
        violations.push(`处理器类 ${handlerClass.name} 缺少必需方法 ${method}`);
        suggestions.push(`在 ${handlerClass.name} 中实现 ${method} 方法`);
      }
    }

    // 检查方法签名
    if (!this.hasValidQueryHandlerSignatures(handlerClass)) {
      violations.push(`处理器类 ${handlerClass.name} 方法签名不符合规范`);
      suggestions.push(`确保方法签名与 QueryHandler 接口一致`);
    }

    return {
      isCompliant: violations.length === 0,
      violations,
      suggestions,
    };
  }

  /**
   * 检查是否实现 CommandHandler 接口
   */

  // 必须使用 any 类型：需要检查任意类型的类是否实现了 CommandHandler 接口
  // 这是接口合规性验证的核心需求，用于动态检查类的接口实现
  private static implementsCommandHandler(handlerClass: any): boolean {
    return (
      this.hasMethod(handlerClass, "handle") &&
      this.hasMethod(handlerClass, "validateCommand") &&
      this.hasMethod(handlerClass, "canHandle") &&
      this.hasMethod(handlerClass, "getHandlerName") &&
      this.hasMethod(handlerClass, "getPriority")
    );
  }

  /**
   * 检查是否实现 QueryHandler 接口
   */

  // 必须使用 any 类型：需要检查任意类型的类是否实现了 QueryHandler 接口
  // 这是接口合规性验证的核心需求，用于动态检查类的接口实现
  private static implementsQueryHandler(handlerClass: any): boolean {
    return (
      this.hasMethod(handlerClass, "handle") &&
      this.hasMethod(handlerClass, "validateQuery") &&
      this.hasMethod(handlerClass, "canHandle") &&
      this.hasMethod(handlerClass, "getHandlerName")
    );
  }

  /**
   * 检查是否有指定方法
   */

  // 必须使用 any 类型：需要检查任意类型的类是否具有指定的方法
  // 这是接口合规性验证的核心需求，用于动态检查类的方法存在性
  private static hasMethod(handlerClass: any, methodName: string): boolean {
    return typeof handlerClass.prototype[methodName] === "function";
  }

  /**
   * 检查命令处理器方法签名是否有效
   */

  // 必须使用 any 类型：需要检查任意类型的命令处理器类的方法签名
  // 这是接口合规性验证的核心需求，用于动态检查类的方法签名有效性
  private static hasValidCommandHandlerSignatures(handlerClass: any): boolean {
    const prototype = handlerClass.prototype;

    // 检查 handle 方法
    if (typeof prototype.handle !== "function") {
      return false;
    }

    // 检查 validateCommand 方法
    if (typeof prototype.validateCommand !== "function") {
      return false;
    }

    // 检查 canHandle 方法
    if (typeof prototype.canHandle !== "function") {
      return false;
    }

    // 检查 getHandlerName 方法
    if (typeof prototype.getHandlerName !== "function") {
      return false;
    }

    // 检查 getPriority 方法
    if (typeof prototype.getPriority !== "function") {
      return false;
    }

    return true;
  }

  /**
   * 检查查询处理器方法签名是否有效
   */

  // 必须使用 any 类型：需要检查任意类型的查询处理器类的方法签名
  // 这是接口合规性验证的核心需求，用于动态检查类的方法签名有效性
  private static hasValidQueryHandlerSignatures(handlerClass: any): boolean {
    const prototype = handlerClass.prototype;

    // 检查 handle 方法
    if (typeof prototype.handle !== "function") {
      return false;
    }

    // 检查 validateQuery 方法
    if (typeof prototype.validateQuery !== "function") {
      return false;
    }

    // 检查 canHandle 方法
    if (typeof prototype.canHandle !== "function") {
      return false;
    }

    // 检查 getHandlerName 方法
    if (typeof prototype.getHandlerName !== "function") {
      return false;
    }

    return true;
  }

  /**
   * 验证处理器类
   *
   * @param handlerClass - 处理器类
   * @returns 验证结果
   */

  // 必须使用 any 类型：需要验证任意类型的处理器类，无法预先确定具体的类结构
  // 这是接口合规性验证的核心需求，用于检查类是否实现了正确的处理器接口
  static validateHandler(handlerClass: any): InterfaceComplianceResult {
    // 尝试验证为命令处理器
    const commandResult = this.validateCommandHandler(handlerClass);
    if (commandResult.isCompliant) {
      return commandResult;
    }

    // 尝试验证为查询处理器
    const queryResult = this.validateQueryHandler(handlerClass);
    if (queryResult.isCompliant) {
      return queryResult;
    }

    // 都不合规，返回命令处理器的结果（通常更严格）
    return commandResult;
  }
}
