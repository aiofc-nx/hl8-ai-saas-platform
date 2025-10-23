import { InterfaceLayerException } from "../layers/interface/interface-layer.exception.js";

/**
 * 通用异常基类
 *
 * @description 用于处理通用错误相关的异常
 * 所有通用异常都应继承此类
 */
export abstract class GeneralException extends InterfaceLayerException {
  /**
   * 创建通用异常
   *
   * @param errorCode - 错误代码，应以 GENERAL_ 开头
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
    return "general";
  }
}
