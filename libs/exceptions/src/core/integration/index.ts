/**
 * 集成异常导出
 *
 * @description 导出所有集成相关的异常类
 */

// 异常基类
export { IntegrationException } from "./integration.exception.js";

// 集成异常
export { ExternalServiceUnavailableException } from "./external-service-unavailable.exception.js";
export { ExternalServiceErrorException } from "./external-service-error.exception.js";
export { ExternalServiceTimeoutException } from "./external-service-timeout.exception.js";
