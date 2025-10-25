/**
 * 域名验证服务
 *
 * @description 负责域名格式验证、唯一性检查和可用性验证
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";

/**
 * 域名验证结果
 */
export interface DomainValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly suggestions?: readonly string[];
}

/**
 * 域名验证服务
 *
 * 域名验证服务负责验证域名的格式正确性、唯一性和可用性。
 * 支持域名格式验证、唯一性检查、相似性检查等功能。
 *
 * @example
 * ```typescript
 * const validator = new DomainValidator();
 * const result = await validator.validateDomain("acme.example.com");
 * if (result.isValid) {
 *   console.log("域名验证通过");
 * } else {
 *   console.log("验证失败:", result.errors);
 * }
 * ```
 */
@Injectable()
export class DomainValidator {
  /**
   * 验证域名
   *
   * @param domain - 域名
   * @param existingDomains - 现有域名列表
   * @returns 验证结果
   */
  async validateDomain(
    domain: string,
    existingDomains: readonly string[] = [],
  ): Promise<DomainValidationResult> {
    const errors: string[] = [];

    // 格式验证
    const formatValidation = this.validateFormat(domain);
    if (!formatValidation.isValid) {
      errors.push(...formatValidation.errors);
    }

    // 唯一性验证
    const uniquenessValidation = this.validateUniqueness(
      domain,
      existingDomains,
    );
    if (!uniquenessValidation.isValid) {
      errors.push(...uniquenessValidation.errors);
    }

    // 相似性验证
    const similarityValidation = this.validateSimilarity(
      domain,
      existingDomains,
    );
    if (!similarityValidation.isValid) {
      errors.push(...similarityValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions:
        errors.length > 0
          ? this.generateSuggestions(domain, existingDomains)
          : undefined,
    };
  }

  /**
   * 验证域名格式
   *
   * @param domain - 域名
   * @returns 格式验证结果
   */
  private validateFormat(domain: string): DomainValidationResult {
    const errors: string[] = [];

    // 基本格式验证
    if (!domain || domain.trim().length === 0) {
      errors.push("域名不能为空");
      return { isValid: false, errors };
    }

    // 长度验证
    if (domain.length > 253) {
      errors.push("域名长度不能超过253个字符");
    }

    // 域名格式正则表达式
    const domainRegex =
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    if (!domainRegex.test(domain)) {
      errors.push("域名格式不正确");
    }

    // 标签长度验证
    const labels = domain.split(".");
    for (const label of labels) {
      if (label.length > 63) {
        errors.push(`域名标签 "${label}" 长度不能超过63个字符`);
      }
      if (label.length === 0) {
        errors.push("域名标签不能为空");
      }
    }

    // 顶级域名验证
    const tld = labels[labels.length - 1];
    if (tld && tld.length < 2) {
      errors.push("顶级域名长度不能少于2个字符");
    }

    // 子域名验证
    if (labels.length > 127) {
      errors.push("域名层级不能超过127层");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证域名唯一性
   *
   * @param domain - 域名
   * @param existingDomains - 现有域名列表
   * @returns 唯一性验证结果
   */
  private validateUniqueness(
    domain: string,
    existingDomains: readonly string[],
  ): DomainValidationResult {
    const errors: string[] = [];

    const lowerCaseDomain = domain.toLowerCase();
    const isDuplicate = existingDomains.some(
      (existingDomain) => existingDomain.toLowerCase() === lowerCaseDomain,
    );

    if (isDuplicate) {
      errors.push(`域名 "${domain}" 已存在`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证域名相似性
   *
   * @param domain - 域名
   * @param existingDomains - 现有域名列表
   * @returns 相似性验证结果
   */
  private validateSimilarity(
    domain: string,
    existingDomains: readonly string[],
  ): DomainValidationResult {
    const errors: string[] = [];

    const lowerCaseDomain = domain.toLowerCase();
    const similarDomains = existingDomains.filter((existingDomain) => {
      const existingLowerDomain = existingDomain.toLowerCase();
      const similarity = this.calculateSimilarity(
        lowerCaseDomain,
        existingLowerDomain,
      );
      return similarity > 0.8; // 相似度阈值
    });

    if (similarDomains.length > 0) {
      errors.push(
        `域名 "${domain}" 与现有域名过于相似: ${similarDomains.join(", ")}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 计算两个域名的相似度
   *
   * @param domain1 - 域名1
   * @param domain2 - 域名2
   * @returns 相似度（0-1）
   */
  private calculateSimilarity(domain1: string, domain2: string): number {
    // 使用编辑距离计算相似度
    const editDistance = this.calculateEditDistance(domain1, domain2);
    const maxLength = Math.max(domain1.length, domain2.length);
    return maxLength === 0 ? 1.0 : (maxLength - editDistance) / maxLength;
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
   * 生成域名建议
   *
   * @param domain - 原始域名
   * @param existingDomains - 现有域名列表
   * @returns 建议的域名列表
   */
  private generateSuggestions(
    domain: string,
    existingDomains: readonly string[],
  ): readonly string[] {
    const suggestions: string[] = [];
    const parts = domain.split(".");
    const baseDomain = parts.slice(0, -1).join(".");
    const tld = parts[parts.length - 1];

    // 添加数字后缀
    for (let i = 1; i <= 10; i++) {
      const suggestion = `${baseDomain}${i}.${tld}`;
      if (!existingDomains.includes(suggestion)) {
        suggestions.push(suggestion);
      }
    }

    // 添加年份后缀
    const currentYear = new Date().getFullYear();
    const yearSuggestion = `${baseDomain}${currentYear}.${tld}`;
    if (!existingDomains.includes(yearSuggestion)) {
      suggestions.push(yearSuggestion);
    }

    // 添加随机后缀
    for (let i = 0; i < 5; i++) {
      const randomSuffix = Math.random().toString(36).substr(2, 3);
      const suggestion = `${baseDomain}-${randomSuffix}.${tld}`;
      if (!existingDomains.includes(suggestion)) {
        suggestions.push(suggestion);
      }
    }

    return suggestions.slice(0, 5); // 返回前5个建议
  }

  /**
   * 验证域名是否可用
   *
   * @param domain - 域名
   * @param existingDomains - 现有域名列表
   * @returns 是否可用
   */
  async isDomainAvailable(
    domain: string,
    existingDomains: readonly string[] = [],
  ): Promise<boolean> {
    const validation = await this.validateDomain(domain, existingDomains);
    return validation.isValid;
  }

  /**
   * 获取可用的域名建议
   *
   * @param domain - 原始域名
   * @param existingDomains - 现有域名列表
   * @returns 可用的域名建议
   */
  async getAvailableDomainSuggestions(
    domain: string,
    existingDomains: readonly string[] = [],
  ): Promise<readonly string[]> {
    const validation = await this.validateDomain(domain, existingDomains);
    if (validation.isValid) {
      return [domain];
    }
    return validation.suggestions || [];
  }

  /**
   * 提取域名的主机名部分
   *
   * @param domain - 完整域名
   * @returns 主机名部分
   */
  extractHostname(domain: string): string {
    const parts = domain.split(".");
    return parts.slice(0, -1).join(".");
  }

  /**
   * 提取域名的顶级域名部分
   *
   * @param domain - 完整域名
   * @returns 顶级域名部分
   */
  extractTopLevelDomain(domain: string): string {
    const parts = domain.split(".");
    return parts[parts.length - 1] || "";
  }

  /**
   * 检查域名是否为子域名
   *
   * @param domain - 域名
   * @returns 是否为子域名
   */
  isSubdomain(domain: string): boolean {
    const parts = domain.split(".");
    return parts.length > 2;
  }

  /**
   * 获取域名的层级深度
   *
   * @param domain - 域名
   * @returns 层级深度
   */
  getDomainDepth(domain: string): number {
    return domain.split(".").length;
  }
}
