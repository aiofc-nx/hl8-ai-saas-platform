import { AbstractHttpException } from "../../abstract-http.exception.js";

/**
 * 接口层异常基类
 *
 * @description 用于处理接口层（HTTP、API）相关的异常
 * 接口层异常通常与HTTP请求/响应、API调用、数据传输相关
 */
export abstract class InterfaceLayerException extends AbstractHttpException {
  /**
   * 创建接口层异常
   *
   * @param errorCode - 错误代码
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
   * 获取异常层级信息
   */
  getLayer(): string {
    return "interface";
  }
}
