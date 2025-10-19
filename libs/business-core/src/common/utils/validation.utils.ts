/**
 * 验证工具类定义
 *
 * @description 定义验证相关的工具函数
 * @since 1.0.0
 */

/**
 * 验证工具类
 */
export class ValidationUtils {
  /**
   * 验证邮箱格式
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证手机号格式
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  /**
   * 验证URL格式
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证身份证号格式
   */
  static isValidIdCard(idCard: string): boolean {
    const idCardRegex =
      /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    return idCardRegex.test(idCard);
  }

  /**
   * 验证密码强度
   */
  static isStrongPassword(password: string): boolean {
    // 至少8位，包含大小写字母、数字和特殊字符
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  /**
   * 验证用户名格式
   */
  static isValidUsername(username: string): boolean {
    // 3-20位字母、数字、下划线
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }

  /**
   * 验证IP地址格式
   */
  static isValidIP(ip: string): boolean {
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }

  /**
   * 验证IPv6地址格式
   */
  static isValidIPv6(ip: string): boolean {
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv6Regex.test(ip);
  }

  /**
   * 验证端口号
   */
  static isValidPort(port: number): boolean {
    return Number.isInteger(port) && port >= 1 && port <= 65535;
  }

  /**
   * 验证文件扩展名
   */
  static isValidFileExtension(
    filename: string,
    allowedExtensions: string[],
  ): boolean {
    const extension = filename.split(".").pop()?.toLowerCase();
    return extension ? allowedExtensions.includes(extension) : false;
  }

  /**
   * 验证文件大小
   */
  static isValidFileSize(size: number, maxSize: number): boolean {
    return size <= maxSize;
  }

  /**
   * 验证JSON格式
   */
  static isValidJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证数字范围
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * 验证字符串长度
   */
  static isValidLength(
    str: string,
    minLength: number,
    maxLength: number,
  ): boolean {
    return str.length >= minLength && str.length <= maxLength;
  }

  /**
   * 验证是否为正整数
   */
  static isPositiveInteger(value: number): boolean {
    return Number.isInteger(value) && value > 0;
  }

  /**
   * 验证是否为非负整数
   */
  static isNonNegativeInteger(value: number): boolean {
    return Number.isInteger(value) && value >= 0;
  }

  /**
   * 验证是否为有效日期
   */
  static isValidDate(date: string | Date): boolean {
    const d = typeof date === "string" ? new Date(date) : date;
    return d instanceof Date && !isNaN(d.getTime());
  }

  /**
   * 验证是否为有效时间戳
   */
  static isValidTimestamp(timestamp: number): boolean {
    return (
      Number.isInteger(timestamp) && timestamp > 0 && timestamp < 2147483648000
    ); // 2038年之前
  }

  /**
   * 验证颜色代码格式
   */
  static isValidColorCode(color: string): boolean {
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return colorRegex.test(color);
  }

  /**
   * 验证中文姓名格式
   */
  static isValidChineseName(name: string): boolean {
    const chineseNameRegex = /^[\u4e00-\u9fa5]{2,4}$/;
    return chineseNameRegex.test(name);
  }

  /**
   * 验证银行卡号格式
   */
  static isValidBankCard(cardNumber: string): boolean {
    // 简单的银行卡号验证（16-19位数字）
    const bankCardRegex = /^\d{16,19}$/;
    return bankCardRegex.test(cardNumber);
  }
}
