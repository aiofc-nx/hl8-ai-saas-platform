/**
 * @fileoverview API 网关服务
 * @description 提供统一的API网关功能，包括请求路由、负载均衡、协议转换等
 */

import { Injectable, Logger } from "@nestjs/common";
import { FastifyReply } from "fastify";
import {
  GeneralBadRequestException,
  GeneralInternalServerException,
  GeneralNotFoundException,
} from "@hl8/exceptions";
import type {
  ApiResponse,
  InterfaceFastifyRequest,
  IsolationContext,
  UserContext,
} from "../types/index.js";
import { IsolationLevel, SharingLevel } from "../types/index.js";

/**
 * GraphQL 请求接口
 * @description 定义 GraphQL 请求的结构
 */
interface GraphQLRequest {
  query: string;
  operationName?: string;
  variables?: Record<string, unknown>;
}

/**
 * GraphQL 响应接口
 * @description 定义 GraphQL 响应的结构
 */
interface GraphQLResponse {
  data?: unknown;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

/**
 * WebSocket 消息接口
 * @description 定义 WebSocket 消息的结构
 */
interface WebSocketMessage {
  event: string;
  data?: unknown;
  timestamp?: number;
}

/**
 * WebSocket 连接接口
 * @description 定义 WebSocket 连接的结构
 */
interface WebSocketConnection {
  id: string;
  emit: (event: string, data: unknown) => void;
  on: (event: string, callback: (data: unknown) => void) => void;
  user?: UserContext;
}

/**
 * API 网关服务
 * @description 处理所有进入接口层的请求，提供统一的路由和协议转换
 */
@Injectable()
export class ApiGatewayService {
  private readonly logger = new Logger(ApiGatewayService.name);

  constructor() {
    this.logger.log("API Gateway Service initialized");
  }

