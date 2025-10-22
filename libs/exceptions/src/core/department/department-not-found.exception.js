import { DepartmentException } from "./department.exception.js";
export class DepartmentNotFoundException extends DepartmentException {
    constructor(departmentId, data) {
        super("DEPARTMENT_NOT_FOUND", "部门未找到", `ID 为 "${departmentId}" 的部门不存在`, 404, { departmentId, ...data }, "https://docs.hl8.com/errors#DEPARTMENT_NOT_FOUND");
    }
}
//# sourceMappingURL=department-not-found.exception.js.map