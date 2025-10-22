/**
 * @fileoverview 接口层核心模块
 * @description 接口层核心模块，提供统一的接口层功能
 */

import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

// 服务导入
import { ApiGatewayService } from "./services/api-gateway.service.js";
import { AuthenticationService } from "./services/authentication.service.js";
import { AuthorizationService } from "./services/authorization.service.js";
import { ValidationService } from "./services/validation.service.js";
import { RateLimitService } from "./services/rate-limit.service.js";
import { MonitoringService } from "./services/monitoring.service.js";
import { HealthCheckService } from "./services/health-check.service.js";

// 控制器导入
import { RestController } from "./controllers/rest.controller.js";
import { HealthController } from "./controllers/health.controller.js";
import { MetricsController } from "./controllers/metrics.controller.js";

// 认证策略导入
import { JwtAuthStrategy } from "./services/authentication.service.js";

/**
 * 接口层核心模块
 * @description 提供统一的接口层功能，包括API网关、认证授权、数据验证、速率限制和监控
 */
@Module({
  imports: [
    // JWT 模块配置
    JwtModule.register({
      secret: process.env.JWT_SECRET || "default-secret",
      signOptions: {
        expiresIn: "24h",
        issuer: process.env.JWT_ISSUER || "hl8-platform",
        audience: process.env.JWT_AUDIENCE || "hl8-users",
      },
    }),

    // Passport 模块
    PassportModule.register({ defaultStrategy: "jwt" }),
  ],

  providers: [
    // 核心服务
    ApiGatewayService,
    AuthenticationService,
    AuthorizationService,
    ValidationService,
    RateLimitService,
    MonitoringService,
    HealthCheckService,

    // 认证策略
    JwtAuthStrategy,
  ],

  controllers: [
    // REST API 控制器
    RestController,

    // 健康检查控制器
    HealthController,

    // 指标控制器
    MetricsController,
  ],

  exports: [
    // 导出核心服务供其他模块使用
    ApiGatewayService,
    AuthenticationService,
    AuthorizationService,
    ValidationService,
    RateLimitService,
    MonitoringService,
    HealthCheckService,

    // 导出 JWT 模块
    JwtModule,
  ],
})
export class InterfaceKernelModule {
  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly monitoringService: MonitoringService,
  ) {
    // 启动速率限制清理任务
    this.rateLimitService.startCleanupTask();

    // 启动监控服务
    // this.monitoringService.startMetricsCollection(); // 私有方法，暂时注释
  }
}
