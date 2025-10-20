/**
 * 基础工具类定义
 *
 * @description 定义基础的工具函数
 * @since 1.0.0
 */

/**
 * 字符串工具类
 */
export class StringUtils {
  /**
   * 检查字符串是否为空
   */
  static isEmpty(str: string | null | undefined): boolean {
    return !str || str.trim().length === 0;
  }

  /**
   * 检查字符串是否不为空
   */
  static isNotEmpty(str: string | null | undefined): boolean {
    return !this.isEmpty(str);
  }

  /**
   * 截断字符串
   */
  static truncate(
    str: string,
    maxLength: number,
    suffix: string = "...",
  ): string {
    if (str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * 转换为驼峰命名
   */
  static toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * 转换为短横线命名
   */
  static toKebabCase(str: string): string {
    return str.replace(/([A-Z])/g, "-$1").toLowerCase();
  }

  /**
   * 转换为帕斯卡命名
   */
  static toPascalCase(str: string): string {
    return str.replace(/(?:^|-)([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * 转换为下划线命名
   */
  static toSnakeCase(str: string): string {
    return str.replace(/([A-Z])/g, "_$1").toLowerCase();
  }

  /**
   * 首字母大写
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * 首字母小写
   */
  static uncapitalize(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /**
   * 生成随机字符串
   */
  static generateRandom(length: number = 8): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成UUID
   */
  static generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

/**
 * 日期工具类
 */
export class DateUtils {
  /**
   * 格式化日期
   */
  static format(date: Date, format: string = "YYYY-MM-DD HH:mm:ss"): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return format
      .replace("YYYY", year.toString())
      .replace("MM", month)
      .replace("DD", day)
      .replace("HH", hours)
      .replace("mm", minutes)
      .replace("ss", seconds);
  }

  /**
   * 解析日期字符串
   */
  static parse(dateString: string): Date | null {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * 获取当前时间戳
   */
  static now(): number {
    return Date.now();
  }

  /**
   * 获取当前日期
   */
  static today(): Date {
    return new Date();
  }

  /**
   * 添加天数
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * 添加小时
   */
  static addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  /**
   * 添加分钟
   */
  static addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }

  /**
   * 计算两个日期之间的天数
   */
  static daysBetween(date1: Date, date2: Date): number {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  /**
   * 检查日期是否在范围内
   */
  static isInRange(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
  }
}
