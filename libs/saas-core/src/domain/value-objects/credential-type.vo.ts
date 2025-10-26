/**
 * 凭证类型
 * @description 定义用户认证凭证的类型
 */
export enum CredentialType {
  /** 密码：用户名密码认证 */
  PASSWORD = "PASSWORD",

  /** 令牌：令牌认证 */
  TOKEN = "TOKEN",

  /** OAuth：OAuth认证 */
  OAUTH = "OAUTH",

  /** 证书：证书认证 */
  CERTIFICATE = "CERTIFICATE",
}
