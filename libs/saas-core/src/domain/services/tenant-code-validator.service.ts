/**
 * 租户代码验证服务
 *
 * @description 负责租户代码的唯一性验证和格式验证
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { TenantCode } from "../value-objects/tenant-code.vo.js";

/**
 * 租户代码验证结果
 */
export interface TenantCodeValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly suggestions?: readonly string[];
}

/**
 * 租户代码验证服务
 *
 * 租户代码验证服务负责验证租户代码的唯一性和格式正确性。
 * 支持租户代码格式验证、唯一性检查、相似性检查等功能。
 *
 * @example
 * ```typescript
 * const validator = new TenantCodeValidator();
 * const result = await validator.validateTenantCode("acme-corp");
 * if (result.isValid) {
 *   console.log("租户代码验证通过");
 * } else {
 *   console.log("验证失败:", result.errors);
 * }
 * ```
 */
@Injectable()
export class TenantCodeValidator {
  /**
   * 验证租户代码
   *
   * @param tenantCode - 租户代码
   * @param existingCodes - 现有租户代码列表
   * @returns 验证结果
   */
  async validateTenantCode(
    tenantCode: string,
    existingCodes: readonly string[] = [],
  ): Promise<TenantCodeValidationResult> {
    const errors: string[] = [];

    // 格式验证
    const formatValidation = this.validateFormat(tenantCode);
    if (!formatValidation.isValid) {
      errors.push(...formatValidation.errors);
    }

    // 唯一性验证
    const uniquenessValidation = this.validateUniqueness(
      tenantCode,
      existingCodes,
    );
    if (!uniquenessValidation.isValid) {
      errors.push(...uniquenessValidation.errors);
    }

    // 相似性验证
    const similarityValidation = this.validateSimilarity(
      tenantCode,
      existingCodes,
    );
    if (!similarityValidation.isValid) {
      errors.push(...similarityValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions:
        errors.length > 0
          ? this.generateSuggestions(tenantCode, existingCodes)
          : undefined,
    };
  }

  /**
   * 验证租户代码格式
   *
   * @param tenantCode - 租户代码
   * @returns 格式验证结果
   */
  private validateFormat(tenantCode: string): TenantCodeValidationResult {
    const errors: string[] = [];

    // 长度验证
    if (tenantCode.length < 3) {
      errors.push("租户代码长度不能少于3个字符");
    }
    if (tenantCode.length > 20) {
      errors.push("租户代码长度不能超过20个字符");
    }

    // 字符验证
    if (!/^[a-zA-Z0-9-_]+$/.test(tenantCode)) {
      errors.push("租户代码只能包含字母、数字、连字符和下划线");
    }

    // 首尾字符验证
    if (!/^[a-zA-Z0-9]/.test(tenantCode)) {
      errors.push("租户代码必须以字母或数字开头");
    }
    if (!/[a-zA-Z0-9]$/.test(tenantCode)) {
      errors.push("租户代码必须以字母或数字结尾");
    }

    // 连续字符验证
    if (/(.)\1{2,}/.test(tenantCode)) {
      errors.push("租户代码不能包含连续重复的字符");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证租户代码唯一性
   *
   * @param tenantCode - 租户代码
   * @param existingCodes - 现有租户代码列表
   * @returns 唯一性验证结果
   */
  private validateUniqueness(
    tenantCode: string,
    existingCodes: readonly string[],
  ): TenantCodeValidationResult {
    const errors: string[] = [];

    const lowerCaseCode = tenantCode.toLowerCase();
    const isDuplicate = existingCodes.some(
      (code) => code.toLowerCase() === lowerCaseCode,
    );

    if (isDuplicate) {
      errors.push(`租户代码 "${tenantCode}" 已存在`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证租户代码相似性
   *
   * @param tenantCode - 租户代码
   * @param existingCodes - 现有租户代码列表
   * @returns 相似性验证结果
   */
  private validateSimilarity(
    tenantCode: string,
    existingCodes: readonly string[],
  ): TenantCodeValidationResult {
    const errors: string[] = [];

    const lowerCaseCode = tenantCode.toLowerCase();
    const similarCodes = existingCodes.filter((code) => {
      const existingCode = code.toLowerCase();
      const similarity = this.calculateSimilarity(lowerCaseCode, existingCode);
      return similarity > 0.8; // 相似度阈值
    });

    if (similarCodes.length > 0) {
      errors.push(
        `租户代码 "${tenantCode}" 与现有代码过于相似: ${similarCodes.join(", ")}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 计算两个字符串的相似度
   *
   * @param str1 - 字符串1
   * @param str2 - 字符串2
   * @returns 相似度（0-1）
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    const editDistance = this.calculateEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * 计算编辑距离
   *
   * @param str1 - 字符串1
   * @param str2 - 字符串2
   * @returns 编辑距离
   */
  private calculateEditDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1];
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i] + 1,
            matrix[j][i - 1] + 1,
            matrix[j - 1][i - 1] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * 生成租户代码建议
   *
   * @param tenantCode - 原始租户代码
   * @param existingCodes - 现有租户代码列表
   * @returns 建议的租户代码列表
   */
  private generateSuggestions(
    tenantCode: string,
    existingCodes: readonly string[],
  ): readonly string[] {
    const suggestions: string[] = [];
    const baseCode = tenantCode.replace(/[^a-zA-Z0-9]/g, "");

    // 添加数字后缀
    for (let i = 1; i <= 10; i++) {
      const suggestion = `${baseCode}${i}`;
      if (!existingCodes.includes(suggestion)) {
        suggestions.push(suggestion);
      }
    }

    // 添加年份后缀
    const currentYear = new Date().getFullYear();
    const yearSuggestion = `${baseCode}${currentYear}`;
    if (!existingCodes.includes(yearSuggestion)) {
      suggestions.push(yearSuggestion);
    }

    // 添加随机后缀
    for (let i = 0; i < 5; i++) {
      const randomSuffix = Math.random().toString(36).substr(2, 3);
      const suggestion = `${baseCode}-${randomSuffix}`;
      if (!existingCodes.includes(suggestion)) {
        suggestions.push(suggestion);
      }
    }

    return suggestions.slice(0, 5); // 返回前5个建议
  }

  /**
   * 验证租户代码是否可用
   *
   * @param tenantCode - 租户代码
   * @param existingCodes - 现有租户代码列表
   * @returns 是否可用
   */
  async isTenantCodeAvailable(
    tenantCode: string,
    existingCodes: readonly string[] = [],
  ): Promise<boolean> {
    const validation = await this.validateTenantCode(tenantCode, existingCodes);
    return validation.isValid;
  }

  /**
   * 获取可用的租户代码建议
   *
   * @param tenantCode - 原始租户代码
   * @param existingCodes - 现有租户代码列表
   * @returns 可用的租户代码建议
   */
  async getAvailableTenantCodeSuggestions(
    tenantCode: string,
    existingCodes: readonly string[] = [],
  ): Promise<readonly string[]> {
    const validation = await this.validateTenantCode(tenantCode, existingCodes);
    if (validation.isValid) {
      return [tenantCode];
    }
    return validation.suggestions || [];
  }
}
