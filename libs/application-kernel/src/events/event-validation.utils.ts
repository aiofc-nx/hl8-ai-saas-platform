/**
 * 事件验证工具
 *
 * 提供事件验证的实用工具函数
 * 支持事件结构验证、数据完整性检查和业务规则验证
 *
 * @since 1.0.0
 */
import { DomainEvent } from "./domain-event.interface.js";
import { EntityId } from "@hl8/domain-kernel";

/**
 * 事件验证结果
 */
export interface EventValidationResult {
  /**
   * 是否有效
   */
  isValid: boolean;

  /**
   * 验证错误列表
   */
  errors: string[];

  /**
   * 验证警告列表
   */
  warnings: string[];

  /**
   * 建议改进项
   */
  suggestions: string[];
}

/**
 * 事件验证规则
 */
export interface EventValidationRule {
  /**
   * 规则名称
   */
  name: string;

  /**
   * 验证函数
   */
  validate: (event: DomainEvent) => boolean;

  /**
   * 错误消息
   */
  errorMessage: string;
}

/**
 * 事件验证工具类
 *
 * 提供事件验证的实用工具函数
 */
export class EventValidationUtils {
  /**
   * 验证事件
   *
   * @param event - 事件
   * @param rules - 验证规则
   * @returns 验证结果
   */
  static validateEvent(
    event: DomainEvent,
    rules: EventValidationRule[] = [],
  ): EventValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 基础结构验证
    const basicValidation = this.validateBasicStructure(event);
    errors.push(...basicValidation.errors);
    warnings.push(...basicValidation.warnings);
    suggestions.push(...basicValidation.suggestions);

    // 数据完整性验证
    const integrityValidation = this.validateDataIntegrity(event);
    errors.push(...integrityValidation.errors);
    warnings.push(...integrityValidation.warnings);
    suggestions.push(...integrityValidation.suggestions);

    // 业务规则验证
    const businessValidation = this.validateBusinessRules(event, rules);
    errors.push(...businessValidation.errors);
    warnings.push(...businessValidation.warnings);
    suggestions.push(...businessValidation.suggestions);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * 验证事件数组
   *
   * @param events - 事件数组
   * @param rules - 验证规则
   * @returns 验证结果
   */
  static validateEvents(
    events: DomainEvent[],
    rules: EventValidationRule[] = [],
  ): EventValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    const allSuggestions: string[] = [];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const result = this.validateEvent(event, rules);

      if (!result.isValid) {
        allErrors.push(`事件 ${i}: ${result.errors.join(", ")}`);
      }

