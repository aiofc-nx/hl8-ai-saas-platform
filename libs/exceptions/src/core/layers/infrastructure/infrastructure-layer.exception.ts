import { AbstractHttpException } from "../../abstract-http.exception.js";

/**
 * 基础设施层异常基类
 *
 * @description 用于处理基础设施层（数据库、外部服务）相关的异常
 * 基础设施层异常通常与持久化、外部服务集成、系统资源相关
 */
export abstract class InfrastructureLayerException extends AbstractHttpException {
  /**
   * 创建基础设施层异常
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
    return "infrastructure";
  }
}
