/**
 * @fileoverview REST API 控制器
 * @description 提供统一的REST API接口，处理HTTP请求和响应
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Req,
  Res,
  Param,
  Body,
  HttpStatus,
} from "@nestjs/common";
import { FastifyLoggerService } from "@hl8/nestjs-fastify";
import type { FastifyReply } from "fastify";
import { ApiGatewayService } from "../services/api-gateway.service.js";
import { AuthenticationService } from "../services/authentication.service.js";
import { AuthorizationService } from "../services/authorization.service.js";
import { ValidationService } from "../services/validation.service.js";
import { RateLimitService } from "../services/rate-limit.service.js";
import { MonitoringService } from "../services/monitoring.service.js";
import type {
  InterfaceFastifyRequest,
  ValidationRule,
} from "../types/index.js";

/**
 * REST API 请求体接口
 * @description 定义 REST API 请求体的基础结构
 */
interface RestRequestBody {
  [key: string]: unknown;
}

/**
 * 验证规则接口
 * @description 定义验证规则的结构
 */
interface RestValidationRule {
  field: string;
  type: string;
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
}

/**
 * REST API 控制器
 * @description 处理所有REST API请求
 */
@Controller("api/v1/rest")
export class RestController {
  constructor(
    private readonly apiGatewayService: ApiGatewayService,
    private readonly authenticationService: AuthenticationService,
    private readonly authorizationService: AuthorizationService,
    private readonly logger: FastifyLoggerService,
    private readonly validationService: ValidationService,
    private readonly rateLimitService: RateLimitService,
    private readonly monitoringService: MonitoringService,
  ) {
    this.logger.log("REST Controller initialized");
  }

