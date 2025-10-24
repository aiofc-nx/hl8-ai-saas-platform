/**
 * 领域事件导出入口
 *
 * @description 统一导出所有领域事件
 * @since 1.0.0
 */

// 租户相关事件
export { TenantCreatedEvent } from "./tenant-created.event.js";
export { TenantActivatedEvent } from "./tenant-activated.event.js";
export { TenantStatusChangedEvent } from "./tenant-status-changed.event.js";
export { TenantDeletedEvent } from "./tenant-deleted.event.js";

// 权限相关事件
export { PermissionChangedEvent } from "./permission-changed.event.js";
