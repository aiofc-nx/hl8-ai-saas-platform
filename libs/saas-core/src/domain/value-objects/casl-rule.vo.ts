/**
 * CASL规则值对象
 *
 * @description 表示CASL权限规则，用于定义细粒度的访问控制
 * @since 1.0.0
 */

import { BaseValueObject } from "./base-value-object.js";

/**
 * CASL规则动作枚举
 */
export enum CaslActionEnum {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  MANAGE = "manage",
  EXECUTE = "execute",
  APPROVE = "approve",
  REJECT = "reject",
}

/**
 * CASL规则主题枚举
 */
export enum CaslSubjectEnum {
  ALL = "all",
  TENANT = "tenant",
  ORGANIZATION = "organization",
  DEPARTMENT = "department",
  USER = "user",
  ROLE = "role",
  PERMISSION = "permission",
  AUDIT = "audit",
  CONFIG = "config",
}

/**
 * CASL规则条件接口
 */
export interface CaslCondition {
  readonly field: string;
  readonly operator:
    | "eq"
    | "ne"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "in"
    | "nin"
    | "exists"
    | "regex";
  readonly value: unknown;
}

/**
 * CASL规则值对象
 *
 * CASL规则定义了用户对特定资源的访问权限。
 * 规则包含动作、主题、条件和字段，支持复杂的权限控制逻辑。
 *
 * @example
 * ```typescript
 * const rule = new CaslRule(
 *   CaslActionEnum.READ,
 *   CaslSubjectEnum.USER,
 *   { tenantId: 'tenant-123' },
 *   ['id', 'name', 'email']
 * );
 * ```
 */
export class CaslRule extends BaseValueObject<{
  action: CaslActionEnum;
  subject: CaslSubjectEnum;
  conditions: Record<string, unknown>;
  fields: string[];
}> {
  constructor(
    action: CaslActionEnum,
    subject: CaslSubjectEnum,
    conditions: Record<string, unknown> = {},
    fields: string[] = [],
  ) {
    const ruleData = { action, subject, conditions, fields };
    super(ruleData);
    this.validateValue(ruleData);
  }

  /**
   * 验证CASL规则
   *
   * @param ruleData - 规则数据
   * @throws {Error} 当规则无效时抛出错误
   */
  private validateValue(ruleData: {
    action: CaslActionEnum;
    subject: CaslSubjectEnum;
    conditions: Record<string, unknown>;
    fields: string[];
  }): void {
    if (!Object.values(CaslActionEnum).includes(ruleData.action)) {
      throw new Error(`无效的CASL动作: ${ruleData.action}`);
    }

    if (!Object.values(CaslSubjectEnum).includes(ruleData.subject)) {
      throw new Error(`无效的CASL主题: ${ruleData.subject}`);
    }

    if (!Array.isArray(ruleData.fields)) {
      throw new Error("字段列表必须是数组");
    }
  }

  /**
   * 获取规则动作
   *
   * @returns 规则动作
   */
  get action(): CaslActionEnum {
    return this.value.action;
  }

  /**
   * 获取规则主题
   *
   * @returns 规则主题
   */
  get subject(): CaslSubjectEnum {
    return this.value.subject;
  }

  /**
   * 获取规则条件
   *
   * @returns 规则条件
   */
  get conditions(): Record<string, unknown> {
    return this.value.conditions;
  }

  /**
   * 获取规则字段
   *
   * @returns 规则字段
   */
  get fields(): string[] {
    return this.value.fields;
  }

  /**
   * 检查规则是否匹配特定动作和主题
   *
   * @param action - 动作
   * @param subject - 主题
   * @returns 是否匹配
   */
  matches(action: CaslActionEnum, subject: CaslSubjectEnum): boolean {
    return this.action === action && this.subject === subject;
  }

  /**
   * 检查规则是否匹配特定条件
   *
   * @param conditions - 条件
   * @returns 是否匹配
   */
  matchesConditions(conditions: Record<string, unknown>): boolean {
    for (const [key, value] of Object.entries(this.conditions)) {
      if (conditions[key] !== value) {
        return false;
      }
    }
    return true;
  }

  /**
   * 检查规则是否包含特定字段
   *
   * @param field - 字段名
   * @returns 是否包含
   */
  hasField(field: string): boolean {
    return this.fields.includes(field);
  }

  /**
   * 检查规则是否允许所有字段
   *
   * @returns 是否允许所有字段
   */
  allowsAllFields(): boolean {
    return this.fields.length === 0;
  }

  /**
   * 获取规则的字符串表示
   *
   * @returns 规则字符串
   */
  toString(): string {
    const conditionsStr = Object.entries(this.conditions)
      .map(([key, value]) => `${key}=${value}`)
      .join(",");
    const fieldsStr =
      this.fields.length > 0 ? `[${this.fields.join(",")}]` : "[all]";
    return `${this.action}:${this.subject}${conditionsStr ? `:${conditionsStr}` : ""}:${fieldsStr}`;
  }

  /**
   * 检查是否为有效的CASL动作
   *
   * @param action - 要检查的动作
   * @returns 是否为有效动作
   */
  static isValidAction(action: string): boolean {
    return Object.values(CaslActionEnum).includes(action as CaslActionEnum);
  }

  /**
   * 检查是否为有效的CASL主题
   *
   * @param subject - 要检查的主题
   * @returns 是否为有效主题
   */
  static isValidSubject(subject: string): boolean {
    return Object.values(CaslSubjectEnum).includes(subject as CaslSubjectEnum);
  }

  /**
   * 获取所有可用的CASL动作
   *
   * @returns 所有CASL动作列表
   */
  static getAllActions(): CaslActionEnum[] {
    return Object.values(CaslActionEnum);
  }

  /**
   * 获取所有可用的CASL主题
   *
   * @returns 所有CASL主题列表
   */
  static getAllSubjects(): CaslSubjectEnum[] {
    return Object.values(CaslSubjectEnum);
  }
}
