/**
 * 系统资源异常导出
 *
 * @description 导出所有系统资源相关的异常类
 */

// 异常基类
export { SystemException } from "./system.exception.js";

// 系统异常
export { RateLimitExceededException } from "./rate-limit-exceeded.exception.js";
export { ServiceUnavailableException } from "./service-unavailable.exception.js";
export { ResourceNotFoundException } from "./resource-not-found.exception.js";
