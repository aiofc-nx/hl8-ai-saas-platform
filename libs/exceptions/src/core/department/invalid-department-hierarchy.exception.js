import { DepartmentException } from "./department.exception.js";
export class InvalidDepartmentHierarchyException extends DepartmentException {
  constructor(reason, data) {
    super(
      "DEPARTMENT_INVALID_HIERARCHY",
      "无效的部门层级",
      reason,
      400,
      data,
      "https://docs.hl8.com/errors#DEPARTMENT_INVALID_HIERARCHY",
    );
  }
}
//# sourceMappingURL=invalid-department-hierarchy.exception.js.map