  /**
   * 处理 HTTP 请求
   * @description 统一处理所有 HTTP 请求，包括路由、认证、验证等
   * @param request Fastify 请求对象
   * @param reply Fastify 响应对象
   * @returns 处理后的响应
   */
  async handleHttpRequest(
    request: InterfaceFastifyRequest,
    reply: FastifyReply,
  ): Promise<ApiResponse> {
    try {
      this.logger.debug(
        `Processing HTTP request: ${request.method} ${request.url}`,
      );

      // 1. 提取隔离上下文
      const isolationContext = this.extractIsolationContext(request);

      // 2. 验证请求格式
      await this.validateRequest(request);

      // 3. 路由到相应的处理器
      const response = await this.routeRequest(
        request,
        reply,
        isolationContext,
      );

      // 4. 格式化响应
      return this.formatResponse(response, request);
    } catch (error) {
      this.logger.error(
        `Error processing HTTP request: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      // 使用标准化的异常处理
      if (
        error instanceof GeneralBadRequestException ||
        error instanceof GeneralInternalServerException ||
        error instanceof GeneralNotFoundException
      ) {
        throw error;
      }

      // 将未知错误转换为内部服务器异常
      throw new GeneralInternalServerException(
        "API网关处理错误",
        error instanceof Error ? error.message : String(error),
        { requestId: request.id, url: request.url },
      );
    }
  }

  /**
   * 处理 GraphQL 请求
   * @description 处理 GraphQL 查询和变更请求
   * @param request GraphQL 请求对象
   * @param context GraphQL 上下文
   * @returns GraphQL 响应
   */
  async handleGraphQLRequest(
    request: GraphQLRequest,
    context: IsolationContext,
  ): Promise<GraphQLResponse> {
    try {
      this.logger.debug(
        `Processing GraphQL request: ${request.operationName || "Anonymous"}`,
      );

      // 1. 验证 GraphQL 查询
      await this.validateGraphQLQuery(request);

      // 2. 提取用户上下文
      const userContext = this.extractUserContext(context);

      // 3. 执行 GraphQL 查询
      const result = await this.executeGraphQLQuery(
        request,
        context,
        userContext,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error processing GraphQL request: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      // 使用标准化的异常处理
      if (
        error instanceof GeneralBadRequestException ||
        error instanceof GeneralInternalServerException ||
        error instanceof GeneralNotFoundException
      ) {
        throw error;
      }

      // 将未知错误转换为内部服务器异常
      throw new GeneralInternalServerException(
        "GraphQL请求处理错误",
        error instanceof Error ? error.message : String(error),
        { operationName: request.operationName || "Anonymous" },
      );
    }
  }

  /**
   * 处理 WebSocket 连接
   * @description 处理 WebSocket 连接和消息
   * @param socket WebSocket 连接对象
   * @param data 消息数据
   */
  async handleWebSocketMessage(
    socket: WebSocketConnection,
    data: WebSocketMessage,
  ): Promise<void> {
    try {
      this.logger.debug(`Processing WebSocket message: ${data.event}`);

      // 1. 验证 WebSocket 消息
      await this.validateWebSocketMessage(data);

      // 2. 提取用户上下文
      const userContext = this.extractUserFromSocket(socket);

      // 3. 处理消息
      await this.processWebSocketMessage(socket, data, userContext);
    } catch (error) {
      this.logger.error(
        `Error processing WebSocket message: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      // 使用标准化的异常处理
      if (
        error instanceof GeneralBadRequestException ||
        error instanceof GeneralInternalServerException ||
        error instanceof GeneralNotFoundException
      ) {
        socket.emit("error", {
          type: error.type,
          title: error.title,
          detail: error.detail,
          status: error.httpStatus,
          errorCode: error.errorCode,
          data: error.data,
        });
        return;
      }

      // 将未知错误转换为内部服务器异常
      const wsError = new GeneralInternalServerException(
        "WebSocket消息处理错误",
        error instanceof Error ? error.message : String(error),
        { event: data.event },
      );

      socket.emit("error", {
        type: wsError.type,
        title: wsError.title,
        detail: wsError.detail,
        status: wsError.httpStatus,
        errorCode: wsError.errorCode,
        data: wsError.data,
      });
    }
  }

  /**
   * 提取隔离上下文
   * @description 从请求中提取租户、组织、部门等隔离信息
   * @param request 请求对象
   * @returns 隔离上下文
   */
  private extractIsolationContext(
    request: InterfaceFastifyRequest,
  ): IsolationContext {
    const headers = request.headers;

    return {
      tenantId: (headers["x-tenant-id"] as string) || "default",
      organizationId: headers["x-organization-id"] as string,
      departmentId: headers["x-department-id"] as string,
      userId: headers["x-user-id"] as string,
      isolationLevel: this.determineIsolationLevel(
        headers as Record<string, string>,
      ),
      sharingLevel: this.determineSharingLevel(
        headers as Record<string, string>,
      ),
    };
  }

  /**
   * 验证请求格式
   * @description 验证请求的基本格式和必需字段
   * @param request 请求对象
   */
  private async validateRequest(
    request: InterfaceFastifyRequest,
  ): Promise<void> {
    // 验证 HTTP 方法
    if (
      !["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(
        request.method,
      )
    ) {
      throw new GeneralInternalServerException(
        "不支持的HTTP方法",
        `HTTP方法 "${request.method}" 不被支持`,
        { method: request.method },
      );
    }

    // 验证 Content-Type
    if (request.method !== "GET" && request.method !== "DELETE") {
      const contentType = request.headers["content-type"];
      if (!contentType || !contentType.includes("application/json")) {
        throw new GeneralInternalServerException(
          "无效的内容类型",
          "Content-Type 必须是 application/json",
          { contentType: contentType || "undefined" },
        );
      }
    }

    // 验证请求大小
    const contentLength = parseInt(request.headers["content-length"] || "0");
    if (contentLength > 10 * 1024 * 1024) {
      // 10MB limit
      throw new GeneralInternalServerException(
        "请求过大",
        "请求大小超过10MB限制",
        { contentLength, maxSize: "10MB" },
      );
    }
  }

  /**
   * 路由请求到相应处理器
   * @description 根据请求路径和方法路由到相应的处理器
   * @param request 请求对象
   * @param reply 响应对象
   * @param isolationContext 隔离上下文
   * @returns 处理结果
   */
  private async routeRequest(
    request: InterfaceFastifyRequest,
    reply: FastifyReply,
    isolationContext: IsolationContext,
  ): Promise<unknown> {
    const url = request.url;
    const path = url.split("?")[0]; // 移除查询参数

    // 根据路径和方法路由
    if (path.startsWith("/api/v1/rest/")) {
      return this.routeRestRequest(request, reply, isolationContext);
    } else if (path.startsWith("/api/v1/graphql")) {
      return this.routeGraphQLRequest(request, reply, isolationContext);
    } else if (path.startsWith("/api/v1/websocket")) {
      return this.routeWebSocketRequest(request, reply, isolationContext);
    } else {
      throw new GeneralInternalServerException(
        "未知路由",
        `无法识别的路由: ${path}`,
        {
          path,
          supportedRoutes: [
            "/api/v1/rest/",
            "/api/v1/graphql",
            "/api/v1/websocket",
          ],
        },
      );
    }
  }

  /**
   * 路由 REST 请求
   * @description 路由 REST API 请求
   */
  private async routeRestRequest(
    request: InterfaceFastifyRequest,
    _reply: FastifyReply,
    _isolationContext: IsolationContext,
  ): Promise<ApiResponse> {
    // 这里应该路由到具体的 REST 控制器
    // 暂时返回模拟响应
    return {
      success: true,
      data: { message: "REST API response" },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: request.id,
        version: "1.0.0",
      },
    };
  }

  /**
   * 路由 GraphQL 请求
   * @description 路由 GraphQL 请求
   */
  private async routeGraphQLRequest(
    request: InterfaceFastifyRequest,
    _reply: FastifyReply,
    _isolationContext: IsolationContext,
  ): Promise<ApiResponse> {
    // 这里应该路由到 GraphQL 解析器
    // 暂时返回模拟响应
    return {
      success: true,
      data: { message: "GraphQL response" },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: request.id,
        version: "1.0.0",
      },
    };
  }

