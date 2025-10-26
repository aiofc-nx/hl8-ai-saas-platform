// libs/saas-core/src/infrastructure/services/cqrs/index.ts
// CQRS 服务导出文件
// 基于 @hl8/infrastructure-kernel 的 CQRS 基础设施
export {
  CommandHandlerService,
  QueryHandlerService,
  EventHandlerService,
} from "@hl8/infrastructure-kernel";
export type { UseCaseExecutor } from "@hl8/infrastructure-kernel";
