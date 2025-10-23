import { AbstractHttpException } from "../../abstract-http.exception.js";

/**
 * 应用层异常基类
 *
 * @description 用于处理应用层（用例、工作流）相关的异常
 * 应用层异常通常与业务用例执行、工作流程、命令查询处理相关
 */
export abstract class ApplicationLayerException extends AbstractHttpException {
  /**
   * 创建应用层异常
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
    return "application";
  }
}
