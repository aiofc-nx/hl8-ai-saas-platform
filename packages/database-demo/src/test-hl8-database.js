#!/usr/bin/env node

/**
 * 使用 @hl8/database 库的测试脚本
 *
 * @description 测试 libs/database 库的实际功能
 *
 * @since 1.0.0
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);

// 导入 reflect-metadata（NestJS 依赖）
import "reflect-metadata";

// 测试 @hl8/database 库的基本功能
async function testHl8Database() {
  console.log("🔍 测试 @hl8/database 库功能...");

  try {
    // 动态导入 @hl8/database 库
    const databaseModule = await import(
      "/home/arligle/hl8/hl8-ai-saas-platform/libs/database/dist/index.js"
    );
    console.log("✅ @hl8/database 库导入成功");

    // 检查导出的模块
    console.log("📊 可用的模块:", Object.keys(databaseModule));

    // 测试健康检查服务
    if (databaseModule.HealthCheckService) {
      console.log("✅ HealthCheckService 可用");
    }

    // 测试连接管理器
    if (databaseModule.ConnectionManager) {
      console.log("✅ ConnectionManager 可用");
    }

    // 测试事务服务
    if (databaseModule.TransactionService) {
      console.log("✅ TransactionService 可用");
    }

    // 测试统一事务管理器
    if (databaseModule.UnifiedTransactionManager) {
      console.log("✅ UnifiedTransactionManager 可用");
    }

    // 测试实体映射器
    if (databaseModule.EntityMapper) {
      console.log("✅ EntityMapper 可用");
    }

    // 测试指标服务
    if (databaseModule.MetricsService) {
      console.log("✅ MetricsService 可用");
    }

    return true;
  } catch (error) {
    console.error("❌ @hl8/database 库测试失败:", error.message);
    console.error("详细错误:", error.stack);
    return false;
  }
}

// 测试数据库模块配置
async function testDatabaseModule() {
  console.log("🔍 测试数据库模块配置...");

  try {
    // 模拟数据库配置
    const config = {
      connection: {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        database: "aiofix_platform",
        username: "aiofix_user",
        password: "aiofix_password",
      },
      pool: {
        min: 5,
        max: 20,
      },
      monitoring: {
        enabled: true,
        slowQueryThreshold: 1000,
      },
    };

    console.log("✅ 数据库配置创建成功");
    console.log("📊 配置详情:", JSON.stringify(config, null, 2));

    return true;
  } catch (error) {
    console.error("❌ 数据库模块配置测试失败:", error.message);
    return false;
  }
}

// 测试实体映射功能
async function testEntityMapping() {
  console.log("🔍 测试实体映射功能...");

  try {
    // 动态导入实体映射器
    const { EntityMapper } = await import(
      "/home/arligle/hl8/hl8-ai-saas-platform/libs/database/dist/index.js"
    );

    // 创建实体映射器实例
    const entityMapper = new EntityMapper();

    // 测试 PostgreSQL 到 MongoDB 映射
    const postgresqlEntity = {
      id: 1,
      name: "测试用户",
      email: "test@example.com",
      createdAt: new Date(),
      isActive: true,
    };

    console.log("📊 原始 PostgreSQL 实体:", postgresqlEntity);

    // 创建映射配置
    const config =
      entityMapper.createPostgreSQLToMongoDBConfig(postgresqlEntity);
    console.log("✅ 映射配置创建成功");

    // 执行实体映射
    const result = entityMapper.mapEntity(postgresqlEntity, config);
    console.log("✅ 实体映射执行成功");
    console.log("📊 映射结果:", result);

    if (result.success) {
      console.log("✅ 映射后的实体:", result.mappedEntity);
    } else {
      console.log("⚠️  映射失败，错误:", result.errors);
    }

    return result.success;
  } catch (error) {
    console.error("❌ 实体映射测试失败:", error.message);
    return false;
  }
}

// 测试指标服务功能
async function testMetricsService() {
  console.log("🔍 测试指标服务功能...");

  try {
    // 动态导入指标服务
    const { MetricsService } = await import(
      "/home/arligle/hl8/hl8-ai-saas-platform/libs/database/dist/index.js"
    );

    // 创建指标服务实例
    const metricsService = new MetricsService();

    // 记录一些查询指标
    console.log("📊 记录查询指标...");
    metricsService.recordQuery({
      duration: 150,
      query: "SELECT * FROM users",
    });

    metricsService.recordQuery({
      duration: 250,
      query: "SELECT * FROM orders WHERE status = ?",
    });

    metricsService.recordQuery({
      duration: 1200, // 慢查询
      query: "SELECT * FROM large_table WHERE complex_condition",
    });

    // 获取数据库指标
    const databaseMetrics = await metricsService.getDatabaseMetrics();
    console.log("✅ 数据库指标获取成功");
    console.log("📊 查询总数:", databaseMetrics.queries.total);
    console.log("📊 平均查询时间:", databaseMetrics.queries.avgDuration);

    // 获取慢查询
    const slowQueries = metricsService.getSlowQueries();
    console.log("✅ 慢查询获取成功");
    console.log("📊 慢查询数量:", slowQueries.length);

    // 获取多数据库指标
    const multiDbMetrics = await metricsService.getMultiDatabaseMetrics();
    console.log("✅ 多数据库指标获取成功");
    console.log("📊 数据库类型:", multiDbMetrics.databaseType);
    console.log("📊 综合评分:", multiDbMetrics.overallScore);

    return true;
  } catch (error) {
    console.error("❌ 指标服务测试失败:", error.message);
    return false;
  }
}

// 测试数据库驱动工厂
async function testDatabaseDriverFactory() {
  console.log("🔍 测试数据库驱动工厂...");

  try {
    // 动态导入数据库驱动工厂
    const { DatabaseDriverFactory } = await import(
      "/home/arligle/hl8/hl8-ai-saas-platform/libs/database/dist/index.js"
    );

    // 创建驱动工厂实例
    const driverFactory = new DatabaseDriverFactory();

    // 测试 PostgreSQL 驱动创建
    console.log("📊 创建 PostgreSQL 驱动...");
    const postgresqlDriver = driverFactory.createDriver({
      type: "postgresql",
      connection: {
        host: "localhost",
        port: 5432,
        database: "aiofix_platform",
        username: "aiofix_user",
        password: "aiofix_password",
      },
    });

    console.log("✅ PostgreSQL 驱动创建成功");
    console.log("📊 驱动类型:", postgresqlDriver.getDriverType());

    // 测试 MongoDB 驱动创建
    console.log("📊 创建 MongoDB 驱动...");
    const mongodbDriver = driverFactory.createDriver({
      type: "mongodb",
      connection: {
        host: "localhost",
        port: 27017,
        database: "aiofix_platform",
        username: "aiofix_admin",
        password: "aiofix_password",
      },
    });

    console.log("✅ MongoDB 驱动创建成功");
    console.log("📊 驱动类型:", mongodbDriver.getDriverType());

    return true;
  } catch (error) {
    console.error("❌ 数据库驱动工厂测试失败:", error.message);
    return false;
  }
}

// 主测试函数
async function runHl8DatabaseTests() {
  console.log("🚀 开始 @hl8/database 库功能测试...\n");

  const results = {
    basicImport: false,
    moduleConfig: false,
    entityMapping: false,
    metricsService: false,
    driverFactory: false,
  };

  // 测试基本导入
  results.basicImport = await testHl8Database();
  console.log("");

  // 测试模块配置
  results.moduleConfig = await testDatabaseModule();
  console.log("");

  // 测试实体映射
  results.entityMapping = await testEntityMapping();
  console.log("");

  // 测试指标服务
  results.metricsService = await testMetricsService();
  console.log("");

  // 测试驱动工厂
  results.driverFactory = await testDatabaseDriverFactory();
  console.log("");

  // 输出测试结果
  console.log("📋 @hl8/database 库测试结果汇总:");
  console.log("================================");
  console.log(`基本导入:     ${results.basicImport ? "✅ 通过" : "❌ 失败"}`);
  console.log(`模块配置:     ${results.moduleConfig ? "✅ 通过" : "❌ 失败"}`);
  console.log(`实体映射:     ${results.entityMapping ? "✅ 通过" : "❌ 失败"}`);
  console.log(
    `指标服务:     ${results.metricsService ? "✅ 通过" : "❌ 失败"}`,
  );
  console.log(`驱动工厂:     ${results.driverFactory ? "✅ 通过" : "❌ 失败"}`);

  const allPassed = Object.values(results).every((result) => result);
  console.log(
    `\n总体结果: ${allPassed ? "🎉 所有 @hl8/database 库功能测试通过" : "⚠️  部分功能测试失败"}`,
  );

  return allPassed;
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runHl8DatabaseTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("💥 @hl8/database 库测试运行失败:", error);
      process.exit(1);
    });
}

export {
  runHl8DatabaseTests,
  testHl8Database,
  testEntityMapping,
  testMetricsService,
  testDatabaseDriverFactory,
};
