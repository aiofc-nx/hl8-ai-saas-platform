import { DepartmentException } from "./department.exception.js";
export class UnauthorizedDepartmentException extends DepartmentException {
    constructor(userId, departmentId, data) {
        super("DEPARTMENT_UNAUTHORIZED", "未授权部门访问", `用户 "${userId}" 没有权限访问部门 "${departmentId}"`, 403, { userId, departmentId, ...data }, "https://docs.hl8.com/errors#DEPARTMENT_UNAUTHORIZED");
    }
}
//# sourceMappingURL=unauthorized-department.exception.js.map