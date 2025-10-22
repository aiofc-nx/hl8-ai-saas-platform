import { InfrastructureLayerException } from "../layers/infrastructure/infrastructure-layer.exception.js";

/**
 * 系统资源异常基类
 *
 * @description 用于处理系统资源相关的异常
 * 所有系统资源相关的异常都应继承此类
 */
export abstract class SystemException extends InfrastructureLayerException {
  /**
   * 创建系统资源异常
   *
   * @param errorCode - 错误代码，应以 SYSTEM_ 开头
   * @param title - 错误标题
   * @param detail - 错误详情
   * @param status - HTTP状态码
   * @param data - 附加数据
   * @param type - 错误类型URI
   * @param rootCause - 根本原因
   */
  constructor(
    errorCode: string,
    title: string,
    detail: string,
    status: number,
    data?: Record<string, unknown>,
    type?: string,
    rootCause?: Error,
  ) {
    super(errorCode, title, detail, status, data, type, rootCause);
  }

  /**
   * 获取异常类别
   */
  getCategory(): string {
    return "system";
  }
}
