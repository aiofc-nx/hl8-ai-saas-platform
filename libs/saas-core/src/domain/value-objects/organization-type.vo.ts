/**
 * 组织类型
 * @description 支持4种组织类型：委员会、项目团队、质量控制小组、绩效管理小组。组织用于租户内的横向管理单位。
 */
export enum OrganizationType {
  /** 专业委员会：负责特定领域的决策和管理 */
  COMMITTEE = "COMMITTEE",

  /** 项目团队：负责特定项目的执行和管理 */
  PROJECT_TEAM = "PROJECT_TEAM",

  /** 质量控制小组：负责质量管理和监控 */
  QUALITY_GROUP = "QUALITY_GROUP",

  /** 绩效管理小组：负责绩效评估和管理 */
  PERFORMANCE_GROUP = "PERFORMANCE_GROUP",
}
