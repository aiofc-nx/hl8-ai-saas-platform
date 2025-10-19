/**
 * 安全工具类定义
 *
 * @description 定义安全相关的工具函数
 * @since 1.0.0
 */

/**
 * 加密工具类
 */
export class CryptoUtils {
  /**
   * 生成随机盐
   */
  static generateSalt(length: number = 16): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成随机密钥
   */
  static generateKey(length: number = 32): string {
    return this.generateSalt(length);
  }

  /**
   * 简单的哈希函数（仅用于演示，生产环境应使用更安全的哈希算法）
   */
  static simpleHash(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * 生成随机密码
   */
  static generatePassword(length: number = 12): string {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const allChars = lowercase + uppercase + numbers + symbols;

    let password = "";
    // 确保至少包含每种类型的字符
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // 填充剩余长度
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // 打乱字符顺序
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }

  /**
   * 生成API密钥
   */
  static generateApiKey(prefix: string = "api"): string {
    const randomPart = this.generateSalt(32);
    return `${prefix}_${randomPart}`;
  }

  /**
   * 生成访问令牌
   */
  static generateAccessToken(): string {
    return this.generateSalt(64);
  }

  /**
   * 生成刷新令牌
   */
  static generateRefreshToken(): string {
    return this.generateSalt(128);
  }

  /**
   * 生成会话ID
   */
  static generateSessionId(): string {
    return this.generateSalt(24);
  }

  /**
   * 生成CSRF令牌
   */
  static generateCsrfToken(): string {
    return this.generateSalt(32);
  }

  /**
   * 生成验证码
   */
  static generateVerificationCode(length: number = 6): string {
    const numbers = "0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      code += numbers[Math.floor(Math.random() * numbers.length)];
    }
    return code;
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

  /**
   * 生成短UUID
   */
  static generateShortUUID(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * 掩码敏感信息
   */
  static maskSensitiveInfo(str: string, visibleChars: number = 4): string {
    if (str.length <= visibleChars) {
      return "*".repeat(str.length);
    }
    const visible = str.substring(0, visibleChars);
    const masked = "*".repeat(str.length - visibleChars);
    return visible + masked;
  }

  /**
   * 掩码邮箱
   */
  static maskEmail(email: string): string {
    const [username, domain] = email.split("@");
    if (username.length <= 2) {
      return "*".repeat(username.length) + "@" + domain;
    }
    const visible = username.substring(0, 2);
    const masked = "*".repeat(username.length - 2);
    return visible + masked + "@" + domain;
  }

  /**
   * 掩码手机号
   */
  static maskPhone(phone: string): string {
    if (phone.length <= 4) {
      return "*".repeat(phone.length);
    }
    const visible = phone.substring(0, 3) + phone.substring(phone.length - 4);
    const masked = "*".repeat(phone.length - 7);
    return phone.substring(0, 3) + masked + phone.substring(phone.length - 4);
  }

  /**
   * 检查密码强度
   */
  static checkPasswordStrength(password: string): {
    score: number;
    level: "weak" | "medium" | "strong" | "very-strong";
    suggestions: string[];
  } {
    let score = 0;
    const suggestions: string[] = [];

    // 长度检查
    if (password.length >= 8) score += 1;
    else suggestions.push("密码长度至少8位");

    if (password.length >= 12) score += 1;

    // 字符类型检查
    if (/[a-z]/.test(password)) score += 1;
    else suggestions.push("包含小写字母");

    if (/[A-Z]/.test(password)) score += 1;
    else suggestions.push("包含大写字母");

    if (/\d/.test(password)) score += 1;
    else suggestions.push("包含数字");

    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 1;
    else suggestions.push("包含特殊字符");

    // 复杂度检查
    if (password.length >= 16) score += 1;
    if (
      /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?].*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(
        password,
      )
    )
      score += 1;

    let level: "weak" | "medium" | "strong" | "very-strong";
    if (score <= 2) level = "weak";
    else if (score <= 4) level = "medium";
    else if (score <= 6) level = "strong";
    else level = "very-strong";

    return { score, level, suggestions };
  }
}