  /**
   * 处理 GET 请求
   * @description 处理所有 GET 请求
   * @param request 请求对象
   * @param reply 响应对象
   * @param path 路径参数
   */
  @Get("*")
  async handleGet(
    @Req() request: InterfaceFastifyRequest,
    @Res() reply: FastifyReply,
    @Param("*") path: string,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger.debug(`Handling GET request: ${request.url}`);

      // 1. 速率限制检查
      const rateLimitResult = await this.rateLimitService.checkRateLimit(
        request,
        path,
      );
      if (!rateLimitResult.allowed) {
        reply.status(HttpStatus.TOO_MANY_REQUESTS).send({
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: rateLimitResult.message || "Too many requests",
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // 2. 认证检查
      const token = this.authenticationService.extractTokenFromRequest(request);
      if (token) {
        try {
          const user = await this.authenticationService.verifyToken(token);
          request.user = user;
        } catch (_error) {
          reply.status(HttpStatus.UNAUTHORIZED).send({
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Invalid token",
              timestamp: new Date().toISOString(),
            },
          });
          return;
        }
      }

      // 3. 授权检查
      if (request.user) {
        const hasPermission =
          await this.authorizationService.checkRequestPermission(
            request,
            this.extractResourceFromPath(path),
            "read",
          );

        if (!hasPermission) {
          reply.status(HttpStatus.FORBIDDEN).send({
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Insufficient permissions",
              timestamp: new Date().toISOString(),
            },
          });
          return;
        }
      }

      // 4. 查询参数验证
      const queryValidation = await this.validationService.validateQueryParams(
        request,
        [
          { field: "page", type: "number", required: false, min: 1 },
          { field: "limit", type: "number", required: false, min: 1, max: 100 },
          { field: "sort", type: "string", required: false },
          {
            field: "order",
            type: "string",
            required: false,
            pattern: /^(asc|desc)$/i,
          },
        ],
      );

      if (!queryValidation.isValid) {
        reply.status(HttpStatus.BAD_REQUEST).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
            details: queryValidation.errors,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // 5. 处理请求
      const response = await this.apiGatewayService.handleHttpRequest(
        request,
        reply,
      );

      // 6. 记录指标
      const responseTime = Date.now() - startTime;
      this.monitoringService.recordRequestMetrics(
        request,
        responseTime,
        HttpStatus.OK,
      );

      // 7. 发送响应
      reply.status(HttpStatus.OK).send(response);
    } catch (_error) {
      this.logger.error(
        `GET request failed: ${_error instanceof Error ? _error.message : String(_error)}`,
        _error instanceof Error ? _error.stack : undefined,
      );

      const responseTime = Date.now() - startTime;
      this.monitoringService.recordRequestMetrics(
        request,
        responseTime,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      this.monitoringService.recordErrorMetrics(
        _error instanceof Error ? _error : new Error(String(_error)),
        { method: "GET", path },
      );

      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * 处理 POST 请求
   * @description 处理所有 POST 请求
   * @param request 请求对象
   * @param reply 响应对象
   * @param path 路径参数
   * @param body 请求体
   */
  @Post("*")
  async handlePost(
    @Req() request: InterfaceFastifyRequest,
    @Res() reply: FastifyReply,
    @Param("*") path: string,
    @Body() _body: RestRequestBody,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger.debug(`Handling POST request: ${request.url}`);

      // 1. 速率限制检查
      const rateLimitResult = await this.rateLimitService.checkRateLimit(
        request,
        path,
      );
      if (!rateLimitResult.allowed) {
        reply.status(HttpStatus.TOO_MANY_REQUESTS).send({
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: rateLimitResult.message || "Too many requests",
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // 2. 认证检查
      const token = this.authenticationService.extractTokenFromRequest(request);
      if (token) {
        try {
          const user = await this.authenticationService.verifyToken(token);
          request.user = user;
        } catch (_error) {
          reply.status(HttpStatus.UNAUTHORIZED).send({
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Invalid token",
              timestamp: new Date().toISOString(),
            },
          });
          return;
        }
      }

      // 3. 授权检查
      if (request.user) {
        const hasPermission =
          await this.authorizationService.checkRequestPermission(
            request,
            this.extractResourceFromPath(path),
            "create",
          );

        if (!hasPermission) {
          reply.status(HttpStatus.FORBIDDEN).send({
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Insufficient permissions",
              timestamp: new Date().toISOString(),
            },
          });
          return;
        }
      }

      // 4. 请求体验证
      const bodyValidation = await this.validationService.validateRequestBody(
        request,
        this.convertValidationRules(this.getValidationRulesForPath(path)),
      );

      if (!bodyValidation.isValid) {
        reply.status(HttpStatus.BAD_REQUEST).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: bodyValidation.errors,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // 5. 处理请求
      const response = await this.apiGatewayService.handleHttpRequest(
        request,
        reply,
      );

      // 6. 记录指标
      const responseTime = Date.now() - startTime;
      this.monitoringService.recordRequestMetrics(
        request,
        responseTime,
        HttpStatus.CREATED,
      );

      // 7. 发送响应
      reply.status(HttpStatus.CREATED).send(response);
    } catch (_error) {
      this.logger.error(
        `POST request failed: ${_error instanceof Error ? _error.message : String(_error)}`,
        _error instanceof Error ? _error.stack : undefined,
      );

      const responseTime = Date.now() - startTime;
      this.monitoringService.recordRequestMetrics(
        request,
        responseTime,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      this.monitoringService.recordErrorMetrics(
        _error instanceof Error ? _error : new Error(String(_error)),
        {
          method: "POST",
          path,
        },
      );

      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * 处理 PUT 请求
   * @description 处理所有 PUT 请求
   * @param request 请求对象
   * @param reply 响应对象
   * @param path 路径参数
   * @param body 请求体
   */
  @Put("*")
  async handlePut(
    @Req() request: InterfaceFastifyRequest,
    @Res() reply: FastifyReply,
    @Param("*") path: string,
    @Body() _body: RestRequestBody,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger.debug(`Handling PUT request: ${request.url}`);

      // 1. 速率限制检查
      const rateLimitResult = await this.rateLimitService.checkRateLimit(
        request,
        path,
      );
      if (!rateLimitResult.allowed) {
        reply.status(HttpStatus.TOO_MANY_REQUESTS).send({
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: rateLimitResult.message || "Too many requests",
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // 2. 认证检查
      const token = this.authenticationService.extractTokenFromRequest(request);
      if (!token) {
        reply.status(HttpStatus.UNAUTHORIZED).send({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      try {
        const user = await this.authenticationService.verifyToken(token);
        request.user = user;
      } catch (_error) {
        reply.status(HttpStatus.UNAUTHORIZED).send({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid token",
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // 3. 授权检查
      const hasPermission =
        await this.authorizationService.checkRequestPermission(
          request,
          this.extractResourceFromPath(path),
          "update",
        );

      if (!hasPermission) {
        reply.status(HttpStatus.FORBIDDEN).send({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Insufficient permissions",
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // 4. 请求体验证
      const bodyValidation = await this.validationService.validateRequestBody(
        request,
        this.convertValidationRules(this.getValidationRulesForPath(path)),
      );

      if (!bodyValidation.isValid) {
        reply.status(HttpStatus.BAD_REQUEST).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: bodyValidation.errors,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // 5. 处理请求
      const response = await this.apiGatewayService.handleHttpRequest(
        request,
        reply,
      );

      // 6. 记录指标
      const responseTime = Date.now() - startTime;
      this.monitoringService.recordRequestMetrics(
        request,
        responseTime,
        HttpStatus.OK,
      );

      // 7. 发送响应
      reply.status(HttpStatus.OK).send(response);
    } catch (_error) {
      this.logger.error(
        `PUT request failed: ${_error instanceof Error ? _error.message : String(_error)}`,
        _error instanceof Error ? _error.stack : undefined,
      );

      const responseTime = Date.now() - startTime;
      this.monitoringService.recordRequestMetrics(
        request,
        responseTime,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      this.monitoringService.recordErrorMetrics(
        _error instanceof Error ? _error : new Error(String(_error)),
        { method: "PUT", path },
      );

      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * 处理 DELETE 请求
   * @description 处理所有 DELETE 请求
   * @param request 请求对象
   * @param reply 响应对象
   * @param path 路径参数
   */
  @Delete("*")
  async handleDelete(
    @Req() request: InterfaceFastifyRequest,
    @Res() reply: FastifyReply,
    @Param("*") path: string,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger.debug(`Handling DELETE request: ${request.url}`);

      // 1. 速率限制检查
      const rateLimitResult = await this.rateLimitService.checkRateLimit(
        request,
        path,
      );
      if (!rateLimitResult.allowed) {
        reply.status(HttpStatus.TOO_MANY_REQUESTS).send({
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: rateLimitResult.message || "Too many requests",
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // 2. 认证检查
      const token = this.authenticationService.extractTokenFromRequest(request);
      if (!token) {
        reply.status(HttpStatus.UNAUTHORIZED).send({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      try {
        const user = await this.authenticationService.verifyToken(token);
        request.user = user;
      } catch (_error) {
        reply.status(HttpStatus.UNAUTHORIZED).send({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid token",
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // 3. 授权检查
      const hasPermission =
        await this.authorizationService.checkRequestPermission(
          request,
          this.extractResourceFromPath(path),
          "delete",
        );

      if (!hasPermission) {
        reply.status(HttpStatus.FORBIDDEN).send({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Insufficient permissions",
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // 4. 处理请求
      const response = await this.apiGatewayService.handleHttpRequest(
        request,
        reply,
      );

      // 5. 记录指标
      const responseTime = Date.now() - startTime;
      this.monitoringService.recordRequestMetrics(
        request,
        responseTime,
        HttpStatus.OK,
      );

      // 6. 发送响应
      reply.status(HttpStatus.OK).send(response);
    } catch (_error) {
      this.logger.error(
        `DELETE request failed: ${_error instanceof Error ? _error.message : String(_error)}`,
        _error instanceof Error ? _error.stack : undefined,
      );

      const responseTime = Date.now() - startTime;
      this.monitoringService.recordRequestMetrics(
        request,
        responseTime,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      this.monitoringService.recordErrorMetrics(
        _error instanceof Error ? _error : new Error(String(_error)),
        {
          method: "DELETE",
          path,
        },
      );

      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * 处理 PATCH 请求
   * @description 处理所有 PATCH 请求
   * @param request 请求对象
   * @param reply 响应对象
   * @param path 路径参数
   * @param body 请求体
   */
  @Patch("*")
  async handlePatch(
    @Req() request: InterfaceFastifyRequest,
    @Res() reply: FastifyReply,
    @Param("*") path: string,
    @Body() _body: RestRequestBody,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger.debug(`Handling PATCH request: ${request.url}`);

      // 1. 速率限制检查
      const rateLimitResult = await this.rateLimitService.checkRateLimit(
        request,
        path,
      );
      if (!rateLimitResult.allowed) {
        reply.status(HttpStatus.TOO_MANY_REQUESTS).send({
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: rateLimitResult.message || "Too many requests",
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // 2. 认证检查
      const token = this.authenticationService.extractTokenFromRequest(request);
      if (!token) {
        reply.status(HttpStatus.UNAUTHORIZED).send({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      try {
        const user = await this.authenticationService.verifyToken(token);
        request.user = user;
      } catch (_error) {
        reply.status(HttpStatus.UNAUTHORIZED).send({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid token",
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // 3. 授权检查
      const hasPermission =
        await this.authorizationService.checkRequestPermission(
          request,
          this.extractResourceFromPath(path),
          "update",
        );

      if (!hasPermission) {
        reply.status(HttpStatus.FORBIDDEN).send({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Insufficient permissions",
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // 4. 请求体验证
      const bodyValidation = await this.validationService.validateRequestBody(
        request,
        this.convertValidationRules(this.getValidationRulesForPath(path)),
      );

      if (!bodyValidation.isValid) {
        reply.status(HttpStatus.BAD_REQUEST).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: bodyValidation.errors,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // 5. 处理请求
      const response = await this.apiGatewayService.handleHttpRequest(
        request,
        reply,
      );

      // 6. 记录指标
      const responseTime = Date.now() - startTime;
      this.monitoringService.recordRequestMetrics(
        request,
        responseTime,
        HttpStatus.OK,
      );

      // 7. 发送响应
      reply.status(HttpStatus.OK).send(response);
    } catch (_error) {
      this.logger.error(
        `PATCH request failed: ${_error instanceof Error ? _error.message : String(_error)}`,
        _error instanceof Error ? _error.stack : undefined,
      );

      const responseTime = Date.now() - startTime;
      this.monitoringService.recordRequestMetrics(
        request,
        responseTime,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      this.monitoringService.recordErrorMetrics(
        _error instanceof Error ? _error : new Error(String(_error)),
        {
          method: "PATCH",
          path,
        },
      );

      reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * 从路径中提取资源名称
   * @description 从请求路径中提取资源名称
   * @param path 请求路径
   * @returns 资源名称
   */
  private extractResourceFromPath(path: string): string {
    const segments = path.split("/").filter((segment) => segment.length > 0);
    return segments[0] || "unknown";
  }

  /**
   * 获取路径的验证规则
   * @description 根据路径获取相应的验证规则
   * @param path 请求路径
   * @returns 验证规则列表
   */
  private getValidationRulesForPath(_path: string): RestValidationRule[] {
    // 根据路径返回相应的验证规则
    // 这里应该根据实际业务需求配置
    return [];
  }

  /**
   * 转换验证规则
   * @description 将 RestValidationRule 转换为 ValidationRule
   * @param rules REST 验证规则
   * @returns 标准验证规则
   */
  private convertValidationRules(
    rules: RestValidationRule[],
  ): ValidationRule[] {
    return rules.map((rule) => ({
      field: rule.field,
      type: rule.type,
      required: rule.required,
      min: rule.min,
      max: rule.max,
      pattern: rule.pattern ? new RegExp(rule.pattern) : undefined,
      message: undefined,
    }));
  }
}
