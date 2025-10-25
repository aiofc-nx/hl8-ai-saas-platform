/**
 * 租户创建规则服务
 *
 * @description 负责租户创建的业务规则验证和约束逻辑
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { TenantCode } from "../value-objects/tenant-code.vo.js";
import { TenantName } from "../value-objects/tenant-name.vo.js";
import { TenantType } from "../value-objects/tenant-type.vo.js";
import { TenantCodeValidator } from "./tenant-code-validator.service.js";
import { DomainValidator } from "./domain-validator.service.js";

/**
 * 租户创建规则验证结果
 */
export interface TenantCreationRulesValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings?: readonly string[];
  readonly suggestions?: readonly string[];
}

/**
 * 租户创建规则配置
 */
export interface TenantCreationRulesConfig {
  readonly maxTenantsPerUser: number;
  readonly maxTenantsPerDomain: number;
  readonly allowDuplicateNames: boolean;
  readonly requireDomainValidation: boolean;
  readonly requireCodeValidation: boolean;
  readonly maxTenantNameLength: number;
  readonly minTenantNameLength: number;
  readonly allowedTenantTypes: readonly TenantType[];
  readonly restrictedTenantTypes: readonly TenantType[];
}

/**
 * 租户创建规则服务
 *
 * 租户创建规则服务负责验证租户创建的业务规则和约束逻辑。
 * 支持租户代码验证、域名验证、名称验证、类型限制等复杂业务场景的验证。
 *
 * @example
 * ```typescript
 * const rules = new TenantCreationRules();
 * const result = await rules.validateTenantCreation({
 *   code: new TenantCode("acme-corp"),
 *   name: new TenantName("Acme Corporation"),
 *   type: TenantType.PROFESSIONAL,
 *   domain: "acme.example.com"
 * }, existingTenants);
 * if (result.isValid) {
 *   console.log("租户创建验证通过");
 * } else {
 *   console.log("验证失败:", result.errors);
 * }
 * ```
 */
@Injectable()
export class TenantCreationRules {
  private readonly config: TenantCreationRulesConfig;
  private readonly tenantCodeValidator: TenantCodeValidator;
  private readonly domainValidator: DomainValidator;

  constructor(
    config?: Partial<TenantCreationRulesConfig>,
    tenantCodeValidator?: TenantCodeValidator,
    domainValidator?: DomainValidator,
  ) {
    this.config = {
      maxTenantsPerUser: config?.maxTenantsPerUser || 10,
      maxTenantsPerDomain: config?.maxTenantsPerDomain || 5,
      allowDuplicateNames: config?.allowDuplicateNames || false,
      requireDomainValidation: config?.requireDomainValidation || true,
      requireCodeValidation: config?.requireCodeValidation || true,
      maxTenantNameLength: config?.maxTenantNameLength || 100,
      minTenantNameLength: config?.minTenantNameLength || 2,
      allowedTenantTypes:
        config?.allowedTenantTypes || Object.values(TenantType),
      restrictedTenantTypes: config?.restrictedTenantTypes || [],
      ...config,
    };
    this.tenantCodeValidator = tenantCodeValidator || new TenantCodeValidator();
    this.domainValidator = domainValidator || new DomainValidator();
  }

  /**
   * 验证租户创建
   *
   * @param tenantData - 租户数据
   * @param existingTenants - 现有租户列表
   * @returns 验证结果
   */
  async validateTenantCreation(
    tenantData: {
      readonly code: TenantCode;
      readonly name: TenantName;
      readonly type: TenantType;
      readonly domain?: string;
      readonly createdBy: string;
    },
    existingTenants: readonly {
      readonly code: string;
      readonly name: string;
      readonly type: TenantType;
      readonly domain?: string;
      readonly createdBy: string;
    }[],
  ): Promise<TenantCreationRulesValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 验证租户代码
    if (this.config.requireCodeValidation) {
      const codeValidation = await this.validateTenantCode(
        tenantData.code,
        existingTenants,
      );
      if (!codeValidation.isValid) {
        errors.push(...codeValidation.errors);
      }
      if (codeValidation.suggestions) {
        suggestions.push(...codeValidation.suggestions);
      }
    }