  /**
   * 路由 WebSocket 请求
   * @description 路由 WebSocket 请求
   */
  private async routeWebSocketRequest(
    request: InterfaceFastifyRequest,
    _reply: FastifyReply,
    _isolationContext: IsolationContext,
  ): Promise<ApiResponse> {
    // WebSocket 升级请求
    return {
      success: true,
      data: { message: "WebSocket upgrade" },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: request.id,
        version: "1.0.0",
      },
    };
  }

  /**
   * 格式化响应
   * @description 统一格式化 API 响应
   * @param data 响应数据
   * @param request 请求对象
   * @returns 格式化的响应
   */
  private formatResponse(
    data: unknown,
    request: InterfaceFastifyRequest,
  ): ApiResponse {
    return {
      success: true,
      data: (data as Record<string, unknown>).data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: request.id,
        version: "1.0.0",
        ...(((data as Record<string, unknown>).meta as Record<
          string,
          unknown
        >) || {}),
      },
    };
  }

  /**
   * 确定隔离级别
   * @description 根据请求头确定隔离级别
   * @param headers 请求头
   * @returns 隔离级别
   */
  private determineIsolationLevel(
    headers: Record<string, string>,
  ): IsolationLevel {
    if (headers["x-user-id"]) return IsolationLevel.USER;
    if (headers["x-department-id"]) return IsolationLevel.DEPARTMENT;
    if (headers["x-organization-id"]) return IsolationLevel.ORGANIZATION;
    if (headers["x-tenant-id"]) return IsolationLevel.TENANT;
    return IsolationLevel.PLATFORM;
  }

  /**
   * 确定共享级别
   * @description 根据请求头确定共享级别
   * @param headers 请求头
   * @returns 共享级别
   */
  private determineSharingLevel(headers: Record<string, string>): SharingLevel {
    const sharingLevel = headers["x-sharing-level"] as string;
    switch (sharingLevel) {
      case "department":
        return SharingLevel.DEPARTMENT;
      case "organization":
        return SharingLevel.ORGANIZATION;
      case "tenant":
        return SharingLevel.TENANT;
      case "platform":
        return SharingLevel.PLATFORM;
      default:
        return SharingLevel.PRIVATE;
    }
  }

  /**
   * 验证 GraphQL 查询
   * @description 验证 GraphQL 查询的格式和内容
   * @param request GraphQL 请求
   */
  private async validateGraphQLQuery(request: GraphQLRequest): Promise<void> {
    if (!request.query) {
      throw new GeneralInternalServerException(
        "缺少GraphQL查询",
        "GraphQL请求必须包含查询语句",
        { requestType: "GraphQL" },
      );
    }
  }

  /**
   * 提取用户上下文
   * @description 从 GraphQL 上下文中提取用户信息
   * @param context GraphQL 上下文
   * @returns 用户上下文
   */
  private extractUserContext(context: IsolationContext): UserContext | null {
    return (
      ((context as unknown as Record<string, unknown>).user as UserContext) ||
      null
    );
  }

  /**
   * 执行 GraphQL 查询
   * @description 执行 GraphQL 查询并返回结果
   * @param request GraphQL 请求
   * @param context GraphQL 上下文
   * @param userContext 用户上下文
   * @returns 查询结果
   */
  private async executeGraphQLQuery(
    _request: GraphQLRequest,
    _context: IsolationContext,
    _userContext: UserContext | null,
  ): Promise<ApiResponse> {
    // 这里应该执行实际的 GraphQL 查询
    return {
      success: true,
      data: { message: "GraphQL query executed" },
    };
  }

  /**
   * 验证 WebSocket 消息
   * @description 验证 WebSocket 消息的格式
   * @param data 消息数据
   */
  private async validateWebSocketMessage(
    data: WebSocketMessage,
  ): Promise<void> {
    if (!data.event) {
      throw new GeneralInternalServerException(
        "缺少WebSocket事件",
        "WebSocket消息必须包含事件类型",
        { messageType: "WebSocket" },
      );
    }
  }

  /**
   * 从 Socket 提取用户信息
   * @description 从 WebSocket 连接中提取用户信息
   * @param socket WebSocket 连接
   * @returns 用户上下文
   */
  private extractUserFromSocket(
    socket: WebSocketConnection,
  ): UserContext | null {
    return socket.user || null;
  }

  /**
   * 处理 WebSocket 消息
   * @description 处理 WebSocket 消息
   * @param socket WebSocket 连接
   * @param data 消息数据
   * @param userContext 用户上下文
   */
  private async processWebSocketMessage(
    socket: WebSocketConnection,
    data: WebSocketMessage,
    _userContext: UserContext | null,
  ): Promise<void> {
    // 处理未知事件
    if (data.event === "unknown") {
      throw new GeneralInternalServerException(
        "未知WebSocket事件",
        `不支持的事件类型: ${data.event}`,
        { event: data.event },
      );
    }

    // 这里应该处理具体的 WebSocket 消息
    socket.emit("response", { message: "WebSocket message processed" });
  }
}
