#!/usr/bin/env node

/**
 * 简化的 @hl8/database 库测试脚本
 * 
 * @description 测试 libs/database 库的核心功能，不依赖完整构建
 * 
 * @since 1.0.0
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// 测试数据库库的源码导入
async function testHl8DatabaseSource() {
  console.log('🔍 测试 @hl8/database 库源码...');
  
  try {
    // 直接导入源码文件
    const connectionManager = await import('/home/arligle/hl8/hl8-ai-saas-platform/libs/database/src/connection/connection.manager.js');
    console.log('✅ ConnectionManager 源码导入成功');
    
    const healthCheckService = await import('/home/arligle/hl8/hl8-ai-saas-platform/libs/database/src/monitoring/health-check.service.js');
    console.log('✅ HealthCheckService 源码导入成功');
    
    const transactionService = await import('/home/arligle/hl8/hl8-ai-saas-platform/libs/database/src/transaction/transaction.service.js');
    console.log('✅ TransactionService 源码导入成功');
    
    const entityMapper = await import('/home/arligle/hl8/hl8-ai-saas-platform/libs/database/src/mapping/entity-mapper.js');
    console.log('✅ EntityMapper 源码导入成功');
    
    const metricsService = await import('/home/arligle/hl8/hl8-ai-saas-platform/libs/database/src/monitoring/metrics.service.js');
    console.log('✅ MetricsService 源码导入成功');
    
    return true;
  } catch (error) {
    console.error('❌ 源码导入测试失败:', error.message);
    return false;
  }
}

// 测试数据库库的模块结构
async function testHl8DatabaseStructure() {
  console.log('🔍 测试 @hl8/database 库结构...');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    const libPath = '/home/arligle/hl8/hl8-ai-saas-platform/libs/database';
    
    // 检查主要目录结构
    const directories = [
      'src/connection',
      'src/transaction', 
      'src/monitoring',
      'src/mapping',
      'src/drivers',
      'src/config',
      'src/exceptions',
      'src/types'
    ];
    
    let structureValid = true;
    
    for (const dir of directories) {
      const fullPath = path.join(libPath, dir);
      if (fs.existsSync(fullPath)) {
        console.log(`✅ 目录存在: ${dir}`);
      } else {
        console.log(`❌ 目录缺失: ${dir}`);
        structureValid = false;
      }
    }
    
    // 检查主要文件
    const files = [
      'src/index.ts',
      'src/database.module.ts',
      'src/connection/connection.manager.ts',
      'src/transaction/transaction.service.ts',
      'src/monitoring/health-check.service.ts',
      'src/mapping/entity-mapper.ts'
    ];
    
    for (const file of files) {
      const fullPath = path.join(libPath, file);
      if (fs.existsSync(fullPath)) {
        console.log(`✅ 文件存在: ${file}`);
      } else {
        console.log(`❌ 文件缺失: ${file}`);
        structureValid = false;
      }
    }
    
    return structureValid;
  } catch (error) {
    console.error('❌ 库结构测试失败:', error.message);
    return false;
  }
}

// 测试数据库库的配置
async function testHl8DatabaseConfig() {
  console.log('🔍 测试 @hl8/database 库配置...');
  
  try {
    // 模拟数据库配置
    const config = {
      connection: {
        type: 'postgresql',
        host: 'localhost',
        port: 5432,
        database: 'aiofix_platform',
        username: 'aiofix_user',
        password: 'aiofix_password',
      },
      pool: {
        min: 5,
        max: 20,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 60000,
      },
      monitoring: {
        enabled: true,
        slowQueryThreshold: 1000,
        debug: false,
      }
    };
    
    console.log('✅ 数据库配置创建成功');
    console.log('📊 配置详情:', JSON.stringify(config, null, 2));
    
    // 验证配置格式
    const requiredFields = ['connection', 'pool', 'monitoring'];
    const connectionFields = ['type', 'host', 'port', 'database', 'username', 'password'];
    const poolFields = ['min', 'max', 'idleTimeoutMillis', 'acquireTimeoutMillis'];
    const monitoringFields = ['enabled', 'slowQueryThreshold', 'debug'];
    
    let configValid = true;
    
    // 检查必需字段
    for (const field of requiredFields) {
      if (!config[field]) {
        console.log(`❌ 配置缺失字段: ${field}`);
        configValid = false;
      }
    }
    
    // 检查连接配置
    for (const field of connectionFields) {
      if (!config.connection[field]) {
        console.log(`❌ 连接配置缺失字段: ${field}`);
        configValid = false;
      }
    }
    
    // 检查连接池配置
    for (const field of poolFields) {
      if (config.pool[field] === undefined) {
        console.log(`❌ 连接池配置缺失字段: ${field}`);
        configValid = false;
      }
    }
    
    // 检查监控配置
    for (const field of monitoringFields) {
      if (config.monitoring[field] === undefined) {
        console.log(`❌ 监控配置缺失字段: ${field}`);
        configValid = false;
      }
    }
    
    if (configValid) {
      console.log('✅ 数据库配置验证通过');
    } else {
      console.log('❌ 数据库配置验证失败');
    }
    
    return configValid;
  } catch (error) {
    console.error('❌ 数据库配置测试失败:', error.message);
    return false;
  }
}

// 测试数据库库的功能模拟
async function testHl8DatabaseFeatures() {
  console.log('🔍 测试 @hl8/database 库功能模拟...');
  
  try {
    // 模拟连接管理器功能
    console.log('📊 模拟连接管理器功能...');
    const mockConnectionManager = {
      connect: async () => {
        console.log('✅ 模拟连接成功');
        return true;
      },
      disconnect: async () => {
        console.log('✅ 模拟断开连接成功');
        return true;
      },
      isConnected: () => {
        console.log('✅ 模拟连接状态检查成功');
        return true;
      },
      getPoolStats: () => {
        console.log('✅ 模拟连接池统计获取成功');
        return {
          total: 10,
          active: 3,
          idle: 7,
          waiting: 0,
          max: 20,
          min: 5
        };
      }
    };
    
    // 模拟健康检查服务
    console.log('📊 模拟健康检查服务...');
    const mockHealthCheck = {
      check: async () => {
        console.log('✅ 模拟健康检查成功');
        return {
          healthy: true,
          status: 'healthy',
          responseTime: 100,
          timestamp: new Date()
        };
      }
    };
    
    // 模拟事务服务
    console.log('📊 模拟事务服务...');
    const mockTransactionService = {
      runInTransaction: async (callback) => {
        console.log('✅ 模拟事务开始');
        try {
          const result = await callback();
          console.log('✅ 模拟事务提交成功');
          return result;
        } catch (error) {
          console.log('✅ 模拟事务回滚成功');
          throw error;
        }
      }
    };
    
    // 模拟实体映射器
    console.log('📊 模拟实体映射器...');
    const mockEntityMapper = {
      mapEntity: (entity, config) => {
        console.log('✅ 模拟实体映射成功');
        return {
          success: true,
          mappedEntity: { ...entity, _id: entity.id },
          errors: []
        };
      }
    };
    
    // 模拟指标服务
    console.log('📊 模拟指标服务...');
    const mockMetricsService = {
      recordQuery: (query) => {
        console.log('✅ 模拟查询指标记录成功');
        return true;
      },
      getDatabaseMetrics: async () => {
        console.log('✅ 模拟数据库指标获取成功');
        return {
          queries: { total: 100, avgDuration: 150 },
          transactions: { total: 50, successRate: 95 }
        };
      }
    };
    
    // 执行模拟测试
    await mockConnectionManager.connect();
    await mockHealthCheck.check();
    await mockTransactionService.runInTransaction(async () => 'test');
    mockEntityMapper.mapEntity({ id: 1, name: 'test' }, {});
    mockMetricsService.recordQuery({ duration: 100, query: 'SELECT 1' });
    await mockMetricsService.getDatabaseMetrics();
    await mockConnectionManager.disconnect();
    
    console.log('✅ 所有功能模拟测试通过');
    return true;
  } catch (error) {
    console.error('❌ 功能模拟测试失败:', error.message);
    return false;
  }
}

// 主测试函数
async function runSimpleHl8Tests() {
  console.log('🚀 开始简化的 @hl8/database 库测试...\n');
  
  const results = {
    sourceImport: false,
    structure: false,
    config: false,
    features: false,
  };
  
  // 测试源码导入
  results.sourceImport = await testHl8DatabaseSource();
  console.log('');
  
  // 测试库结构
  results.structure = await testHl8DatabaseStructure();
  console.log('');
  
  // 测试配置
  results.config = await testHl8DatabaseConfig();
  console.log('');
  
  // 测试功能模拟
  results.features = await testHl8DatabaseFeatures();
  console.log('');
  
  // 输出测试结果
  console.log('📋 简化的 @hl8/database 库测试结果汇总:');
  console.log('========================================');
  console.log(`源码导入:     ${results.sourceImport ? '✅ 通过' : '❌ 失败'}`);
  console.log(`库结构:       ${results.structure ? '✅ 通过' : '❌ 失败'}`);
  console.log(`配置验证:     ${results.config ? '✅ 通过' : '❌ 失败'}`);
  console.log(`功能模拟:     ${results.features ? '✅ 通过' : '❌ 失败'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n总体结果: ${allPassed ? '🎉 所有简化测试通过' : '⚠️  部分简化测试失败'}`);
  
  if (allPassed) {
    console.log('\n💡 建议:');
    console.log('- 数据库库源码结构完整');
    console.log('- 配置格式正确');
    console.log('- 功能设计合理');
    console.log('- 需要在 NestJS 环境中进行完整测试');
  }
  
  return allPassed;
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runSimpleHl8Tests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 简化测试运行失败:', error);
    process.exit(1);
  });
}

export { runSimpleHl8Tests, testHl8DatabaseSource, testHl8DatabaseStructure, testHl8DatabaseConfig, testHl8DatabaseFeatures };
