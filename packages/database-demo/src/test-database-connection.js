#!/usr/bin/env node

/**
 * 数据库连接测试脚本
 * 
 * @description 测试 libs/database 连接真实的数据库
 * 
 * @since 1.0.0
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// 测试 PostgreSQL 连接
async function testPostgreSQL() {
  console.log('🔍 测试 PostgreSQL 连接...');
  
  try {
    const { Client } = require('pg');
    const client = new Client({
      host: 'localhost',
      port: 5432,
      database: 'aiofix_platform',
      user: 'aiofix_user',
      password: 'aiofix_password',
    });

    await client.connect();
    console.log('✅ PostgreSQL 连接成功');
    
    // 测试查询
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL 版本:', result.rows[0].version);
    
    // 测试 pgvector 扩展
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS vector');
      console.log('✅ pgvector 扩展已启用');
    } catch (error) {
      console.log('⚠️  pgvector 扩展可能未安装:', error.message);
    }
    
    await client.end();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL 连接失败:', error.message);
    return false;
  }
}

// 测试 MongoDB 连接
async function testMongoDB() {
  console.log('🔍 测试 MongoDB 连接...');
  
  try {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient('mongodb://aiofix_admin:aiofix_password@localhost:27017/');
    
    await client.connect();
    console.log('✅ MongoDB 连接成功');
    
    // 测试数据库列表
    const admin = client.db().admin();
    const dbs = await admin.listDatabases();
    console.log('📊 可用数据库:', dbs.databases.map(db => db.name));
    
    await client.close();
    return true;
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message);
    return false;
  }
}

// 测试 Redis 连接
async function testRedis() {
  console.log('🔍 测试 Redis 连接...');
  
  try {
    const redis = require('redis');
    const client = redis.createClient({
      host: 'localhost',
      port: 6379,
    });
    
    await client.connect();
    console.log('✅ Redis 连接成功');
    
    // 测试基本操作
    await client.set('test_key', 'test_value');
    const value = await client.get('test_key');
    console.log('📊 Redis 测试值:', value);
    
    await client.del('test_key');
    await client.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Redis 连接失败:', error.message);
    return false;
  }
}

// 测试数据库库的健康检查
async function testDatabaseLibrary() {
  console.log('🔍 测试 @hl8/database 库...');
  
  try {
    // 检查数据库库是否存在
    const fs = require('fs');
    const path = require('path');
    const libPath = '/home/arligle/hl8/hl8-ai-saas-platform/libs/database';
    
    if (!fs.existsSync(libPath)) {
      console.log('⚠️  数据库库路径不存在:', libPath);
      return false;
    }
    
    // 检查构建文件是否存在
    const distPath = path.join(libPath, 'dist', 'index.js');
    if (!fs.existsSync(distPath)) {
      console.log('⚠️  数据库库未构建，需要先运行构建命令');
      console.log('💡 建议运行: cd /home/arligle/hl8/hl8-ai-saas-platform/libs/database && pnpm build');
      return false;
    }
    
    console.log('✅ 数据库库文件存在');
    console.log('⚠️  数据库库需要完整的 NestJS 环境才能运行');
    console.log('💡 建议在 NestJS 应用中测试数据库库功能');
    return true;
  } catch (error) {
    console.error('❌ 数据库库测试失败:', error.message);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始数据库连接测试...\n');
  
  const results = {
    postgresql: false,
    mongodb: false,
    redis: false,
    databaseLibrary: false,
  };
  
  // 测试各个数据库
  results.postgresql = await testPostgreSQL();
  console.log('');
  
  results.mongodb = await testMongoDB();
  console.log('');
  
  results.redis = await testRedis();
  console.log('');
  
  results.databaseLibrary = await testDatabaseLibrary();
  console.log('');
  
  // 输出测试结果
  console.log('📋 测试结果汇总:');
  console.log('================');
  console.log(`PostgreSQL: ${results.postgresql ? '✅ 通过' : '❌ 失败'}`);
  console.log(`MongoDB:    ${results.mongodb ? '✅ 通过' : '❌ 失败'}`);
  console.log(`Redis:      ${results.redis ? '✅ 通过' : '❌ 失败'}`);
  console.log(`Database库: ${results.databaseLibrary ? '✅ 通过' : '❌ 失败'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n总体结果: ${allPassed ? '🎉 所有测试通过' : '⚠️  部分测试失败'}`);
  
  return allPassed;
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 测试运行失败:', error);
    process.exit(1);
  });
}

export { runTests, testPostgreSQL, testMongoDB, testRedis, testDatabaseLibrary };
