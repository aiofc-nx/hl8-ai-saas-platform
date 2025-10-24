/**
 * 处理器导出入口
 *
 * @description 统一导出所有处理器
 * @since 1.0.0
 */

export { CreateTenantHandler } from "./create-tenant.handler.js";
export { GetTenantHandler } from "./get-tenant.handler.js";
export {
  ListTenantsHandler,
  type ListTenantsResult,
} from "./list-tenants.handler.js";
