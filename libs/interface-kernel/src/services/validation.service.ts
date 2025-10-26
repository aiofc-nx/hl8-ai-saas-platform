/**
 * @fileoverview 数据验证服务
 * @description 提供数据验证功能，包括请求数据验证、类型检查、业务规则验证等
 */

import { Injectable } from "@nestjs/common";
import { FastifyLoggerService } from "@hl8/nestjs-fastify";
import { z } from "zod";
import { GeneralBadRequestException } from "@hl8/exceptions";
import type {
  ValidationRule,
  InterfaceFastifyRequest,
} from "../types/index.js";

/**
 * 验证结果接口
 * @description 定义验证结果的结构
 */
interface ValidationResult {
  isValid: boolean;
  data?: Record<string, unknown>;
  errors?: string[];
}

/**
 * 数据验证服务
 * @description 提供数据验证相关功能
 */
@Injectable()
export class ValidationService {
  private readonly validationSchemas: Map<string, z.ZodSchema> = new Map();

  constructor(private readonly logger: FastifyLoggerService) {
    this.logger.log("Validation Service initialized");
    this.initializeDefaultSchemas();
  }

  /**
   * 验证请求数据
   * @description 验证请求中的数据是否符合预期格式
   * @param request 请求对象
   * @param schemaName 验证模式名称
   * @returns 验证结果
   */
  async validateRequestData(
    request: InterfaceFastifyRequest,
    schemaName: string,
  ): Promise<ValidationResult> {
    try {
      this.logger.debug(`Validating request data with schema: ${schemaName}`);

      const schema = this.validationSchemas.get(schemaName);
      if (!schema) {
        throw new GeneralBadRequestException(
          "验证模式未找到",
          `验证模式 "${schemaName}" 不存在`,
          { schemaName },
        );
      }

      // 获取请求数据
      const requestData = this.extractRequestData(request);

      // 执行验证
      const result = schema.safeParse(requestData);

      if (result.success) {
        this.logger.debug("Request data validation successful");
        return {
          isValid: true,
          data: result.data,
        };
      } else {
        const errors = result.error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`,
        );
        this.logger.debug(
          `Request data validation failed: ${errors.join(", ")}`,
        );

        // 抛出验证失败异常
        throw new GeneralBadRequestException(
          "数据验证失败",
          `请求数据验证失败: ${errors.join(", ")}`,
          { errors, schemaName },
        );
      }
    } catch (error) {
      this.logger.error(
        `Request data validation failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      // 如果是标准异常，直接抛出
      if (error instanceof GeneralBadRequestException) {
        throw error;
      }

      // 其他错误转换为验证失败异常
      throw new GeneralBadRequestException(
        "数据验证失败",
        error instanceof Error ? error.message : String(error),
        { schemaName },
      );
    }
  }

  /**
   * 验证查询参数
   * @description 验证请求的查询参数
   * @param request 请求对象
   * @param rules 验证规则
   * @returns 验证结果
   */
  async validateQueryParams(
    request: InterfaceFastifyRequest,
    rules: ValidationRule[],
  ): Promise<ValidationResult> {
    try {
      this.logger.debug("Validating query parameters");

      const queryParams = request.query || {};
      const errors: string[] = [];

      for (const rule of rules) {
        const value = queryParams[rule.field];

        // 检查必需字段
        if (
          rule.required &&
          (value === undefined || value === null || value === "")
        ) {
          errors.push(`${rule.field} is required`);
          continue;
        }

        // 如果字段不存在且不是必需的，跳过验证
        if (value === undefined || value === null || value === "") {
          continue;
        }

        // 验证字段类型
        const typeError = this.validateFieldType(value, rule);
        if (typeError) {
          errors.push(typeError);
          continue;
        }

        // 验证字段值
        const valueError = this.validateFieldValue(value, rule);
        if (valueError) {
          errors.push(valueError);
        }
      }

      if (errors.length > 0) {
        this.logger.debug(
          `Query parameter validation failed: ${errors.join(", ")}`,
        );
        throw new GeneralBadRequestException(
          "查询参数验证失败",
          `查询参数验证失败: ${errors.join(", ")}`,
          { errors, parameterType: "query" },
        );
      }

      this.logger.debug("Query parameter validation successful");
      return {
        isValid: true,
        data: queryParams as Record<string, unknown>,
      };
    } catch (error) {
      this.logger.error(
        `Query parameter validation failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      // 如果是标准异常，直接抛出
      if (error instanceof GeneralBadRequestException) {
        throw error;
      }

      // 其他错误转换为验证失败异常
      throw new GeneralBadRequestException(
        "查询参数验证失败",
        error instanceof Error ? error.message : String(error),
        { parameterType: "query" },
      );
    }
  }

  /**
   * 验证路径参数
   * @description 验证请求的路径参数
   * @param request 请求对象
   * @param rules 验证规则
   * @returns 验证结果
   */
  async validatePathParams(
    request: InterfaceFastifyRequest,
    rules: ValidationRule[],
  ): Promise<ValidationResult> {
    try {
      this.logger.debug("Validating path parameters");

      const pathParams = request.params || {};
      const errors: string[] = [];

      for (const rule of rules) {
        const value = pathParams[rule.field];

        // 检查必需字段
        if (
          rule.required &&
          (value === undefined || value === null || value === "")
        ) {
          errors.push(`${rule.field} is required`);
          continue;
        }

        // 如果字段不存在且不是必需的，跳过验证
        if (value === undefined || value === null || value === "") {
          continue;
        }

        // 验证字段类型
        const typeError = this.validateFieldType(value, rule);
        if (typeError) {
          errors.push(typeError);
          continue;
        }

        // 验证字段值
        const valueError = this.validateFieldValue(value, rule);
        if (valueError) {
          errors.push(valueError);
        }
      }

      if (errors.length > 0) {
        this.logger.debug(
          `Path parameter validation failed: ${errors.join(", ")}`,
        );
        throw new GeneralBadRequestException(
          "路径参数验证失败",
          `路径参数验证失败: ${errors.join(", ")}`,
          { errors, parameterType: "path" },
        );
      }

      this.logger.debug("Path parameter validation successful");
      return {
        isValid: true,
        data: pathParams as Record<string, unknown>,
      };
    } catch (error) {
      this.logger.error(
        `Path parameter validation failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      // 如果是标准异常，直接抛出
      if (error instanceof GeneralBadRequestException) {
        throw error;
      }

      // 其他错误转换为验证失败异常
      throw new GeneralBadRequestException(
        "路径参数验证失败",
        error instanceof Error ? error.message : String(error),
        { parameterType: "path" },
      );
    }
  }

  /**
   * 验证请求体
   * @description 验证请求体数据
   * @param request 请求对象
   * @param rules 验证规则
   * @returns 验证结果
   */
  async validateRequestBody(
    request: InterfaceFastifyRequest,
    rules: ValidationRule[],
  ): Promise<ValidationResult> {
    try {
      this.logger.debug("Validating request body");

      const body = request.body || {};
      const errors: string[] = [];

      for (const rule of rules) {
        const value = body[rule.field];

        // 检查必需字段
        if (rule.required && (value === undefined || value === null)) {
          errors.push(`${rule.field} is required`);
          continue;
        }

        // 如果字段不存在且不是必需的，跳过验证
        if (value === undefined || value === null) {
          continue;
        }

        // 验证字段类型
        const typeError = this.validateFieldType(value, rule);
        if (typeError) {
          errors.push(typeError);
          continue;
        }

        // 验证字段值
        const valueError = this.validateFieldValue(value, rule);
        if (valueError) {
          errors.push(valueError);
        }
      }

      if (errors.length > 0) {
        this.logger.debug(
          `Request body validation failed: ${errors.join(", ")}`,
        );
        throw new GeneralBadRequestException(
          "请求体验证失败",
          `请求体验证失败: ${errors.join(", ")}`,
          { errors, parameterType: "body" },
        );
      }

      this.logger.debug("Request body validation successful");
      return {
        isValid: true,
        data: body as Record<string, unknown>,
      };
    } catch (error) {
      this.logger.error(
        `Request body validation failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      // 如果是标准异常，直接抛出
      if (error instanceof GeneralBadRequestException) {
        throw error;
      }

      // 其他错误转换为验证失败异常
      throw new GeneralBadRequestException(
        "请求体验证失败",
        error instanceof Error ? error.message : String(error),
        { parameterType: "body" },
      );
    }
  }

  /**
   * 验证字段类型
   * @description 验证字段的数据类型
   * @param value 字段值
   * @param rule 验证规则
   * @returns 错误信息或 null
   */
  private validateFieldType(
    value: unknown,
    rule: ValidationRule,
  ): string | null {
    try {
      switch (rule.type) {
        case "string":
          if (typeof value !== "string") {
            return `${rule.field} must be a string`;
          }
          break;
        case "number":
          if (typeof value !== "number" && !/^\d+$/.test(String(value))) {
            return `${rule.field} must be a number`;
          }
          break;
        case "boolean":
          if (
            typeof value !== "boolean" &&
            value !== "true" &&
            value !== "false"
          ) {
            return `${rule.field} must be a boolean`;
          }
          break;
        case "email":
          if (
            typeof value !== "string" ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ) {
            return `${rule.field} must be a valid email address`;
          }
          break;
        case "uuid":
          if (
            typeof value !== "string" ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              value,
            )
          ) {
            return `${rule.field} must be a valid UUID`;
          }
          break;
        case "date":
          if (typeof value !== "string" || isNaN(Date.parse(value))) {
            return `${rule.field} must be a valid date`;
          }
          break;
        case "array":
          if (!Array.isArray(value)) {
            return `${rule.field} must be an array`;
          }
          break;
        case "object":
          if (typeof value !== "object" || Array.isArray(value)) {
            return `${rule.field} must be an object`;
          }
          break;
        default:
          return null;
      }

      return null;
    } catch (error) {
      return `${rule.field} type validation failed: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * 验证字段值
   * @description 验证字段的值是否符合规则
   * @param value 字段值
   * @param rule 验证规则
   * @returns 错误信息或 null
   */
  private validateFieldValue(
    value: unknown,
    rule: ValidationRule,
  ): string | null {
    try {
      // 验证最小值
      if (rule.min !== undefined) {
        if (
          typeof value === "string" &&
          rule.type === "string" &&
          value.length < rule.min
        ) {
          return `${rule.field} must be at least ${rule.min} characters long`;
        }
        if (typeof value === "number" && value < rule.min) {
          return `${rule.field} must be at least ${rule.min}`;
        }
        // 对于字符串类型的数字，需要转换后比较
        if (
          typeof value === "string" &&
          rule.type === "number" &&
          !isNaN(Number(value))
        ) {
          const numValue = Number(value);
          if (numValue < rule.min) {
            return `${rule.field} must be at least ${rule.min}`;
          }
        }
        if (Array.isArray(value) && value.length < rule.min) {
          return `${rule.field} must have at least ${rule.min} items`;
        }
      }

      // 验证最大值
      if (rule.max !== undefined) {
        if (
          typeof value === "string" &&
          rule.type === "string" &&
          value.length > rule.max
        ) {
          return `${rule.field} must be no more than ${rule.max} characters long`;
        }
        if (typeof value === "number" && value > rule.max) {
          return `${rule.field} must be no more than ${rule.max}`;
        }
        // 对于字符串类型的数字，需要转换后比较
        if (
          typeof value === "string" &&
          rule.type === "number" &&
          !isNaN(Number(value))
        ) {
          const numValue = Number(value);
          if (numValue > rule.max) {
            return `${rule.field} must be no more than ${rule.max}`;
          }
        }
        if (Array.isArray(value) && value.length > rule.max) {
          return `${rule.field} must have no more than ${rule.max} items`;
        }
      }

      // 验证正则表达式
      if (rule.pattern && typeof value === "string") {
        if (!rule.pattern.test(value)) {
          return `${rule.field} format is invalid`;
        }
      }

      // 验证自定义规则
      if (rule.custom && typeof rule.custom === "function") {
        if (!rule.custom(value)) {
          return rule.message || `${rule.field} validation failed`;
        }
      }

      return null;
    } catch (error) {
      return `${rule.field} value validation failed: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * 提取请求数据
   * @description 从请求中提取需要验证的数据
   * @param request 请求对象
   * @returns 请求数据
   */
  private extractRequestData(
    request: InterfaceFastifyRequest,
  ): Record<string, unknown> {
    // 对于 validateRequestData，我们主要验证请求体中的数据
    return (request.body || {}) as Record<string, unknown>;
  }

  /**
   * 添加验证模式
   * @description 添加新的验证模式
   * @param name 模式名称
   * @param schema Zod 模式
   */
  addValidationSchema(name: string, schema: z.ZodSchema): void {
    try {
      this.validationSchemas.set(name, schema);
      this.logger.debug(`Added validation schema: ${name}`);
    } catch (error) {
      this.logger.error(
        `Failed to add validation schema: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 移除验证模式
   * @description 移除指定的验证模式
   * @param name 模式名称
   */
  removeValidationSchema(name: string): void {
    try {
      this.validationSchemas.delete(name);
      this.logger.debug(`Removed validation schema: ${name}`);
    } catch (error) {
      this.logger.error(
        `Failed to remove validation schema: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 获取验证模式
   * @description 获取指定的验证模式
   * @param name 模式名称
   * @returns Zod 模式
   */
  getValidationSchema(name: string): z.ZodSchema | undefined {
    return this.validationSchemas.get(name);
  }

  /**
   * 初始化默认验证模式
   * @description 初始化系统默认的验证模式
   */
  private initializeDefaultSchemas(): void {
    try {
      // 用户创建模式
      const userCreateSchema = z.object({
        email: z.string().email("Invalid email format"),
        name: z.string().min(1, "Name is required").max(100, "Name too long"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        tenantId: z.string().uuid("Invalid tenant ID"),
        organizationId: z.string().uuid("Invalid organization ID").optional(),
        departmentId: z.string().uuid("Invalid department ID").optional(),
      });

      this.addValidationSchema("userCreate", userCreateSchema);

      // 用户更新模式
      const userUpdateSchema = z.object({
        name: z
          .string()
          .min(1, "Name is required")
          .max(100, "Name too long")
          .optional(),
        email: z.string().email("Invalid email format").optional(),
        organizationId: z.string().uuid("Invalid organization ID").optional(),
        departmentId: z.string().uuid("Invalid department ID").optional(),
      });

      this.addValidationSchema("userUpdate", userUpdateSchema);

      // 租户创建模式
      const tenantCreateSchema = z.object({
        name: z
          .string()
          .min(1, "Tenant name is required")
          .max(100, "Tenant name too long"),
        domain: z
          .string()
          .min(1, "Domain is required")
          .max(100, "Domain too long"),
        type: z.enum(["enterprise", "community", "team", "individual"], {
          errorMap: () => ({ message: "Invalid tenant type" }),
        }),
      });

      this.addValidationSchema("tenantCreate", tenantCreateSchema);

      // 组织创建模式
      const organizationCreateSchema = z.object({
        name: z
          .string()
          .min(1, "Organization name is required")
          .max(100, "Organization name too long"),
        description: z.string().max(500, "Description too long").optional(),
        tenantId: z.string().uuid("Invalid tenant ID"),
      });

      this.addValidationSchema("organizationCreate", organizationCreateSchema);

      // 部门创建模式
      const departmentCreateSchema = z.object({
        name: z
          .string()
          .min(1, "Department name is required")
          .max(100, "Department name too long"),
        description: z.string().max(500, "Description too long").optional(),
        parentId: z.string().uuid("Invalid parent department ID").optional(),
        organizationId: z.string().uuid("Invalid organization ID"),
      });

      this.addValidationSchema("departmentCreate", departmentCreateSchema);

      this.logger.debug("Default validation schemas initialized");
    } catch (error) {
      this.logger.error(
        `Failed to initialize default schemas: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