    // 验证租户名称
    const nameValidation = this.validateTenantName(
      tenantData.name,
      existingTenants,
    );
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors);
    }
    if (nameValidation.warnings) {
      warnings.push(...nameValidation.warnings);
    }

    // 验证租户类型
    const typeValidation = this.validateTenantType(tenantData.type);
    if (!typeValidation.isValid) {
      errors.push(...typeValidation.errors);
    }

    // 验证域名
    if (tenantData.domain && this.config.requireDomainValidation) {
      const domainValidation = await this.validateTenantDomain(
        tenantData.domain,
        existingTenants,
      );
      if (!domainValidation.isValid) {
        errors.push(...domainValidation.errors);
      }
      if (domainValidation.suggestions) {
        suggestions.push(...domainValidation.suggestions);
      }
    }

    // 验证用户租户限制
    const userLimitValidation = this.validateUserTenantLimit(
      tenantData.createdBy,
      existingTenants,
    );
    if (!userLimitValidation.isValid) {
      errors.push(...userLimitValidation.errors);
    }

    // 验证域名租户限制
    if (tenantData.domain) {
      const domainLimitValidation = this.validateDomainTenantLimit(
        tenantData.domain,
        existingTenants,
      );
      if (!domainLimitValidation.isValid) {
        errors.push(...domainLimitValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * 验证租户代码
   *
   * @param code - 租户代码
   * @param existingTenants - 现有租户列表
   * @returns 验证结果
   */
  private async validateTenantCode(
    code: TenantCode,
    existingTenants: readonly {
      readonly code: string;
      readonly name: string;
      readonly type: TenantType;
      readonly domain?: string;
      readonly createdBy: string;
    }[],
  ): Promise<TenantCreationRulesValidationResult> {
    const errors: string[] = [];
    const suggestions: string[] = [];

    const existingCodes = existingTenants.map((tenant) => tenant.code);
    const validation = await this.tenantCodeValidator.validateTenantCode(
      code.value,
      existingCodes,
    );

    if (!validation.isValid) {
      errors.push(...validation.errors);
    }

    if (validation.suggestions) {
      suggestions.push(...validation.suggestions);
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * 验证租户名称
   *
   * @param name - 租户名称
   * @param existingTenants - 现有租户列表
   * @returns 验证结果
   */
  private validateTenantName(
    name: TenantName,
    existingTenants: readonly {
      readonly code: string;
      readonly name: string;
      readonly type: TenantType;
      readonly domain?: string;
      readonly createdBy: string;
    }[],
  ): TenantCreationRulesValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 长度验证
    if (name.value.length < this.config.minTenantNameLength) {
      errors.push(
        `租户名称长度不能少于 ${this.config.minTenantNameLength} 个字符`,
      );
    }
    if (name.value.length > this.config.maxTenantNameLength) {
      errors.push(
        `租户名称长度不能超过 ${this.config.maxTenantNameLength} 个字符`,
      );
    }

    // 唯一性验证
    if (!this.config.allowDuplicateNames) {
      const existingNames = existingTenants.map((tenant) => tenant.name);
      const isDuplicate = existingNames.some(
        (existingName) =>
          existingName.toLowerCase() === name.value.toLowerCase(),
      );

      if (isDuplicate) {
        errors.push(`租户名称 "${name.value}" 已存在`);
      }
    }

    // 格式验证
    if (!/^[a-zA-Z0-9\u4e00-\u9fa5\s\-_\.]+$/.test(name.value)) {
      errors.push(
        "租户名称只能包含字母、数字、中文、空格、连字符、下划线和点号",
      );
    }

    // 敏感词检查
    const sensitiveWords = ["admin", "root", "system", "test", "demo"];
    const containsSensitiveWord = sensitiveWords.some((word) =>
      name.value.toLowerCase().includes(word),
    );

    if (containsSensitiveWord) {
      warnings.push("租户名称包含敏感词，建议修改");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * 验证租户类型
   *
   * @param type - 租户类型
   * @returns 验证结果
   */
  private validateTenantType(
    type: TenantType,
  ): TenantCreationRulesValidationResult {
    const errors: string[] = [];

    // 检查是否在允许的类型列表中
    if (!this.config.allowedTenantTypes.includes(type)) {
      errors.push(`租户类型 "${type}" 不在允许的类型列表中`);
    }

    // 检查是否在限制的类型列表中
    if (this.config.restrictedTenantTypes.includes(type)) {
      errors.push(`租户类型 "${type}" 已被限制使用`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证租户域名
   *
   * @param domain - 域名
   * @param existingTenants - 现有租户列表
   * @returns 验证结果
   */
  private async validateTenantDomain(
    domain: string,
    existingTenants: readonly {
      readonly code: string;
      readonly name: string;
      readonly type: TenantType;
      readonly domain?: string;
      readonly createdBy: string;
    }[],
  ): Promise<TenantCreationRulesValidationResult> {
    const errors: string[] = [];
    const suggestions: string[] = [];

    const existingDomains = existingTenants
      .filter((tenant) => tenant.domain)
      .map((tenant) => tenant.domain!);

    const validation = await this.domainValidator.validateDomain(
      domain,
      existingDomains,
    );

    if (!validation.isValid) {
      errors.push(...validation.errors);
    }

    if (validation.suggestions) {
      suggestions.push(...validation.suggestions);
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * 验证用户租户限制
   *
   * @param createdBy - 创建者
   * @param existingTenants - 现有租户列表
   * @returns 验证结果
   */
  private validateUserTenantLimit(
    createdBy: string,
    existingTenants: readonly {
      readonly code: string;
      readonly name: string;
      readonly type: TenantType;
      readonly domain?: string;
      readonly createdBy: string;
    }[],
  ): TenantCreationRulesValidationResult {
    const errors: string[] = [];

    const userTenants = existingTenants.filter(
      (tenant) => tenant.createdBy === createdBy,
    );

    if (userTenants.length >= this.config.maxTenantsPerUser) {
      errors.push(`用户最多只能创建 ${this.config.maxTenantsPerUser} 个租户`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证域名租户限制
   *
   * @param domain - 域名
   * @param existingTenants - 现有租户列表
   * @returns 验证结果
   */
  private validateDomainTenantLimit(
    domain: string,
    existingTenants: readonly {
      readonly code: string;
      readonly name: string;
      readonly type: TenantType;
      readonly domain?: string;
      readonly createdBy: string;
    }[],
  ): TenantCreationRulesValidationResult {
    const errors: string[] = [];

    const domainTenants = existingTenants.filter(
      (tenant) => tenant.domain === domain,
    );

    if (domainTenants.length >= this.config.maxTenantsPerDomain) {
      errors.push(`域名最多只能关联 ${this.config.maxTenantsPerDomain} 个租户`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 检查租户创建是否被允许
   *
   * @param tenantData - 租户数据
   * @param existingTenants - 现有租户列表
   * @returns 是否允许创建
   */
  async isTenantCreationAllowed(
    tenantData: {
      readonly code: TenantCode;
      readonly name: TenantName;
      readonly type: TenantType;
      readonly domain?: string;
      readonly createdBy: string;
    },
    existingTenants: readonly {
      readonly code: string;
      readonly name: string;
      readonly type: TenantType;
      readonly domain?: string;
      readonly createdBy: string;
    }[],
  ): Promise<boolean> {
    const validation = await this.validateTenantCreation(
      tenantData,
      existingTenants,
    );
    return validation.isValid;
  }

  /**
   * 获取租户创建建议
   *
   * @param tenantData - 租户数据
   * @param existingTenants - 现有租户列表
   * @returns 创建建议
   */
  async getTenantCreationSuggestions(
    tenantData: {
      readonly code: TenantCode;
      readonly name: TenantName;
      readonly type: TenantType;
      readonly domain?: string;
      readonly createdBy: string;
    },
    existingTenants: readonly {
      readonly code: string;
      readonly name: string;
      readonly type: TenantType;
      readonly domain?: string;
      readonly createdBy: string;
    }[],
  ): Promise<{
    readonly codeSuggestions: readonly string[];
    readonly domainSuggestions: readonly string[];
    readonly typeSuggestions: readonly TenantType[];
  }> {
    const validation = await this.validateTenantCreation(
      tenantData,
      existingTenants,
    );

    const codeSuggestions =
      validation.suggestions?.filter((suggestion) =>
        suggestion.includes(tenantData.code.value),
      ) || [];

    const domainSuggestions =
      validation.suggestions?.filter((suggestion) =>
        suggestion.includes(tenantData.domain || ""),
      ) || [];

    const typeSuggestions = this.config.allowedTenantTypes.filter(
      (type) => !this.config.restrictedTenantTypes.includes(type),
    );

    return {
      codeSuggestions,
      domainSuggestions,
      typeSuggestions,
    };
  }

  /**
   * 获取租户创建统计信息
   *
   * @param existingTenants - 现有租户列表
   * @returns 统计信息
   */
  getTenantCreationStatistics(
    existingTenants: readonly {
      readonly code: string;
      readonly name: string;
      readonly type: TenantType;
      readonly domain?: string;
      readonly createdBy: string;
    }[],
  ): {
    readonly totalTenants: number;
    readonly tenantsByType: Record<TenantType, number>;
    readonly tenantsByUser: Record<string, number>;
    readonly tenantsByDomain: Record<string, number>;
  } {
    const tenantsByType: Record<TenantType, number> = {} as Record<
      TenantType,
      number
    >;
    const tenantsByUser: Record<string, number> = {};
    const tenantsByDomain: Record<string, number> = {};

    for (const tenant of existingTenants) {
      // 按类型统计
      tenantsByType[tenant.type] = (tenantsByType[tenant.type] || 0) + 1;

      // 按用户统计
      tenantsByUser[tenant.createdBy] =
        (tenantsByUser[tenant.createdBy] || 0) + 1;

      // 按域名统计
      if (tenant.domain) {
        tenantsByDomain[tenant.domain] =
          (tenantsByDomain[tenant.domain] || 0) + 1;
      }
    }

    return {
      totalTenants: existingTenants.length,
      tenantsByType,
      tenantsByUser,
      tenantsByDomain,
    };
  }
}
