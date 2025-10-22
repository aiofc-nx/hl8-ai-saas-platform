/**
 * 核心异常导出
 *
 * @description 导出所有核心异常类和相关类型
 *
 * @packageDocumentation
 */

// 抽象基类
export * from "./abstract-http.exception.js";

// 分层异常基类
export * from "./layers/index.js";

// 异常类别基类
export * from "./auth/auth.exception.js";
export * from "./user/user.exception.js";
export * from "./tenant/tenant.exception.js";
export * from "./validation/validation.exception.js";
export * from "./system/system.exception.js";
export * from "./organization/organization.exception.js";
export * from "./department/department.exception.js";
export * from "./business/business.exception.js";
export * from "./integration/integration.exception.js";
export * from "./general/general.exception.js";

// 标准异常类
export * from "./general-bad-request.exception.js";
export * from "./general-internal-server.exception.js";
export * from "./general-not-found.exception.js";

// 领域层异常导出
export * from "./domain/index.js";

// 异常类别导出
export * from "./auth/index.js";
export * from "./user/index.js";
export * from "./tenant/index.js";
export * from "./validation/index.js";
export * from "./system/index.js";
export * from "./organization/index.js";
export * from "./department/index.js";
export * from "./business/index.js";
export * from "./integration/index.js";
export * from "./general/index.js";
