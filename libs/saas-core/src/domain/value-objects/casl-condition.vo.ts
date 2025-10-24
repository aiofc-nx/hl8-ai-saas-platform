/**
 * CASL条件值对象
 *
 * @description 表示CASL权限规则的条件，用于细粒度的访问控制
 * @since 1.0.0
 */

import { BaseValueObject } from "./base-value-object.js";

/**
 * CASL条件操作符枚举
 */
export enum CaslConditionOperatorEnum {
  EQUALS = "eq",
  NOT_EQUALS = "ne",
  GREATER_THAN = "gt",
  GREATER_THAN_OR_EQUALS = "gte",
  LESS_THAN = "lt",
  LESS_THAN_OR_EQUALS = "lte",
  IN = "in",
  NOT_IN = "nin",
  EXISTS = "exists",
  REGEX = "regex",
}

/**
 * CASL条件值对象
 *
 * CASL条件定义了权限规则的判断条件，用于在运行时评估用户是否有权限访问特定资源。
 * 条件包含字段名、操作符和值，支持复杂的条件组合。
 *
 * @example
 * ```typescript
 * const condition = new CaslCondition(
 *   'tenantId',
 *   CaslConditionOperatorEnum.EQUALS,
 *   'tenant-123'
 * );
 * ```
 */
export class CaslCondition extends BaseValueObject<{
  field: string;
  operator: CaslConditionOperatorEnum;
  value: unknown;
}> {
  constructor(
    field: string,
    operator: CaslConditionOperatorEnum,
    value: unknown,
  ) {
    const conditionData = { field, operator, value };
    super(conditionData);
    this.validateValue(conditionData);
  }

  /**
   * 验证CASL条件
   *
   * @param conditionData - 条件数据
   * @throws {Error} 当条件无效时抛出错误
   */
  private validateValue(conditionData: {
    field: string;
    operator: CaslConditionOperatorEnum;
    value: unknown;
  }): void {
    if (!conditionData.field || typeof conditionData.field !== "string") {
      throw new Error("条件字段名不能为空");
    }

    if (
      !Object.values(CaslConditionOperatorEnum).includes(conditionData.operator)
    ) {
      throw new Error(`无效的条件操作符: ${conditionData.operator}`);
    }

    // 验证操作符和值的兼容性
    this.validateOperatorValueCompatibility(
      conditionData.operator,
      conditionData.value,
    );
  }

  /**
   * 验证操作符和值的兼容性
   *
   * @param operator - 操作符
   * @param value - 值
   * @throws {Error} 当操作符和值不兼容时抛出错误
   */
  private validateOperatorValueCompatibility(
    operator: CaslConditionOperatorEnum,
    value: unknown,
  ): void {
    switch (operator) {
      case CaslConditionOperatorEnum.IN:
      case CaslConditionOperatorEnum.NOT_IN:
        if (!Array.isArray(value)) {
          throw new Error(`${operator} 操作符需要数组值`);
        }
        break;
      case CaslConditionOperatorEnum.REGEX:
        if (typeof value !== "string") {
          throw new Error("regex 操作符需要字符串值");
        }
        try {
          new RegExp(value);
        } catch {
          throw new Error("无效的正则表达式");
        }
        break;
      case CaslConditionOperatorEnum.EXISTS:
        if (typeof value !== "boolean") {
          throw new Error("exists 操作符需要布尔值");
        }
        break;
    }
  }

  /**
   * 获取条件字段名
   *
   * @returns 字段名
   */
  get field(): string {
    return this.value.field;
  }

  /**
   * 获取条件操作符
   *
   * @returns 操作符
   */
  get operator(): CaslConditionOperatorEnum {
    return this.value.operator;
  }

  /**
   * 获取条件值
   *
   * @returns 值
   */
  get value(): unknown {
    return this.value.value;
  }

  /**
   * 评估条件是否匹配给定值
   *
   * @param targetValue - 目标值
   * @returns 是否匹配
   */
  evaluate(targetValue: unknown): boolean {
    switch (this.operator) {
      case CaslConditionOperatorEnum.EQUALS:
        return targetValue === this.value;
      case CaslConditionOperatorEnum.NOT_EQUALS:
        return targetValue !== this.value;
      case CaslConditionOperatorEnum.GREATER_THAN:
        return targetValue > this.value;
      case CaslConditionOperatorEnum.GREATER_THAN_OR_EQUALS:
        return targetValue >= this.value;
      case CaslConditionOperatorEnum.LESS_THAN:
        return targetValue < this.value;
      case CaslConditionOperatorEnum.LESS_THAN_OR_EQUALS:
        return targetValue <= this.value;
      case CaslConditionOperatorEnum.IN:
        return Array.isArray(this.value) && this.value.includes(targetValue);
      case CaslConditionOperatorEnum.NOT_IN:
        return Array.isArray(this.value) && !this.value.includes(targetValue);
      case CaslConditionOperatorEnum.EXISTS:
        return this.value
          ? targetValue !== undefined && targetValue !== null
          : targetValue === undefined || targetValue === null;
      case CaslConditionOperatorEnum.REGEX:
        return (
          typeof targetValue === "string" &&
          new RegExp(this.value).test(targetValue)
        );
      default:
        return false;
    }
  }

  /**
   * 评估条件是否匹配给定对象
   *
   * @param targetObject - 目标对象
   * @returns 是否匹配
   */
  evaluateObject(targetObject: Record<string, unknown>): boolean {
    const targetValue = targetObject[this.field];
    return this.evaluate(targetValue);
  }

  /**
   * 获取条件的字符串表示
   *
   * @returns 条件字符串
   */
  toString(): string {
    return `${this.field} ${this.operator} ${JSON.stringify(this.value)}`;
  }

  /**
   * 检查是否为有效的条件操作符
   *
   * @param operator - 要检查的操作符
   * @returns 是否为有效操作符
   */
  static isValidOperator(operator: string): boolean {
    return Object.values(CaslConditionOperatorEnum).includes(
      operator as CaslConditionOperatorEnum,
    );
  }

  /**
   * 获取所有可用的条件操作符
   *
   * @returns 所有条件操作符列表
   */
  static getAllOperators(): CaslConditionOperatorEnum[] {
    return Object.values(CaslConditionOperatorEnum);
  }

  /**
   * 创建等于条件
   *
   * @param field - 字段名
   * @param value - 值
   * @returns 等于条件
   */
  static equals(field: string, value: unknown): CaslCondition {
    return new CaslCondition(field, CaslConditionOperatorEnum.EQUALS, value);
  }

  /**
   * 创建包含条件
   *
   * @param field - 字段名
   * @param values - 值数组
   * @returns 包含条件
   */
  static in(field: string, values: unknown[]): CaslCondition {
    return new CaslCondition(field, CaslConditionOperatorEnum.IN, values);
  }

  /**
   * 创建存在条件
   *
   * @param field - 字段名
   * @param exists - 是否存在
   * @returns 存在条件
   */
  static exists(field: string, exists: boolean): CaslCondition {
    return new CaslCondition(field, CaslConditionOperatorEnum.EXISTS, exists);
  }
}
