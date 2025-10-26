import {
  DomainEvent,
  GenericEntityId,
  UserId,
  OrganizationId,
  DepartmentId,
} from "@hl8/domain-kernel";

/**
 * 用户离开组织事件接口
 * @description 当用户离开组织时发布此事件
 */
export interface UserLeftOrganizationEvent extends DomainEvent {
  readonly eventType: "UserLeftOrganization";
  readonly eventData: {
    userId: string;
    organizationId: string;
    departmentId: string;
  };
}

/**
 * 创建用户离开组织事件
 * @description 创建用户离开组织领域事件
 *
 * @param userId - 用户ID
 * @param organizationId - 组织ID
 * @param departmentId - 部门ID
 * @param version - 聚合根版本
 * @returns 用户离开组织事件
 *
 * @example
 * ```typescript
 * const event = createUserLeftOrganizationEvent(
 *   UserId.create('user-123'),
 *   OrganizationId.create('org-456'),
 *   DepartmentId.create('dept-789'),
 *   4
 * );
 * ```
 */
export function createUserLeftOrganizationEvent(
  userId: UserId,
  organizationId: OrganizationId,
  departmentId: DepartmentId,
  version: number,
): UserLeftOrganizationEvent {
  return {
    eventId: GenericEntityId.generate(),
    occurredAt: new Date(),
    aggregateId: userId,
    version,
    eventType: "UserLeftOrganization",
    eventData: {
      userId: userId.toString(),
      organizationId: organizationId.toString(),
      departmentId: departmentId.toString(),
    },
  };
}
