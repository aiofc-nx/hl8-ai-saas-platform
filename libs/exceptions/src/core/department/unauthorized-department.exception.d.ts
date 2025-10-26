import { DepartmentException } from "./department.exception.js";
export declare class UnauthorizedDepartmentException extends DepartmentException {
  constructor(
    userId: string,
    departmentId: string,
    data?: Record<string, unknown>,
  );
}
//# sourceMappingURL=unauthorized-department.exception.d.ts.map
