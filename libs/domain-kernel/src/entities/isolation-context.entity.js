import { IsolationLevel } from "../enums/isolation-level.enum.js";
import { SharingLevel } from "../enums/sharing-level.enum.js";
import { IsolationValidationError } from "../errors/isolation-validation.error.js";
export class IsolationContext {
    tenantId;
    organizationId;
    departmentId;
    userId;
    _level;
    constructor(tenantId, organizationId, departmentId, userId) {
        this.tenantId = tenantId;
        this.organizationId = organizationId;
        this.departmentId = departmentId;
        this.userId = userId;
        this.validate();
    }
    static platform() {
        return new IsolationContext();
    }
    static tenant(tenantId) {
        return new IsolationContext(tenantId);
    }
    static organization(tenantId, organizationId) {
        return new IsolationContext(tenantId, organizationId);
    }
    static department(tenantId, organizationId, departmentId) {
        return new IsolationContext(tenantId, organizationId, departmentId);
    }
    static user(userId, tenantId) {
        return new IsolationContext(tenantId, undefined, undefined, userId);
    }
    validate() {
        if (this.organizationId && !this.tenantId) {
            throw new IsolationValidationError("组织级上下文必须包含租户 ID", "INVALID_ORGANIZATION_CONTEXT", { organizationId: this.organizationId.getValue() });
        }
        if (this.departmentId && !this.organizationId) {
            throw new IsolationValidationError("部门级上下文必须包含组织 ID", "INVALID_DEPARTMENT_CONTEXT", { departmentId: this.departmentId.getValue() });
        }
        if (this.userId && !this.tenantId) {
            throw new IsolationValidationError("用户级上下文必须包含租户 ID", "INVALID_USER_CONTEXT", { userId: this.userId.getValue() });
        }
    }
    getIsolationLevel() {
        if (this._level === undefined) {
            if (this.departmentId) {
                this._level = IsolationLevel.DEPARTMENT;
            }
            else if (this.organizationId) {
                this._level = IsolationLevel.ORGANIZATION;
            }
            else if (this.userId) {
                this._level = IsolationLevel.USER;
            }
            else if (this.tenantId) {
                this._level = IsolationLevel.TENANT;
            }
            else {
                this._level = IsolationLevel.PLATFORM;
            }
        }
        return this._level;
    }
    isPlatformLevel() {
        return this.getIsolationLevel() === IsolationLevel.PLATFORM;
    }
    isTenantLevel() {
        return this.getIsolationLevel() === IsolationLevel.TENANT;
    }
    isOrganizationLevel() {
        return this.getIsolationLevel() === IsolationLevel.ORGANIZATION;
    }
    isDepartmentLevel() {
        return this.getIsolationLevel() === IsolationLevel.DEPARTMENT;
    }
    isUserLevel() {
        return this.getIsolationLevel() === IsolationLevel.USER;
    }
    isEmpty() {
        return (!this.tenantId &&
            !this.organizationId &&
            !this.departmentId &&
            !this.userId);
    }
    buildCacheKey(namespace, key) {
        const parts = ["cache"];
        switch (this.getIsolationLevel()) {
            case IsolationLevel.USER:
                parts.push("tenant", this.tenantId.getValue(), "user", this.userId.getValue(), namespace, key);
                break;
            case IsolationLevel.DEPARTMENT:
                parts.push("tenant", this.tenantId.getValue(), "org", this.organizationId.getValue(), "dept", this.departmentId.getValue(), namespace, key);
                break;
            case IsolationLevel.ORGANIZATION:
                parts.push("tenant", this.tenantId.getValue(), "org", this.organizationId.getValue(), namespace, key);
                break;
            case IsolationLevel.TENANT:
                parts.push("tenant", this.tenantId.getValue(), namespace, key);
                break;
            case IsolationLevel.PLATFORM:
                parts.push("platform", namespace, key);
                break;
        }
        return parts.join(":");
    }
    buildLogContext() {
        const context = {
            isolationLevel: this.getIsolationLevel(),
        };
        if (this.tenantId)
            context.tenantId = this.tenantId.getValue();
        if (this.organizationId)
            context.organizationId = this.organizationId.getValue();
        if (this.departmentId)
            context.departmentId = this.departmentId.getValue();
        if (this.userId)
            context.userId = this.userId.getValue();
        return context;
    }
    buildWhereClause(alias = "") {
        const prefix = alias ? `${alias}.` : "";
        const clause = {};
        switch (this.getIsolationLevel()) {
            case IsolationLevel.USER:
                clause[`${prefix}userId`] = this.userId.getValue();
            case IsolationLevel.DEPARTMENT:
                clause[`${prefix}departmentId`] = this.departmentId.getValue();
            case IsolationLevel.ORGANIZATION:
                clause[`${prefix}organizationId`] = this.organizationId.getValue();
            case IsolationLevel.TENANT:
                clause[`${prefix}tenantId`] = this.tenantId.getValue();
                break;
            case IsolationLevel.PLATFORM:
                break;
        }
        return clause;
    }
    canAccess(targetContext, sharingLevel) {
        if (this.isPlatformLevel()) {
            return true;
        }
        return this.canShareWith(targetContext, sharingLevel);
    }
    canShareWith(targetContext, sharingLevel) {
        if (sharingLevel === SharingLevel.PLATFORM) {
            return true;
        }
        if (sharingLevel === SharingLevel.TENANT) {
            return (this.compareIsolationLevels(targetContext.getIsolationLevel(), IsolationLevel.TENANT) >= 0 && this.tenantId?.equals(targetContext.tenantId));
        }
        if (sharingLevel === SharingLevel.ORGANIZATION) {
            return (this.compareIsolationLevels(targetContext.getIsolationLevel(), IsolationLevel.ORGANIZATION) >= 0 && this.organizationId?.equals(targetContext.organizationId));
        }
        if (sharingLevel === SharingLevel.DEPARTMENT) {
            return (this.compareIsolationLevels(targetContext.getIsolationLevel(), IsolationLevel.DEPARTMENT) >= 0 && this.departmentId?.equals(targetContext.departmentId));
        }
        if (sharingLevel === SharingLevel.USER) {
            return (targetContext.getIsolationLevel() === IsolationLevel.USER &&
                this.userId?.equals(targetContext.userId));
        }
        return false;
    }
    compareIsolationLevels(level1, level2) {
        const levels = [
            IsolationLevel.PLATFORM,
            IsolationLevel.TENANT,
            IsolationLevel.ORGANIZATION,
            IsolationLevel.DEPARTMENT,
            IsolationLevel.USER,
        ];
        const index1 = levels.indexOf(level1);
        const index2 = levels.indexOf(level2);
        return index1 - index2;
    }
}
//# sourceMappingURL=isolation-context.entity.js.map