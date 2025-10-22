import { SystemException } from "./system.exception.js";

/**
 * 资源未找到异常
 *
 * @description 当系统资源不存在时抛出此异常
 * 通常用于文件、配置、缓存等系统资源访问
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new ResourceNotFoundException('config', 'database.yml');
 *
 * // 带上下文数据
 * throw new ResourceNotFoundException('config', 'database.yml', {
 *   resourceType: 'configuration_file',
 *   searchPath: '/etc/app/config/',
 *   reason: 'file_not_found'
 * });
 * ```
 */
export class ResourceNotFoundException extends SystemException {
  /**
   * 创建资源未找到异常
   *
   * @param resourceType - 资源类型
   * @param resourceId - 资源标识符
   * @param data - 附加数据，可包含搜索路径、原因等信息
   */
  constructor(
    resourceType: string,
    resourceId: string,
    data?: Record<string, unknown>,
  ) {
    super(
      "SYSTEM_RESOURCE_NOT_FOUND",
      "资源未找到",
      `系统资源 "${resourceType}" (${resourceId}) 不存在`,
      404,
      { resourceType, resourceId, ...data },
      "https://docs.hl8.com/errors#SYSTEM_RESOURCE_NOT_FOUND",
    );
  }
}
