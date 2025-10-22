/**
 * @fileoverview 接口层类型定义
 * @description 定义接口层使用的所有类型和接口
 */

import type { FastifyRequest, FastifyReply } from "fastify";
import type { ExecutionContext } from "@nestjs/common";
import type { GqlExecutionContext } from "@nestjs/graphql";
import type { Socket } from "socket.io";

/**
 * 扩展的 Fastify 请求接口
 */
export interface InterfaceFastifyRequest extends FastifyRequest {
  user?: UserContext;
  tenantId?: string;
  organizationId?: string;
  departmentId?: string;
  userId?: string;
  isolationContext?: IsolationContext;
}

/**
 * 扩展的 Fastify 响应接口
 */
export interface InterfaceFastifyReply extends FastifyReply {
  // 可以添加自定义响应方法
  [key: string]: any;
}

/**
 * 用户上下文接口
 */
export interface UserContext {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  tenantId: string;
  organizationId?: string;
  departmentId?: string;
  isolationLevel: IsolationLevel;
}

/**
 * 隔离上下文接口
 */
export interface IsolationContext {
  tenantId: string;
  organizationId?: string;
  departmentId?: string;
  userId?: string;
  isolationLevel: IsolationLevel;
  sharingLevel: SharingLevel;
}

/**
 * 隔离级别枚举
 */
export enum IsolationLevel {
  PLATFORM = "platform",
  TENANT = "tenant",
  ORGANIZATION = "organization",
  DEPARTMENT = "department",
  USER = "user",
}

/**
 * 共享级别枚举
 */
export enum SharingLevel {
  PRIVATE = "private",
  DEPARTMENT = "department",
  ORGANIZATION = "organization",
  TENANT = "tenant",
  PLATFORM = "platform",
}

/**
 * API 响应接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

/**
 * API 错误接口
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  path?: string;
}

/**
 * 响应元数据接口
 */
export interface ResponseMeta {
  timestamp: string;
  requestId: string;
  version: string;
  pagination?: PaginationMeta;
}

/**
 * 分页元数据接口
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 速率限制配置接口
 */
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: InterfaceFastifyRequest) => string;
}

/**
 * 认证策略接口
 */
export interface AuthStrategy {
  name: string;
  validate(payload: any): Promise<UserContext | null>;
}

/**
 * 授权规则接口
 */
export interface AuthorizationRule {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
  roles?: string[];
  permissions?: string[];
}

/**
 * 数据验证规则接口
 */
export interface ValidationRule {
  field: string;
  type: string;
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

/**
 * 监控指标接口
 */
export interface MetricData {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

/**
 * 健康检查结果接口
 */
export interface HealthCheckResult {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  uptime: number;
  version: string;
  services: ServiceHealth[];
}

/**
 * 服务健康状态接口
 */
export interface ServiceHealth {
  name: string;
  status: "healthy" | "unhealthy" | "degraded";
  responseTime?: number;
  lastCheck: string;
  details?: Record<string, any>;
}

/**
 * WebSocket 事件接口
 */
export interface WebSocketEvent {
  event: string;
  data: any;
  timestamp: string;
  userId?: string;
  tenantId?: string;
}

/**
 * GraphQL 上下文接口
 */
export interface GraphQLContext {
  req: InterfaceFastifyRequest;
  reply: InterfaceFastifyReply;
  user?: UserContext;
  isolationContext?: IsolationContext;
}

/**
 * 执行上下文类型
 */
export type InterfaceExecutionContext = ExecutionContext | GqlExecutionContext;

/**
 * WebSocket 连接接口
 */
export interface WebSocketConnection {
  socket: Socket;
  userId?: string;
  tenantId?: string;
  organizationId?: string;
  departmentId?: string;
  rooms: string[];
  connectedAt: Date;
  lastActivity: Date;
}

/**
 * 中间件配置接口
 */
export interface MiddlewareConfig {
  enabled: boolean;
  options?: Record<string, any>;
}

/**
 * 接口层配置接口
 */
export interface InterfaceKernelConfig {
  api: {
    prefix: string;
    version: string;
    cors: {
      origin: string | string[];
      credentials: boolean;
    };
  };
  auth: {
    jwt: {
      secret: string;
      expiresIn: string;
      issuer: string;
      audience: string;
    };
    strategies: string[];
  };
  rateLimit: {
    global: RateLimitConfig;
    endpoints: Record<string, RateLimitConfig>;
  };
  monitoring: {
    enabled: boolean;
    metrics: boolean;
    healthCheck: boolean;
    logging: boolean;
  };
  websocket: {
    enabled: boolean;
    cors: {
      origin: string | string[];
      credentials: boolean;
    };
    namespace: string;
  };
  graphql: {
    enabled: boolean;
    playground: boolean;
    introspection: boolean;
    path: string;
  };
}
