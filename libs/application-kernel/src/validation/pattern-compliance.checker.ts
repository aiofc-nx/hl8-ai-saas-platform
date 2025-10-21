/**
 * 模式合规性检查器
 *
 * 提供自动化的模式合规性检查功能
 * 支持批量检查和持续集成
 *
 * @since 1.0.0
 */
import {
  PatternComplianceValidator,
  PatternComplianceResult,
} from "./pattern-compliance.validator.js";

/**
 * 检查配置
 */
export interface CheckConfig {
  /**
   * 要检查的模块路径
   */
  modulePaths: string[];

  /**
   * 是否包含子目录
   */
  includeSubdirectories?: boolean;

  /**
   * 排除的文件模式
   */
  excludePatterns?: string[];

  /**
   * 是否生成报告
   */
  generateReport?: boolean;

  /**
   * 报告输出路径
   */
  reportPath?: string;
}

/**
 * 检查结果
 */
export interface CheckResult {
  /**
   * 总模块数
   */
  totalModules: number;

  /**
   * 合规模块数
   */
  compliantModules: number;

  /**
   * 违规模块数
   */
  nonCompliantModules: number;

  /**
   * 合规率
   */
  complianceRate: number;

  /**
   * 详细结果
   */
  results: Array<{
    modulePath: string;
    result: PatternComplianceResult;
  }>;

  /**
   * 总结
   */
  summary: {
    totalViolations: number;
    totalSuggestions: number;
    commonViolations: string[];
    commonSuggestions: string[];
  };
}

/**
 * 模式合规性检查器
 *
 * 提供自动化的模式合规性检查功能
 */
export class PatternComplianceChecker {
  /**
   * 检查模块合规性
   *
   * @param config - 检查配置
   * @returns 检查结果
   */
  static async checkCompliance(config: CheckConfig): Promise<CheckResult> {
    const results: Array<{
      modulePath: string;
      result: PatternComplianceResult;
    }> = [];
    let totalViolations = 0;
    let totalSuggestions = 0;
    const violationCounts = new Map<string, number>();
    const suggestionCounts = new Map<string, number>();

    // 检查每个模块
    for (const modulePath of config.modulePaths) {
      try {
        const module = await this.loadModule(modulePath);
        const result = PatternComplianceValidator.validateModule(module);

        results.push({ modulePath, result });

        if (!result.isCompliant) {
          totalViolations += result.violations.length;
          totalSuggestions += result.suggestions.length;

          // 统计常见违规项
          for (const violation of result.violations) {
            violationCounts.set(
              violation,
              (violationCounts.get(violation) || 0) + 1,
            );
          }

          // 统计常见建议项
          for (const suggestion of result.suggestions) {
            suggestionCounts.set(
              suggestion,
              (suggestionCounts.get(suggestion) || 0) + 1,
            );
          }
        }
      } catch (error) {
        console.error(`检查模块 ${modulePath} 时出错:`, error);
        results.push({
          modulePath,
          result: {
            isCompliant: false,
            violations: [`模块加载失败: ${error}`],
            suggestions: ["检查模块路径和依赖关系"],
          },
        });
      }
    }

    const compliantModules = results.filter((r) => r.result.isCompliant).length;
    const nonCompliantModules = results.length - compliantModules;
    const complianceRate =
      results.length > 0 ? (compliantModules / results.length) * 100 : 100;

    const result: CheckResult = {
      totalModules: results.length,
      compliantModules,
      nonCompliantModules,
      complianceRate,
      results,
      summary: {
        totalViolations,
        totalSuggestions,
        commonViolations: this.getTopItems(violationCounts, 5),
        commonSuggestions: this.getTopItems(suggestionCounts, 5),
      },
    };

    // 生成报告
    if (config.generateReport && config.reportPath) {
      await this.generateReport(result, config.reportPath);
    }

    return result;
  }

  /**
   * 加载模块
   */
  private static async loadModule(_modulePath: string): Promise<any> {
    // 这里简化实现，实际应该使用动态导入
    // 在实际实现中，应该使用 import() 动态加载模块
    throw new Error("模块加载功能需要在实际环境中实现");
  }

  /**
   * 获取最常见的项目
   */
  private static getTopItems(
    counts: Map<string, number>,
    limit: number,
  ): string[] {
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([item]) => item);
  }

  /**
   * 生成检查报告
   */
  private static async generateReport(
    result: CheckResult,
    _reportPath: string,
  ): Promise<void> {
    const report = this.formatReport(result);

    // 这里简化实现，实际应该写入文件
    console.log("检查报告:");
    console.log(report);
  }

  /**
   * 格式化报告
   */
  private static formatReport(result: CheckResult): string {
    let report = `# 模式合规性检查报告\n\n`;
    report += `## 总体统计\n`;
    report += `- 总模块数: ${result.totalModules}\n`;
    report += `- 合规模块数: ${result.compliantModules}\n`;
    report += `- 违规模块数: ${result.nonCompliantModules}\n`;
    report += `- 合规率: ${result.complianceRate.toFixed(2)}%\n\n`;

    if (result.nonCompliantModules > 0) {
      report += `## 违规详情\n\n`;

      for (const { modulePath, result: moduleResult } of result.results) {
        if (!moduleResult.isCompliant) {
          report += `### ${modulePath}\n`;
          report += `**违规项:**\n`;
          for (const violation of moduleResult.violations) {
            report += `- ${violation}\n`;
          }
          report += `**建议改进:**\n`;
          for (const suggestion of moduleResult.suggestions) {
            report += `- ${suggestion}\n`;
          }
          report += `\n`;
        }
      }
    }

    if (result.summary.commonViolations.length > 0) {
      report += `## 常见违规项\n`;
      for (const violation of result.summary.commonViolations) {
        report += `- ${violation}\n`;
      }
      report += `\n`;
    }

    if (result.summary.commonSuggestions.length > 0) {
      report += `## 常见建议项\n`;
      for (const suggestion of result.summary.commonSuggestions) {
        report += `- ${suggestion}\n`;
      }
      report += `\n`;
    }

    return report;
  }

  /**
   * 检查单个模块
   *
   * @param module - 要检查的模块
   * @returns 检查结果
   */
  static checkModule(module: any): PatternComplianceResult {
    return PatternComplianceValidator.validateModule(module);
  }

  /**
   * 批量检查模块
   *
   * @param modules - 要检查的模块数组
   * @returns 检查结果数组
   */
  static checkModules(
    modules: Array<{ name: string; module: any }>,
  ): Array<{ name: string; result: PatternComplianceResult }> {
    return modules.map(({ name, module }) => ({
      name,
      result: PatternComplianceValidator.validateModule(module),
    }));
  }
}
