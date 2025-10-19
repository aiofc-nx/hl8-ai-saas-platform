/**
 * 数据处理工具类定义
 *
 * @description 定义数据处理相关的工具函数
 * @since 1.0.0
 */

/**
 * 对象工具类
 */
export class ObjectUtils {
  /**
   * 深度克隆对象
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }

    if (obj instanceof Array) {
      return obj.map((item) => this.deepClone(item)) as unknown as T;
    }

    if (typeof obj === "object") {
      const cloned = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }

    return obj;
  }

  /**
   * 深度合并对象
   */
  static deepMerge<T extends Record<string, any>>(
    target: T,
    ...sources: Partial<T>[]
  ): T {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.deepMerge(target, ...sources);
  }

  /**
   * 检查是否为对象
   */
  private static isObject(item: any): boolean {
    return item && typeof item === "object" && !Array.isArray(item);
  }

  /**
   * 获取嵌套属性值
   */
  static getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  /**
   * 设置嵌套属性值
   */
  static setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split(".");
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!(key in current)) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  /**
   * 检查对象是否为空
   */
  static isEmpty(obj: any): boolean {
    if (obj == null) return true;
    if (Array.isArray(obj) || typeof obj === "string") return obj.length === 0;
    if (typeof obj === "object") return Object.keys(obj).length === 0;
    return false;
  }

  /**
   * 检查对象是否不为空
   */
  static isNotEmpty(obj: any): boolean {
    return !this.isEmpty(obj);
  }

  /**
   * 过滤对象属性
   */
  static pick<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[],
  ): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach((key) => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  }

  /**
   * 排除对象属性
   */
  static omit<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[],
  ): Omit<T, K> {
    const result = { ...obj };
    keys.forEach((key) => {
      delete result[key];
    });
    return result;
  }
}

/**
 * 数组工具类
 */
export class ArrayUtils {
  /**
   * 检查数组是否为空
   */
  static isEmpty<T>(arr: T[]): boolean {
    return !arr || arr.length === 0;
  }

  /**
   * 检查数组是否不为空
   */
  static isNotEmpty<T>(arr: T[]): boolean {
    return !this.isEmpty(arr);
  }

  /**
   * 去重
   */
  static unique<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
  }

  /**
   * 根据属性去重
   */
  static uniqueBy<T>(arr: T[], key: keyof T): T[] {
    const seen = new Set();
    return arr.filter((item) => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  /**
   * 分组
   */
  static groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
    return arr.reduce(
      (groups, item) => {
        const value = String(item[key]);
        if (!groups[value]) {
          groups[value] = [];
        }
        groups[value].push(item);
        return groups;
      },
      {} as Record<string, T[]>,
    );
  }

  /**
   * 排序
   */
  static sortBy<T>(arr: T[], key: keyof T, order: "asc" | "desc" = "asc"): T[] {
    return [...arr].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
  }

  /**
   * 分页
   */
  static paginate<T>(arr: T[], page: number, pageSize: number): T[] {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return arr.slice(start, end);
  }

  /**
   * 随机选择
   */
  static randomChoice<T>(arr: T[]): T | undefined {
    if (arr.length === 0) return undefined;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * 随机选择多个
   */
  static randomChoices<T>(arr: T[], count: number): T[] {
    if (count >= arr.length) {
      return [...arr];
    }
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, arr.length));
  }
}
