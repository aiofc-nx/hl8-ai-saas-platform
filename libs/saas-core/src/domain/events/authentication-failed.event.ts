import { GenericEntityId } from "@hl8/domain-kernel";

/**
 * 认证失败事件接口
 * @description 用户认证失败时发布的事件
 */
export interface AuthenticationFailedEvent {
  eventId: string;
  occurredAt: Date;
  aggregateId: string;
  version: number;
  eventType: "AuthenticationFailed";
  eventData: {
    userId: string;
    credentialId?: string;
    reason: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

/**
 * 创建认证失败事件
 * @param userId - 用户ID
 * @param reason - 失败原因
 * @param credentialId - 凭证ID（可选）
 * @param ipAddress - IP地址
 * @param userAgent - 用户代理
 * @returns 认证失败事件
 */
export function createAuthenticationFailedEvent(
  userId: string,
  reason: string,
  credentialId?: string,
  ipAddress?: string,
  userAgent?: string,
): AuthenticationFailedEvent {
  return {
    eventId: GenericEntityId.generate().toString(),
    occurredAt: new Date(),
    aggregateId: userId,
    version: 1,
    eventType: "AuthenticationFailed",
    eventData: {
      userId,
      credentialId,
      reason,
      ipAddress,
      userAgent,
    },
  };
}
