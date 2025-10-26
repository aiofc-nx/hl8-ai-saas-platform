import {
  TenantId,
  GenericEntityId,
  BaseDomainService,
} from "@hl8/domain-kernel";
import { Credential } from "../aggregates/credential.aggregate.js";
import { CredentialType } from "../value-objects/credential-type.vo.js";
import { CredentialValidationBusinessRule } from "../rules/credential-validation.rule.js";
import { UserActiveSpecification } from "../specifications/user-active.specification.js";

/**
 * 认证领域服务接口
 * @description 提供用户认证的业务逻辑
 */
export interface IAuthenticationService {
  /**
   * 创建凭证
   */
  createCredential(
    tenantId: TenantId,
    userId: GenericEntityId,
    type: CredentialType,
    value: string,
    expiresAt?: Date,
  ): Promise<Credential>;

  /**
   * 验证凭证
   */
  verifyCredential(
    userId: GenericEntityId,
    credentialValue: string,
  ): Promise<boolean>;

  /**
   * 更新凭证
   */
  updateCredential(
    credentialId: GenericEntityId,
    newValue: string,
  ): Promise<void>;

  /**
   * 记录认证成功
   */
  recordAuthenticationSuccess(
    userId: GenericEntityId,
    credentialId: GenericEntityId,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void>;

  /**
   * 记录认证失败
   */
  recordAuthenticationFailed(
    userId: GenericEntityId,
    reason: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void>;
}

/**
 * 认证领域服务
 * @description 提供用户认证的业务逻辑
 *
 * @example
 * ```typescript
 * const authService = new AuthenticationService();
 *
 * const credential = await authService.createCredential(
 *   TenantId.create('tenant-123'),
 *   UserId.create('user-123'),
 *   CredentialType.PASSWORD,
 *   'hashedPassword'
 * );
 * ```
 */
export class AuthenticationService
  extends BaseDomainService
  implements IAuthenticationService
{
  public execute(_input: unknown): unknown {
    throw new Error(
      "AuthenticationService does not use execute method. Use specific methods instead.",
    );
  }

  public async createCredential(
    tenantId: TenantId,
    userId: GenericEntityId,
    type: CredentialType,
    value: string,
    expiresAt?: Date,
  ): Promise<Credential> {
    // 1. 业务规则验证（凭证验证规则）
    const rule = new CredentialValidationBusinessRule();
    const result = rule.validate({
      operation: "credential_creation",
      credentialData: {
        userId,
        type,
        value,
        expiresAt,
      },
    });

    if (!result.isValid) {
      const errorMessages = result.errors
        .map((e) => `${e.field}: ${e.message}`)
        .join("; ");
      throw new Error(`凭证创建验证失败: ${errorMessages}`);
    }

    // 2. TODO: 检查用户活跃状态
    // const user = await this.userRepository.findById(userId);
    // const activeSpec = new UserActiveSpecification();
    // if (!activeSpec.isSatisfiedBy(user)) {
    //   throw new Error("只有活跃用户才能创建凭证");
    // }

    // 3. 创建凭证
    const credential = Credential.create(
      tenantId,
      userId,
      type,
      value,
      expiresAt,
    );
    // TODO: 保存到仓储
    return credential;
  }

  public async verifyCredential(
    userId: GenericEntityId,
    credentialValue: string,
  ): Promise<boolean> {
    // TODO: 从仓储加载凭证
    // TODO: 验证凭证值
    return false;
  }

  public async updateCredential(
    credentialId: GenericEntityId,
    newValue: string,
  ): Promise<void> {
    // TODO: 从仓储加载凭证并验证更新
    // const credential = await this.credentialRepository.findById(credentialId);
    // const rule = new CredentialValidationBusinessRule();
    // const result = rule.validate({...});
    // credential.updateValue(newValue);
    // await this.credentialRepository.save(credential);
  }

  public async recordAuthenticationSuccess(
    userId: GenericEntityId,
    credentialId: GenericEntityId,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    // TODO: 发布认证成功事件
  }

  public async recordAuthenticationFailed(
    userId: GenericEntityId,
    reason: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    // TODO: 发布认证失败事件
  }
}
