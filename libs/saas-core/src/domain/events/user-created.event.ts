import {
  DomainEvent,
  GenericEntityId,
  UserId,
  TenantId,
} from "@hl8/domain-kernel";
import { UserSource } from "../value-objects/user-source.vo.js";
import { UserType } from "../value-objects/user-type.vo.js";
import { UserRole } from "../value-objects/user-role.vo.js";
import { UserStatus } from "../value-objects/user-status.vo.js";

/**
 * 用户创建事件接口
 * @description 当用户被创建时发布此事件
 */
export interface UserCreatedEvent extends DomainEvent {
  readonly eventType: "UserCreated";
  readonly eventData: {
    userId: string;
    tenantId: string;
    email: string;
    username: string;
    source: UserSource;
    type: UserType;
    role: UserRole;
    status: UserStatus;
  };
}

/**
 * 创建用户创建事件
 * @description 创建用户创建领域事件
 *
 * @param userId - 用户ID
 * @param tenantId - 租户ID
 * @param email - 邮箱
 * @param username - 用户名
 * @param source - 用户来源
 * @param type - 用户类型
 * @param role - 用户角色
 * @param status - 用户状态
 * @returns 用户创建事件
 *
 * @example
 * ```typescript
 * const event = createUserCreatedEvent(
 *   UserId.create('user-123'),
 *   TenantId.create('tenant-456'),
 *   'user@example.com',
 *   'username',
 *   UserSource.PLATFORM,
 *   UserType.ENTERPRISE,
 *   UserRole.USER,
 *   UserStatus.PENDING
 * );
 * ```
 */
export function createUserCreatedEvent(
  userId: UserId,
  tenantId: TenantId,
  email: string,
  username: string,
  source: UserSource,
  type: UserType,
  role: UserRole,
  status: UserStatus,
): UserCreatedEvent {
  return {
    eventId: GenericEntityId.generate(),
    occurredAt: new Date(),
    aggregateId: userId,
    version: 1,
    eventType: "UserCreated",
    eventData: {
      userId: userId.toString(),
      tenantId: tenantId.toString(),
      email,
      username,
      source,
      type,
      role,
      status,
    },
  };
}
