/**
 * 隔离级别枚举
 * @description 定义 5 个数据隔离层级
 */
export enum IsolationLevel {
	PLATFORM = "platform",
	TENANT = "tenant",
	ORGANIZATION = "organization",
	DEPARTMENT = "department",
	USER = "user",
}
