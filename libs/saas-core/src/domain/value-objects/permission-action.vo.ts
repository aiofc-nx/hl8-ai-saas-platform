/**
 * 权限操作类型
 * @description 定义用户可以执行的操作类型
 */
export enum PermissionAction {
  /** 创建：创建新资源 */
  CREATE = "CREATE",

  /** 读取：查看资源 */
  READ = "READ",

  /** 更新：修改资源 */
  UPDATE = "UPDATE",

  /** 删除：删除资源 */
  DELETE = "DELETE",

  /** 执行：执行特定操作 */
  EXECUTE = "EXECUTE",

  /** 管理：管理资源 */
  MANAGE = "MANAGE",
}
