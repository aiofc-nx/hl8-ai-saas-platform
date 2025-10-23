/**
 * 认证授权异常导出
 *
 * @description 导出所有认证授权相关的异常类
 */

// 异常基类
export { AuthException } from "./auth.exception.js";

// 认证异常
export { AuthenticationFailedException } from "./authentication-failed.exception.js";
export { UnauthorizedException } from "./unauthorized.exception.js";
export { TokenExpiredException } from "./token-expired.exception.js";
export { InvalidTokenException } from "./invalid-token.exception.js";
export { InsufficientPermissionsException } from "./insufficient-permissions.exception.js";
