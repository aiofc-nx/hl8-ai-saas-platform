<!--
Sync Impact Report:
Version change: 1.0.0 → 1.0.1
Modified principles: None (initial creation)
Added sections: Architecture Principles, Monorepo Organization, Quality Assurance, Testing Architecture, Data Isolation, Unified Language, TypeScript any Usage, Error Handling
Removed sections: None (initial creation)
Templates requiring updates:
✅ Updated: .specify/memory/constitution.md
⚠ Pending: .specify/templates/plan-template.md (Constitution Check section needs update)
⚠ Pending: .specify/templates/spec-template.md (may need alignment with data isolation principles)
⚠ Pending: .specify/templates/tasks-template.md (may need updates for testing architecture)
Follow-up TODOs: Update template files to align with new constitution principles
-->

# HL8 SAAS Platform Constitution

## Core Principles

### I. Architecture Principles

**项目采用混合架构模式：Clean Architecture + DDD + CQRS + 事件溯源 (ES) + 事件驱动架构 (EDA)**

- **Clean Architecture**：四层架构（领域层、应用层、基础设施层、接口层），依赖关系从外向内，核心业务逻辑独立于框架
- **领域驱动设计 (DDD)**：充血模型，领域对象必须包含业务逻辑和数据，禁止贫血模型
- **CQRS 模式**：命令和查询必须分离，支持读写模型的独立优化
- **事件溯源 (ES)**：所有状态变更通过事件记录，支持完整的审计追踪和时间旅行
- **事件驱动架构 (EDA)**：系统组件通过事件通信，实现松耦合和异步处理

### II. Monorepo Organization Principles

**使用 Turborepo 管理多个相关项目，实现代码共享和独立部署**

- **项目结构**：apps/（应用程序）、libs/（服务端业务库）、packages/（前端业务库）、examples/（示例项目）
- **领域模块独立性**：领域模块作为独立项目开发，便于未来微服务部署
- **服务模块命名**：服务模块放在 services 目录时去掉 "-service" 后缀
- **包管理**：必须使用 pnpm 作为包管理工具，通过 pnpm-workspace.yaml 管理依赖

### III. Quality Assurance Principles

**确保代码质量、可维护性和可测试性**

- **ESLint 规范**：使用 eslint.config.mjs 作为配置文件，子项目必须扩展根目录配置
- **TypeScript 配置**：每个 `libs/<package>/tsconfig.json` 必须扩展 monorepo 根 tsconfig.json
- **文档规范**：详细设计文件使用 "XS" 前缀，保持文档与代码同步更新

### IV. Testing Architecture Principles

**分层测试架构，确保代码质量和快速反馈**

- **就近原则**：单元测试文件与被测试文件在同一目录，命名格式：`{被测试文件名}.spec.ts`
- **集中管理**：集成测试、端到端测试统一放置在 __tests__ 目录
- **类型分离**：单元测试与源代码同目录，集成测试按模块组织，端到端测试按功能组织
- **测试覆盖率要求**：核心业务逻辑 ≥ 80%，关键路径 ≥ 90%，所有公共 API 必须有测试用例

### V. Data Isolation and Sharing Principles

**多层级数据隔离，支持共享数据和非共享数据的细粒度访问控制**

- **五级隔离**：平台级、租户级、组织级、部门级、用户级
- **数据分类**：共享数据（可在指定层级内被下级访问）和非共享数据（仅限特定层级访问）
- **访问规则**：所有数据访问必须携带完整的隔离上下文，系统自动根据上下文过滤数据
- **技术实现**：所有业务表必须包含隔离字段，API 请求必须携带隔离标识，缓存键必须包含隔离层级信息

## Unified Language Principles

### VI. Ubiquitous Language

**所有团队成员必须使用统一的领域术语进行沟通和文档编写**

- **核心术语**：平台（Platform）、租户（Tenant）、组织（Organization）、部门（Department）、用户（User）
- **术语使用规范**：一致性、精确性、可追溯性、演进性
- **业务实体映射**：技术实现必须能够追溯到业务术语，代码命名应反映业务术语

### VII. TypeScript `any` Type Usage Principles

**`any` 类型应被视为"逃生舱口"，在"危险的潜在性"与"安全的宽泛性"之间保持严格平衡**

- **安全使用规则**：明确声明、局部限定、测试保障、优先替代方案、持续改进
- **工程化约束**：启用 ESLint 规则，代码审查要求，度量和监控
- **禁止模式**：懒惰使用、仅为避免类型错误而使用 any

### VIII. Error Handling and Logging Principles

**错误处理必须遵循"异常优先，日志辅助"的设计原则**

- **职责分离**：异常用于业务逻辑，日志用于监控和调试
- **错误处理层次**：数据层记录技术错误日志并抛出业务异常，业务层捕获并转换异常，控制器层转换为HTTP响应
- **反模式禁止**：禁止用日志替代异常、异常中不记录日志、日志中不抛出异常

## Technical Constraints

### Technology Stack Requirements

- **运行环境**：Node.js >= 20
- **开发语言**：TypeScript 5.9.2
- **包管理器**：pnpm 10.11.0
- **构建工具**：Turborepo 2.5.8
- **后端框架**：NestJS（推荐）
- **架构模式**：Clean + DDD + CQRS + ES + EDA

### TypeScript Configuration Requirements

**所有服务端项目必须使用 NodeNext 模块系统**

- **核心配置**：module: "NodeNext", moduleResolution: "NodeNext", target: "ES2022", strict: true
- **package.json 配置**：type: "module", engines: { "node": ">=20" }
- **禁止使用 CommonJS**：不允许在新项目中使用 CommonJS 模块系统

### CommonJS to NodeNext Migration Requirements

**所有从旧项目迁移的代码必须从 CommonJS 迁移到 NodeNext**

- **迁移范围**：代码语法、配置文件、文件结构
- **迁移验证**：编译验证、运行时验证、测试验证
- **迁移约束**：向后兼容性、性能要求、依赖管理

## Governance

**宪章超越所有其他实践**：本宪章是项目的最高指导原则，所有开发活动必须符合宪章要求

**修订程序**：

- 宪章修订需要文档化、批准和迁移计划
- 修订必须记录版本变更、影响范围和实施计划
- 重大修订需要团队讨论和批准

**合规要求**：

- 所有 PR/审查必须验证合规性
- 复杂性必须得到合理解释
- 使用 README.md 作为运行时开发指导

**版本管理**：

- 遵循语义版本控制规则
- MAJOR：向后不兼容的治理/原则移除或重新定义
- MINOR：新增原则/章节或实质性扩展指导
- PATCH：澄清、措辞、拼写错误修复、非语义改进

**Version**: 1.0.1 | **Ratified**: 2025-01-19 | **Last Amended**: 2025-01-19
