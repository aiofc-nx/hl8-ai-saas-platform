import { GenericEntityId } from "@hl8/domain-kernel";

/**
 * 认证成功事件接口
 * @description 用户认证成功时发布的事件
 */
export interface AuthenticationSuccessEvent {
  eventId: string;
  occurredAt: Date;
  aggregateId: string;
  version: number;
  eventType: "AuthenticationSuccess";
  eventData: {
    userId: string;
    credentialId: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

/**
 * 创建认证成功事件
 * @param userId - 用户ID
 * @param credentialId - 凭证ID
 * @param ipAddress - IP地址
 * @param userAgent - 用户代理
 * @returns 认证成功事件
 */
export function createAuthenticationSuccessEvent(
  userId: string,
  credentialId: string,
  ipAddress?: string,
  userAgent?: string,
): AuthenticationSuccessEvent {
  return {
    eventId: GenericEntityId.generate().toString(),
    occurredAt: new Date(),
    aggregateId: userId,
    version: 1,
    eventType: "AuthenticationSuccess",
    eventData: {
      userId,
      credentialId,
      ipAddress,
      userAgent,
    },
  };
}
