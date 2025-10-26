/**
 * 用户类型
 * @description 用户的使用类型：个人用户、企业用户、社群用户、团队用户
 */
export enum UserType {
  /** 个人用户：独立的个人用户 */
  PERSONAL = "PERSONAL",

  /** 企业用户：企业内的用户 */
  ENTERPRISE = "ENTERPRISE",

  /** 社群用户：社群内的用户 */
  COMMUNITY = "COMMUNITY",

  /** 团队用户：团队内的用户 */
  TEAM = "TEAM",
}
