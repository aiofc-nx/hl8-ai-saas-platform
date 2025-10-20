import { IsolationLevel } from "../enums/isolation-level.enum.js";
import { SharingLevel } from "../enums/sharing-level.enum.js";
import type { DepartmentId } from "../value-objects/department-id.vo.js";
import type { OrganizationId } from "../value-objects/organization-id.vo.js";
import type { TenantId } from "../value-objects/tenant-id.vo.js";
import type { UserId } from "../value-objects/user-id.vo.js";
export declare class IsolationContext {
    readonly tenantId?: TenantId;
    readonly organizationId?: OrganizationId;
    readonly departmentId?: DepartmentId;
    readonly userId?: UserId;
    private _level?;
    private constructor();
    static platform(): IsolationContext;
    static tenant(tenantId: TenantId): IsolationContext;
    static organization(tenantId: TenantId, organizationId: OrganizationId): IsolationContext;
    static department(tenantId: TenantId, organizationId: OrganizationId, departmentId: DepartmentId): IsolationContext;
    static user(userId: UserId, tenantId?: TenantId): IsolationContext;
    private validate;
    getIsolationLevel(): IsolationLevel;
    isPlatformLevel(): boolean;
    isTenantLevel(): boolean;
    isOrganizationLevel(): boolean;
    isDepartmentLevel(): boolean;
    isUserLevel(): boolean;
    isEmpty(): boolean;
    buildCacheKey(namespace: string, key: string): string;
    buildLogContext(): Record<string, string>;
    buildWhereClause(alias?: string): Record<string, any>;
    canAccess(targetContext: IsolationContext, sharingLevel: SharingLevel): boolean;
    private canShareWith;
    private compareIsolationLevels;
}
//# sourceMappingURL=isolation-context.entity.d.ts.map