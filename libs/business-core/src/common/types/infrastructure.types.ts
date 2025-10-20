/**
 * 基础设施相关类型定义
 *
 * @description 定义基础设施相关的类型和接口
 * @since 1.0.0
 */

import { EntityId } from "@hl8/domain-kernel";

/**
 * 缓存接口
 */
export interface ICache {
  /**
   * 获取缓存值
   */
  get<T>(key: string): Promise<T | null>;
  /**
   * 设置缓存值
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  /**
   * 删除缓存值
   */
  delete(key: string): Promise<void>;
  /**
   * 清空所有缓存
   */
  clear(): Promise<void>;
  /**
   * 检查缓存是否存在
   */
  exists(key: string): Promise<boolean>;
  /**
   * 获取缓存过期时间
   */
  getTTL(key: string): Promise<number>;
  /**
   * 设置缓存过期时间
   */
  setTTL(key: string, ttl: number): Promise<void>;
  /**
   * 获取所有缓存键
   */
  keys(): Promise<string[]>;
  /**
   * 获取缓存大小
   */
  size(): Promise<number>;
}

/**
 * 消息队列接口
 */
export interface IMessageQueue {
  /**
   * 发送消息
   */
  sendMessage<T>(topic: string, message: T): Promise<void>;
  /**
   * 订阅消息
   */
  subscribe<T>(
    topic: string,
    handler: (message: T) => Promise<void>,
  ): Promise<void>;
  /**
   * 取消订阅
   */
  unsubscribe(topic: string): Promise<void>;
  /**
   * 发布消息
   */
  publish<T>(topic: string, message: T): Promise<void>;
  /**
   * 消费消息
   */
  consume<T>(
    topic: string,
    handler: (message: T) => Promise<void>,
  ): Promise<void>;
}

/**
 * 日志接口
 */
export interface ILogger {
  /**
   * 记录调试日志
   */
  debug(message: string, context?: Record<string, unknown>): void;
  /**
   * 记录信息日志
   */
  info(message: string, context?: Record<string, unknown>): void;
  /**
   * 记录警告日志
   */
  warn(message: string, context?: Record<string, unknown>): void;
  /**
   * 记录错误日志
   */
  error(
    message: string,
    error?: Error,
    context?: Record<string, unknown>,
  ): void;
  /**
   * 记录致命错误日志
   */
  fatal(
    message: string,
    error?: Error,
    context?: Record<string, unknown>,
  ): void;
}

/**
 * 配置接口
 */
export interface IConfig {
  /**
   * 获取配置值
   */
  get<T>(key: string): T | undefined;
  /**
   * 获取配置值，如果不存在则返回默认值
   */
  getOrDefault<T>(key: string, defaultValue: T): T;
  /**
   * 设置配置值
   */
  set<T>(key: string, value: T): void;
  /**
   * 检查配置是否存在
   */
  has(key: string): boolean;
  /**
   * 删除配置
   */
  delete(key: string): void;
}

/**
 * 安全上下文接口
 */
export interface ISecurityContext {
  /** 当前用户ID */
  userId?: EntityId;
  /** 当前租户ID */
  tenantId?: EntityId;
  /** 用户角色 */
  roles: string[];
  /** 用户权限 */
  permissions: string[];
  /** 会话ID */
  sessionId?: string;
  /** 客户端IP */
  clientIp?: string;
  /** 用户代理 */
  userAgent?: string;
}

/**
 * 权限检查接口
 */
export interface IPermissionChecker {
  /**
   * 检查权限
   */
  checkPermission(
    permission: string,
    context: ISecurityContext,
  ): Promise<boolean>;
  /**
   * 检查角色
   */
  checkRole(role: string, context: ISecurityContext): Promise<boolean>;
  /**
   * 检查资源权限
   */
  checkResourcePermission(
    resource: string,
    action: string,
    context: ISecurityContext,
  ): Promise<boolean>;
}
