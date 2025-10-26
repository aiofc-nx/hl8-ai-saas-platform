// libs/saas-core/src/infrastructure/audit/audit.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { FastifyLoggerService } from "@hl8/nestjs-fastify";
import auditConfig from "./audit.config";
import { AuditLoggerService } from "./audit-logger.service";

/**
 * 审计日志模块
 *
 * 提供审计日志功能，支持多租户数据隔离
 * 基于@hl8内核组件实现完整的审计跟踪能力
 */
@Module({
  imports: [ConfigModule.forFeature(auditConfig)],
  providers: [
    {
      provide: AuditLoggerService,
      useFactory: (
        logger: FastifyLoggerService,
        config: typeof auditConfig,
      ) => {
        return new AuditLoggerService(logger, config);
      },
      inject: [FastifyLoggerService, auditConfig.KEY],
    },
  ],
  exports: [AuditLoggerService],
})
export class AuditModule {}
