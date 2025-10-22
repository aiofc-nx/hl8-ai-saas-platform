import { AbstractHttpException } from "../../abstract-http.exception.js";

/**
 * 领域层异常基类
 *
 * @description 用于处理领域层（业务逻辑、规则）相关的异常
 * 领域层异常通常与业务规则、领域约束、聚合一致性相关
 */
export abstract class DomainLayerException extends AbstractHttpException {
  /**
   * 创建领域层异常
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
    return "domain";
  }
}
