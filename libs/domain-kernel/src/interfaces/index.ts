/**
 * 接口导出文件
 * @description 统一导出所有领域层接口
 *
 * @since 1.0.0
 */

// 基础实体接口
export type { IBaseEntity, IEntity } from "./base-entity.interface.js";

// 实体工厂接口
export type { IEntityFactory } from "./entity-factory.interface.js";

// 实体规格接口
export type { IEntitySpecification } from "./entity-specification.interface.js";

// 实体验证器接口
export type {
  IEntityValidator,
  IEntityValidationResult,
} from "./entity-validator.interface.js";

// 实体审计接口
export type { IEntityAuditInfo } from "./entity-audit.interface.js";

// 注意：隔离相关的接口已移动到 isolation 目录
