/**
 * @hl8/interface-kernel 基础设置
 * 配置接口内核组件
 */

import {
  RestController,
  AuthenticationGuard,
  AuthorizationGuard,
} from "@hl8/interface-kernel";

/**
 * 接口内核组件配置
 */
export class InterfaceKernelSetup {
  /**
   * 配置REST控制器
   */
  static configureRestController(): void {
    // 控制器超时配置
    process.env.CONTROLLER_TIMEOUT = "30000"; // 30秒超时

    // 请求大小限制
    process.env.REQUEST_SIZE_LIMIT = "10mb";

    // 响应压缩
    process.env.RESPONSE_COMPRESSION = "true";
  }

  /**
   * 配置认证守卫
   */
  static configureAuthenticationGuard(): void {
    // JWT配置
    process.env.JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    process.env.JWT_EXPIRES_IN = "24h";
    process.env.JWT_REFRESH_EXPIRES_IN = "7d";

    // 认证超时
    process.env.AUTH_TIMEOUT = "5000"; // 5秒超时
    process.env.AUTH_RETRY_ATTEMPTS = "3";
  }

  /**
   * 配置授权守卫
   */
  static configureAuthorizationGuard(): void {
    // 权限检查超时
    process.env.AUTHORIZATION_TIMEOUT = "3000"; // 3秒超时

    // 权限缓存
    process.env.PERMISSION_CACHE_TTL = "300"; // 5分钟缓存

    // 权限检查重试
    process.env.PERMISSION_CHECK_RETRY_ATTEMPTS = "2";
  }

  /**
   * 配置API版本控制
   */
  static configureApiVersioning(): void {
    // API版本配置
    process.env.API_VERSION = "v1";
    process.env.API_VERSION_HEADER = "X-API-Version";

    // 版本兼容性
    process.env.API_VERSION_COMPATIBILITY = "backward";
  }

  /**
   * 配置跨域设置
   */
  static configureCORS(): void {
    // CORS配置
    process.env.CORS_ORIGIN = "*";
    process.env.CORS_METHODS = "GET,POST,PUT,DELETE,PATCH,OPTIONS";
    process.env.CORS_HEADERS = "Content-Type,Authorization,X-API-Version";
  }

  /**
   * 初始化接口内核
   */
  static initialize(): void {
    this.configureRestController();
    this.configureAuthenticationGuard();
    this.configureAuthorizationGuard();
    this.configureApiVersioning();
    this.configureCORS();
  }
}
