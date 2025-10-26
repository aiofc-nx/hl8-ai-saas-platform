/**
 * 用户来源
 * @description 用户的来源类型：平台用户、租户用户、系统用户
 */
export enum UserSource {
  /** 平台用户：平台级别的用户 */
  PLATFORM = "PLATFORM",

  /** 租户用户：租户级别的用户 */
  TENANT = "TENANT",

  /** 系统用户：系统级别的用户 */
  SYSTEM = "SYSTEM",
}
