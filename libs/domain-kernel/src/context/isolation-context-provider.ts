/**
 * 隔离上下文提供者
 * @description 提供隔离上下文的设置与获取能力
 */
import { IsolationContext } from "../isolation/isolation-context.js";
import { TenantId } from "../value-objects/tenant-id.vo.js";
import { OrganizationId } from "../value-objects/organization-id.vo.js";
import { DepartmentId } from "../value-objects/department-id.vo.js";
import { UserId } from "../value-objects/user-id.vo.js";

/**
 * 隔离上下文提供者接口
 */
export interface IsolationContextProvider {
  /**
   * 获取当前隔离上下文
   * @returns 隔离上下文
   */
  getContext(): IsolationContext | null;

  /**
   * 设置隔离上下文
   * @param context - 隔离上下文
   */
  setContext(context: IsolationContext): void;

  /**
   * 清除隔离上下文
   */
  clearContext(): void;
}

/**
 * 默认隔离上下文提供者实现
 */
export class DefaultIsolationContextProvider
  implements IsolationContextProvider
{
  private context: IsolationContext | null = null;

  getContext(): IsolationContext | null {
    return this.context;
  }

  setContext(context: IsolationContext): void {
    this.context = context;
  }

  clearContext(): void {
    this.context = null;
  }
}

/**
 * 全局隔离上下文提供者实例
 */
export const globalIsolationContextProvider =
  new DefaultIsolationContextProvider();

/**
 * 获取当前隔离上下文
 * @returns 隔离上下文或 null
 */
export function getCurrentIsolationContext(): IsolationContext | null {
  return globalIsolationContextProvider.getContext();
}

/**
 * 设置隔离上下文
 * @param context - 隔离上下文
 */
export function setCurrentIsolationContext(context: IsolationContext): void {
  globalIsolationContextProvider.setContext(context);
}

/**
 * 清除隔离上下文
 */
export function clearCurrentIsolationContext(): void {
  globalIsolationContextProvider.clearContext();
}
