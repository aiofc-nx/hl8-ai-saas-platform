/**
 * 隔离上下文实体
 * @description 封装多层级数据隔离的核心业务逻辑
 */
import { IsolationLevel } from "../enums/isolation-level.enum.js";
import { SharingLevel } from "../enums/sharing-level.enum.js";
import { IsolationValidationError } from "../errors/isolation-validation.error.js";
import type { DepartmentId } from "../value-objects/department-id.vo.js";
import type { OrganizationId } from "../value-objects/organization-id.vo.js";
import type { TenantId } from "../value-objects/tenant-id.vo.js";
import type { UserId } from "../value-objects/user-id.vo.js";

export class IsolationContext {
	private _level?: IsolationLevel;

	private constructor(
		public readonly tenantId?: TenantId,
		public readonly organizationId?: OrganizationId,
		public readonly departmentId?: DepartmentId,
		public readonly userId?: UserId,
	) {
		this.validate();
	}

	static platform(): IsolationContext {
		return new IsolationContext();
	}

	static tenant(tenantId: TenantId): IsolationContext {
		return new IsolationContext(tenantId);
	}

	static organization(
		tenantId: TenantId,
		organizationId: OrganizationId,
	): IsolationContext {
		return new IsolationContext(tenantId, organizationId);
	}

	static department(
		tenantId: TenantId,
		organizationId: OrganizationId,
		departmentId: DepartmentId,
	): IsolationContext {
		return new IsolationContext(tenantId, organizationId, departmentId);
	}

	static user(userId: UserId, tenantId?: TenantId): IsolationContext {
		return new IsolationContext(tenantId, undefined, undefined, userId);
	}

	private validate(): void {
		if (this.organizationId && !this.tenantId) {
			throw new IsolationValidationError(
				"组织级上下文必须包含租户 ID",
				"INVALID_ORGANIZATION_CONTEXT",
				{ organizationId: this.organizationId?.getValue() },
			);
		}

		if (this.departmentId && (!this.tenantId || !this.organizationId)) {
			throw new IsolationValidationError(
				"部门级上下文必须包含租户 ID 和组织 ID",
				"INVALID_DEPARTMENT_CONTEXT",
				{
					departmentId: this.departmentId?.getValue(),
					hasTenant: !!this.tenantId,
					hasOrganization: !!this.organizationId,
				},
			);
		}
	}

	getIsolationLevel(): IsolationLevel {
		if (this._level === undefined) {
			if (this.departmentId) {
				this._level = IsolationLevel.DEPARTMENT;
			} else if (this.organizationId) {
				this._level = IsolationLevel.ORGANIZATION;
			} else if (this.userId) {
				this._level = IsolationLevel.USER;
			} else if (this.tenantId) {
				this._level = IsolationLevel.TENANT;
			} else {
				this._level = IsolationLevel.PLATFORM;
			}
		}
		return this._level;
	}

	isEmpty(): boolean {
		return !this.tenantId && !this.organizationId && !this.departmentId && !this.userId;
	}

	isTenantLevel(): boolean { return this.getIsolationLevel() === IsolationLevel.TENANT; }
	isOrganizationLevel(): boolean { return this.getIsolationLevel() === IsolationLevel.ORGANIZATION; }
	isDepartmentLevel(): boolean { return this.getIsolationLevel() === IsolationLevel.DEPARTMENT; }
	isUserLevel(): boolean { return this.getIsolationLevel() === IsolationLevel.USER; }

	buildCacheKey(namespace: string, key: string): string {
		const parts: string[] = [];
		switch (this.getIsolationLevel()) {
			case IsolationLevel.PLATFORM:
				parts.push("platform", namespace, key);
				break;
			case IsolationLevel.TENANT:
				parts.push("tenant", this.tenantId!.getValue(), namespace, key);
				break;
			case IsolationLevel.ORGANIZATION:
				parts.push("tenant", this.tenantId!.getValue(), "org", this.organizationId!.getValue(), namespace, key);
				break;
			case IsolationLevel.DEPARTMENT:
				parts.push("tenant", this.tenantId!.getValue(), "org", this.organizationId!.getValue(), "dept", this.departmentId!.getValue(), namespace, key);
				break;
			case IsolationLevel.USER:
				if (this.tenantId) {
					parts.push("tenant", this.tenantId.getValue(), "user", this.userId!.getValue(), namespace, key);
				} else {
					parts.push("user", this.userId!.getValue(), namespace, key);
				}
				break;
		}
		return parts.join(":");
	}

	buildLogContext(): Record<string, string> {
		const log: Record<string, string> = {};
		if (this.tenantId) log.tenantId = this.tenantId.getValue();
		if (this.organizationId) log.organizationId = this.organizationId.getValue();
		if (this.departmentId) log.departmentId = this.departmentId.getValue();
		if (this.userId) log.userId = this.userId.getValue();
		return log;
	}

	buildWhereClause(): Record<string, string> {
		const where: Record<string, string> = {};
		if (this.tenantId) where.tenantId = this.tenantId.getValue();
		if (this.organizationId) where.organizationId = this.organizationId.getValue();
		if (this.departmentId) where.departmentId = this.departmentId.getValue();
		return where;
	}

	canAccess(dataContext: IsolationContext, isShared: boolean, sharingLevel?: SharingLevel): boolean {
		if (this.isEmpty()) return true;
		if (!isShared) return this.matches(dataContext);
		return this.canAccessSharedData(dataContext, sharingLevel);
	}

	private matches(other: IsolationContext): boolean {
		const tenantMatch = this.tenantId?.equals(other.tenantId) ?? !other.tenantId;
		const orgMatch = this.organizationId?.equals(other.organizationId) ?? !other.organizationId;
		const deptMatch = this.departmentId?.equals(other.departmentId) ?? !other.departmentId;
		const userMatch = this.userId?.equals(other.userId) ?? !other.userId;
		return tenantMatch && orgMatch && deptMatch && userMatch;
	}

	private canAccessSharedData(dataContext: IsolationContext, sharingLevel?: SharingLevel): boolean {
		if (!sharingLevel) return false;
		switch (sharingLevel) {
			case SharingLevel.PLATFORM: return true;
			case SharingLevel.TENANT: return this.tenantId?.equals(dataContext.tenantId) ?? false;
			case SharingLevel.ORGANIZATION:
				return ((this.tenantId?.equals(dataContext.tenantId) && this.organizationId?.equals(dataContext.organizationId)) ?? false);
			case SharingLevel.DEPARTMENT:
				return ((this.tenantId?.equals(dataContext.tenantId) && this.organizationId?.equals(dataContext.organizationId) && this.departmentId?.equals(dataContext.departmentId)) ?? false);
			case SharingLevel.USER: return this.userId?.equals(dataContext.userId) ?? false;
			default: return false;
		}
	}

	switchOrganization(newOrganizationId: OrganizationId): IsolationContext {
		if (!this.tenantId) {
			throw new IsolationValidationError(
				"切换组织需要租户上下文",
				"SWITCH_ORGANIZATION_REQUIRES_TENANT",
			);
		}
		return new IsolationContext(this.tenantId, newOrganizationId);
	}

	switchDepartment(newDepartmentId: DepartmentId): IsolationContext {
		if (!this.tenantId || !this.organizationId) {
			throw new IsolationValidationError(
				"切换部门需要租户和组织上下文",
				"SWITCH_DEPARTMENT_REQUIRES_TENANT_AND_ORG",
			);
		}
		return new IsolationContext(this.tenantId, this.organizationId, newDepartmentId);
	}
}
