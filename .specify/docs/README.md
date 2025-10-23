# 项目文档索引

## 📋 概述

本文档索引提供了项目中所有重要文档的快速访问链接，帮助开发团队快速找到所需的信息。

## 🏗️ 架构和设计文档

### 核心架构

- [项目宪章](../memory/constitution.md) - 项目的最高指导原则和核心架构要求
- [Clean Architecture 设计文档](./ARCHITECTURE_DESIGN.md) - 清洁架构设计原则和实现指南
- [DDD 领域驱动设计文档](./DDD_DESIGN.md) - 领域驱动设计原则和实现指南

### 技术规范

- [TypeScript 配置规范](./TYPESCRIPT_CONFIG.md) - TypeScript 配置要求和最佳实践
- [ESLint 配置规范](./ESLINT_CONFIG.md) - ESLint 配置要求和代码规范
- [测试架构规范](./TESTING_ARCHITECTURE.md) - 测试架构设计和实现指南

## 🔧 开发工具和规范

### 代码质量

- [TypeScript `any` 类型处理方案](./ANY_TYPE_HANDLING_GUIDE.md) - `any` 类型使用规范和最佳实践
- [TypeScript `any` 类型使用检查清单](./ANY_TYPE_CHECKLIST.md) - `any` 类型使用检查流程
- [TypeScript `any` 类型快速参考指南](./ANY_TYPE_QUICK_REFERENCE.md) - `any` 类型使用快速参考

### 开发流程

- [代码审查规范](./CODE_REVIEW_GUIDE.md) - 代码审查流程和标准
- [Git 工作流规范](./GIT_WORKFLOW.md) - Git 使用规范和最佳实践
- [持续集成配置](./CI_CD_CONFIG.md) - 持续集成和部署配置

## 📚 业务和技术文档

### 业务规范

- [数据隔离和共享原则](../memory/constitution.md#vii-data-isolation-and-sharing-principles) - 多层级数据隔离规范
- [统一语言原则](../memory/constitution.md#unified-language-principles) - 业务术语和沟通规范
- [错误处理和日志原则](../memory/constitution.md#x-error-handling-and-logging-principles) - 错误处理规范

### 技术实现

- [异常处理系统文档](../../libs/exceptions/docs/) - 统一异常处理系统
- [基础设施层集成文档](../../libs/infrastructure-kernel/docs/) - 基础设施层集成指南
- [应用层集成文档](../../libs/application-kernel/docs/) - 应用层集成指南
- [领域层集成文档](../../libs/domain-kernel/docs/) - 领域层集成指南

## 🧪 测试和质量保证

### 测试规范

- [单元测试规范](./UNIT_TESTING_GUIDE.md) - 单元测试编写规范和最佳实践
- [集成测试规范](./INTEGRATION_TESTING_GUIDE.md) - 集成测试设计和实现指南
- [端到端测试规范](./E2E_TESTING_GUIDE.md) - 端到端测试设计和实现指南

### 质量保证

- [代码质量检查清单](./CODE_QUALITY_CHECKLIST.md) - 代码质量检查标准
- [性能测试规范](./PERFORMANCE_TESTING_GUIDE.md) - 性能测试设计和实现指南
- [安全测试规范](./SECURITY_TESTING_GUIDE.md) - 安全测试设计和实现指南

## 🚀 部署和运维

### 部署规范

- [部署流程文档](./DEPLOYMENT_GUIDE.md) - 部署流程和最佳实践
- [环境配置文档](./ENVIRONMENT_CONFIG.md) - 环境配置和管理指南
- [监控和日志文档](./MONITORING_LOGGING_GUIDE.md) - 监控和日志配置指南

### 运维规范

- [故障排除指南](./TROUBLESHOOTING_GUIDE.md) - 常见问题解决方案
- [性能优化指南](./PERFORMANCE_OPTIMIZATION_GUIDE.md) - 性能优化最佳实践
- [安全运维指南](./SECURITY_OPERATIONS_GUIDE.md) - 安全运维最佳实践

## 📖 学习和培训

### 学习资源

- [技术栈学习指南](./TECH_STACK_LEARNING_GUIDE.md) - 技术栈学习路径和资源
- [最佳实践案例](./BEST_PRACTICES_CASES.md) - 最佳实践案例和示例
- [常见问题解答](./FAQ.md) - 常见问题解答和解决方案

### 培训材料

- [新员工培训指南](./ONBOARDING_GUIDE.md) - 新员工培训计划和材料
- [技术培训计划](./TECHNICAL_TRAINING_PLAN.md) - 技术培训计划和课程
- [团队协作指南](./TEAM_COLLABORATION_GUIDE.md) - 团队协作规范和最佳实践

## 🔍 快速查找

### 按类型查找

- **架构文档**: 项目宪章、Clean Architecture、DDD 设计
- **技术特点**: TypeScript、ESLint、测试架构
- **开发工具**: 代码质量、开发流程、Git 工作流
- **业务规范**: 数据隔离、统一语言、错误处理
- **质量保证**: 测试规范、代码质量、性能测试
- **部署运维**: 部署流程、环境配置、监控日志

### 按角色查找

- **架构师**: 项目宪章、架构设计、技术规范
- **开发工程师**: 开发工具、代码质量、测试规范
- **测试工程师**: 测试规范、质量保证、性能测试
- **运维工程师**: 部署运维、监控日志、故障排除
- **项目经理**: 团队协作、培训计划、最佳实践

### 按阶段查找

- **项目启动**: 项目宪章、架构设计、技术规范
- **开发阶段**: 开发工具、代码质量、测试规范
- **测试阶段**: 测试规范、质量保证、性能测试
- **部署阶段**: 部署流程、环境配置、监控日志
- **运维阶段**: 运维规范、故障排除、性能优化

## 📝 文档维护

### 更新原则

- 文档必须与代码同步更新
- 重大变更必须更新相关文档
- 定期审查文档的准确性和完整性

### 贡献指南

- 遵循文档编写规范
- 使用统一的文档格式
- 添加适当的链接和引用

### 版本控制

- 使用语义版本控制
- 记录文档变更历史
- 维护文档版本兼容性

## 📞 联系方式

如有文档相关问题或建议，请联系：

- 技术负责人：[联系方式]
- 文档维护者：[联系方式]
- 项目管理员：[联系方式]

## 📚 外部资源

### 官方文档

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [NestJS 官方文档](https://docs.nestjs.com/)
- [ESLint 官方文档](https://eslint.org/docs/)

### 社区资源

- [TypeScript 社区](https://www.typescriptlang.org/community)
- [NestJS 社区](https://discord.gg/nestjs)
- [ESLint 社区](https://eslint.org/community/)

### 学习资源

- [TypeScript 学习路径](https://www.typescriptlang.org/docs/handbook/intro.html)
- [NestJS 学习资源](https://docs.nestjs.com/fundamentals/introduction)
- [ESLint 学习指南](https://eslint.org/docs/latest/use/getting-started)

通过这个文档索引，开发团队可以快速找到所需的信息和资源，提高开发效率和代码质量。
