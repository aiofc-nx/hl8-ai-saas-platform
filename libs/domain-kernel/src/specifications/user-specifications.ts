/**
 * 用户规格
 * @description 用户相关的业务规格实现
 *
 * @since 1.0.0
 */

import { BaseSpecification } from "./base-specification.js";

/**
 * 用户数据接口
 */
export interface UserData {
  id: string;
  email: string;
  username: string;
  status: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 用户激活规格
 * @description 检查用户是否处于激活状态
 */
export class UserActiveSpecification extends BaseSpecification<UserData> {
  constructor() {
    super({
      name: "UserActiveSpecification",
      description: "用户必须处于激活状态",
      category: "user",
      tags: ["user", "status", "active"],
      priority: 1,
    });
  }

  isSatisfiedBy(user: UserData): boolean {
    return user.status === 'ACTIVE' && !user.isDeleted;
  }

  protected getErrorMessage(user: UserData): string {
    return `用户 ${user.username} 未激活或已被删除`;
  }
}

/**
 * 用户邮箱格式规格
 * @description 检查用户邮箱格式是否正确
 */
export class UserEmailFormatSpecification extends BaseSpecification<UserData> {
  constructor() {
    super({
      name: "UserEmailFormatSpecification",
      description: "用户邮箱格式必须正确",
      category: "user",
      tags: ["user", "email", "format"],
      priority: 2,
    });
  }

  isSatisfiedBy(user: UserData): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(user.email);
  }

  protected getErrorMessage(user: UserData): string {
    return `用户邮箱 ${user.email} 格式不正确`;
  }
}

/**
 * 用户名格式规格
 * @description 检查用户名格式是否正确
 */
export class UsernameFormatSpecification extends BaseSpecification<UserData> {
  constructor() {
    super({
      name: "UsernameFormatSpecification",
      description: "用户名格式必须正确",
      category: "user",
      tags: ["user", "username", "format"],
      priority: 2,
    });
  }

  isSatisfiedBy(user: UserData): boolean {
    if (!user.username || user.username.length < 3 || user.username.length > 50) {
      return false;
    }
    
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    return usernameRegex.test(user.username) && !/^\d/.test(user.username);
  }

  protected getErrorMessage(user: UserData): string {
    return `用户名 ${user.username} 格式不正确`;
  }
}

/**
 * 用户生命周期规格
 * @description 检查用户生命周期是否合理
 */
export class UserLifecycleSpecification extends BaseSpecification<UserData> {
  constructor() {
    super({
      name: "UserLifecycleSpecification",
      description: "用户生命周期必须合理",
      category: "user",
      tags: ["user", "lifecycle", "time"],
      priority: 3,
    });
  }

  isSatisfiedBy(user: UserData): boolean {
    // 检查创建时间和更新时间
    if (user.updatedAt < user.createdAt) {
      return false;
    }

    // 检查时间是否在合理范围内
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    
    return user.createdAt >= oneYearAgo && user.createdAt <= now;
  }

  protected getErrorMessage(user: UserData): string {
    return `用户 ${user.username} 生命周期不合理`;
  }
}

/**
 * 有效用户规格
 * @description 组合规格：用户必须是激活的、邮箱格式正确的、用户名格式正确的
 */
export class ValidUserSpecification extends BaseSpecification<UserData> {
  private activeSpec: UserActiveSpecification;
  private emailSpec: UserEmailFormatSpecification;
  private usernameSpec: UsernameFormatSpecification;
  private lifecycleSpec: UserLifecycleSpecification;

  constructor() {
    super({
      name: "ValidUserSpecification",
      description: "用户必须是有效的（激活、邮箱格式正确、用户名格式正确、生命周期合理）",
      category: "user",
      tags: ["user", "valid", "composite"],
      priority: 1,
    });

    this.activeSpec = new UserActiveSpecification();
    this.emailSpec = new UserEmailFormatSpecification();
    this.usernameSpec = new UsernameFormatSpecification();
    this.lifecycleSpec = new UserLifecycleSpecification();
  }

  isSatisfiedBy(user: UserData): boolean {
    return (
      this.activeSpec.isSatisfiedBy(user) &&
      this.emailSpec.isSatisfiedBy(user) &&
      this.usernameSpec.isSatisfiedBy(user) &&
      this.lifecycleSpec.isSatisfiedBy(user)
    );
  }

  protected getErrorMessage(user: UserData): string {
    const errors: string[] = [];

    if (!this.activeSpec.isSatisfiedBy(user)) {
      errors.push(this.activeSpec.check(user).errorMessage || '用户激活检查失败');
    }
    if (!this.emailSpec.isSatisfiedBy(user)) {
      errors.push(this.emailSpec.check(user).errorMessage || '用户邮箱格式检查失败');
    }
    if (!this.usernameSpec.isSatisfiedBy(user)) {
      errors.push(this.usernameSpec.check(user).errorMessage || '用户名格式检查失败');
    }
    if (!this.lifecycleSpec.isSatisfiedBy(user)) {
      errors.push(this.lifecycleSpec.check(user).errorMessage || '用户生命周期检查失败');
    }

    return errors.join("; ");
  }
}