      allWarnings.push(...result.warnings.map((w) => `事件 ${i}: ${w}`));
      allSuggestions.push(...result.suggestions.map((s) => `事件 ${i}: ${s}`));
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      suggestions: allSuggestions,
    };
  }

  /**
   * 验证基础结构
   *
   * @param event - 事件
   * @returns 验证结果
   */
  private static validateBasicStructure(event: DomainEvent): {
    errors: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 验证事件ID
    if (!event.eventId) {
      errors.push("事件ID不能为空");
    } else if (!(event.eventId instanceof EntityId)) {
      errors.push("事件ID必须是EntityId类型");
    }

    // 验证事件类型
    if (!event.eventType || event.eventType.trim() === "") {
      errors.push("事件类型不能为空");
    } else if (!/^[A-Z][a-zA-Z0-9]*$/.test(event.eventType)) {
      warnings.push("事件类型格式不符合规范");
      suggestions.push("使用PascalCase格式，如：UserCreated, OrderUpdated");
    }

    // 验证发生时间
    if (!event.occurredAt || !(event.occurredAt instanceof Date)) {
      errors.push("事件发生时间必须是有效的日期对象");
    } else {
      const now = new Date();
      const timeDiff = Math.abs(now.getTime() - event.occurredAt.getTime());

      if (event.occurredAt.getTime() > now.getTime()) {
        warnings.push("事件发生时间是未来时间");
        suggestions.push("确保事件时间戳的准确性");
      } else if (timeDiff > 86400000) {
        // 24小时
        warnings.push("事件发生时间过于久远");
        suggestions.push("检查事件时间戳的合理性");
      }
    }

    // 验证聚合根ID
    if (!event.aggregateId) {
      errors.push("聚合根ID不能为空");
    } else if (!(event.aggregateId instanceof EntityId)) {
      errors.push("聚合根ID必须是EntityId类型");
    }

    // 验证版本号
    if (typeof event.version !== "number" || event.version < 0) {
      errors.push("事件版本必须是大于等于0的数字");
    } else if (event.version === 0) {
      warnings.push("事件版本为0，请确认是否为初始事件");
    }

    // 验证事件数据
    if (!event.eventData || typeof event.eventData !== "object") {
      errors.push("事件数据必须是对象");
    } else if (Object.keys(event.eventData).length === 0) {
      warnings.push("事件数据为空");
      suggestions.push("考虑是否真的需要这个事件");
    }

    return { errors, warnings, suggestions };
  }

  /**
   * 验证数据完整性
   *
   * @param event - 事件
   * @returns 验证结果
   */
  private static validateDataIntegrity(event: DomainEvent): {
    errors: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 验证事件ID唯一性
    if (
      event.eventId &&
      event.aggregateId &&
      event.eventId.getValue() === event.aggregateId.getValue()
    ) {
      warnings.push("事件ID与聚合根ID相同");
      suggestions.push("确保事件ID的唯一性");
    }

    // 验证事件数据序列化
    try {
      JSON.stringify(event.eventData);
    } catch (_error) {
      errors.push("事件数据无法序列化");
      suggestions.push("确保事件数据只包含可序列化的内容");
    }

    // 验证事件数据大小
    const eventDataSize = JSON.stringify(event.eventData).length;
    if (eventDataSize > 1024 * 1024) {
      // 1MB
      warnings.push("事件数据过大");
      suggestions.push("考虑拆分事件或优化数据结构");
    }

    return { errors, warnings, suggestions };
  }

  /**
   * 验证业务规则
   *
   * @param event - 事件
   * @param rules - 验证规则
   * @returns 验证结果
   */
  private static validateBusinessRules(
    event: DomainEvent,
    rules: EventValidationRule[],
  ): {
    errors: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    for (const rule of rules) {
      if (!rule.validate(event)) {
        errors.push(rule.errorMessage);
      }
    }

    return { errors, warnings, suggestions };
  }

  /**
   * 创建预定义验证规则
   *
   * @returns 验证规则数组
   */
  static createPredefinedRules(): EventValidationRule[] {
    return [
      {
        name: "eventTypeFormat",
        validate: (event) => /^[A-Z][a-zA-Z0-9]*$/.test(event.eventType),
        errorMessage: "事件类型必须使用PascalCase格式",
      },
      {
        name: "eventDataNotEmpty",
        validate: (event) => Object.keys(event.eventData).length > 0,
        errorMessage: "事件数据不能为空",
      },
      {
        name: "versionPositive",
        validate: (event) => event.version >= 0,
        errorMessage: "事件版本必须大于等于0",
      },
      {
        name: "occurredAtValid",
        validate: (event) =>
          event.occurredAt instanceof Date &&
          !isNaN(event.occurredAt.getTime()),
        errorMessage: "事件发生时间必须是有效的日期",
      },
    ];
  }

  /**
   * 创建自定义验证规则
   *
   * @param name - 规则名称
   * @param validate - 验证函数
   * @param errorMessage - 错误消息
   * @returns 验证规则
   */
  static createCustomRule(
    name: string,
    validate: (event: DomainEvent) => boolean,
    errorMessage: string,
  ): EventValidationRule {
    return {
      name,
      validate,
      errorMessage,
    };
  }
}
