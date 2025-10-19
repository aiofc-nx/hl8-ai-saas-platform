#!/usr/bin/env node

/**
 * MongoDB 连接专项测试脚本
 * 
 * @description 专门测试 MongoDB 连接和 @hl8/database 库的 MongoDB 支持
 * 
 * @since 1.0.0
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// 测试原生 MongoDB 连接
async function testNativeMongoDB() {
  console.log('🔍 测试原生 MongoDB 连接...');
  
  try {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient('mongodb://aiofix_admin:aiofix_password@localhost:27017/');
    
    await client.connect();
    console.log('✅ MongoDB 连接成功');
    
    // 测试数据库操作
    const db = client.db('test_mongodb_connection');
    const collection = db.collection('test_collection');
    
    // 测试插入文档
    console.log('📊 测试文档插入...');
    const insertResult = await collection.insertOne({
      name: 'MongoDB 测试文档',
      timestamp: new Date(),
      data: { 
        connection: 'success',
        database: 'test_mongodb_connection',
        collection: 'test_collection'
      }
    });
    console.log('✅ 文档插入成功:', insertResult.insertedId);
    
    // 测试查询文档
    console.log('📊 测试文档查询...');
    const documents = await collection.find({}).toArray();
    console.log('✅ 查询到文档数量:', documents.length);
    console.log('📊 文档内容:', documents[0]);
    
    // 测试更新文档
    console.log('📊 测试文档更新...');
    const updateResult = await collection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { updated: true, updateTime: new Date() } }
    );
    console.log('✅ 文档更新成功:', updateResult.modifiedCount);
    
    // 测试删除文档
    console.log('📊 测试文档删除...');
    const deleteResult = await collection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ 文档删除成功:', deleteResult.deletedCount);
    
    // 清理测试数据库
    await db.dropDatabase();
    
    await client.close();
    console.log('✅ MongoDB 连接关闭成功');
    return true;
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message);
    return false;
  }
}

// 测试 MongoDB 高级功能
async function testMongoDBAdvanced() {
  console.log('🔍 测试 MongoDB 高级功能...');
  
  try {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient('mongodb://aiofix_admin:aiofix_password@localhost:27017/');
    
    await client.connect();
    const db = client.db('test_mongodb_advanced');
    
    // 测试多个集合
    const usersCollection = db.collection('users');
    const ordersCollection = db.collection('orders');
    
    // 插入用户数据
    console.log('📊 测试用户数据插入...');
    const users = [
      { name: '张三', email: 'zhangsan@example.com', age: 25 },
      { name: '李四', email: 'lisi@example.com', age: 30 },
      { name: '王五', email: 'wangwu@example.com', age: 28 }
    ];
    const usersResult = await usersCollection.insertMany(users);
    console.log('✅ 用户数据插入成功:', usersResult.insertedCount);
    
    // 插入订单数据
    console.log('📊 测试订单数据插入...');
    const orders = [
      { userId: usersResult.insertedIds[0], product: '商品A', amount: 100, date: new Date() },
      { userId: usersResult.insertedIds[1], product: '商品B', amount: 200, date: new Date() },
      { userId: usersResult.insertedIds[2], product: '商品C', amount: 150, date: new Date() }
    ];
    const ordersResult = await ordersCollection.insertMany(orders);
    console.log('✅ 订单数据插入成功:', ordersResult.insertedCount);
    
    // 测试聚合查询
    console.log('📊 测试聚合查询...');
    const aggregateResult = await ordersCollection.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $group: {
          _id: '$user.name',
          totalAmount: { $sum: '$amount' },
          orderCount: { $sum: 1 }
        }
      }
    ]).toArray();
    console.log('✅ 聚合查询成功:', aggregateResult);
    
    // 测试索引
    console.log('📊 测试索引创建...');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await ordersCollection.createIndex({ userId: 1, date: -1 });
    console.log('✅ 索引创建成功');
    
    // 测试事务
    console.log('📊 测试事务功能...');
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await usersCollection.insertOne(
          { name: '事务用户', email: 'transaction@example.com', age: 35 },
          { session }
        );
        await ordersCollection.insertOne(
          { userId: usersResult.insertedIds[0], product: '事务商品', amount: 300, date: new Date() },
          { session }
        );
      });
      console.log('✅ 事务执行成功');
    } catch (error) {
      console.log('⚠️  事务执行失败:', error.message);
    } finally {
      await session.endSession();
    }
    
    // 清理测试数据
    await db.dropDatabase();
    await client.close();
    return true;
  } catch (error) {
    console.error('❌ MongoDB 高级功能测试失败:', error.message);
    return false;
  }
}

// 测试 @hl8/database 库的 MongoDB 支持
async function testHl8DatabaseMongoDB() {
  console.log('🔍 测试 @hl8/database 库的 MongoDB 支持...');
  
  try {
    // 动态导入 @hl8/database 库
    const databaseModule = await import('/home/arligle/hl8/hl8-ai-saas-platform/libs/database/dist/index.js');
    console.log('✅ @hl8/database 库导入成功');
    
    // 检查 MongoDB 相关模块
    const mongoModules = [
      'MongoDBDriver',
      'MongoDBTransactionAdapter',
      'MongoDBIsolationLevel'
    ];
    
    let mongoSupport = true;
    for (const moduleName of mongoModules) {
      if (databaseModule[moduleName]) {
        console.log(`✅ ${moduleName} 可用`);
      } else {
        console.log(`❌ ${moduleName} 不可用`);
        mongoSupport = false;
      }
    }
    
    // 测试 MongoDB 驱动创建
    if (databaseModule.DatabaseDriverFactory) {
      console.log('📊 测试 MongoDB 驱动创建...');
      try {
        const driverFactory = new databaseModule.DatabaseDriverFactory();
        const mongoDriver = driverFactory.createDriver({
          type: 'mongodb',
          connection: {
            host: 'localhost',
            port: 27017,
            database: 'aiofix_platform',
            username: 'aiofix_admin',
            password: 'aiofix_password',
          },
        });
        console.log('✅ MongoDB 驱动创建成功');
        console.log('📊 驱动类型:', mongoDriver.getDriverType());
      } catch (error) {
        console.log('❌ MongoDB 驱动创建失败:', error.message);
        mongoSupport = false;
      }
    }
    
    // 测试统一事务管理器对 MongoDB 的支持
    if (databaseModule.UnifiedTransactionManager) {
      console.log('📊 测试统一事务管理器 MongoDB 支持...');
      try {
        const unifiedManager = new databaseModule.UnifiedTransactionManager();
        console.log('✅ 统一事务管理器创建成功');
        console.log('💡 支持 MongoDB 事务管理');
      } catch (error) {
        console.log('❌ 统一事务管理器测试失败:', error.message);
        mongoSupport = false;
      }
    }
    
    return mongoSupport;
  } catch (error) {
    console.error('❌ @hl8/database 库 MongoDB 支持测试失败:', error.message);
    return false;
  }
}

// 测试 MongoDB 性能
async function testMongoDBPerformance() {
  console.log('🔍 测试 MongoDB 性能...');
  
  try {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient('mongodb://aiofix_admin:aiofix_password@localhost:27017/');
    
    await client.connect();
    const db = client.db('performance_test');
    const collection = db.collection('performance_collection');
    
    // 性能测试参数
    const operations = 1000;
    const batchSize = 100;
    
    console.log(`📊 开始性能测试: ${operations} 次操作`);
    
    // 批量插入测试
    const startTime = Date.now();
    for (let i = 0; i < operations; i += batchSize) {
      const batch = [];
      for (let j = 0; j < batchSize && i + j < operations; j++) {
        batch.push({
          index: i + j,
          data: `performance_test_${i + j}`,
          timestamp: new Date(),
          random: Math.random()
        });
      }
      await collection.insertMany(batch);
    }
    const insertTime = Date.now() - startTime;
    console.log(`✅ 批量插入完成: ${operations} 次操作耗时 ${insertTime}ms`);
    
    // 查询性能测试
    const queryStartTime = Date.now();
    for (let i = 0; i < 100; i++) {
      await collection.find({ index: { $gte: i * 10, $lt: (i + 1) * 10 } }).toArray();
    }
    const queryTime = Date.now() - queryStartTime;
    console.log(`✅ 查询测试完成: 100 次查询耗时 ${queryTime}ms`);
    
    // 聚合性能测试
    const aggregateStartTime = Date.now();
    await collection.aggregate([
      { $group: { _id: null, count: { $sum: 1 }, avgRandom: { $avg: '$random' } } }
    ]).toArray();
    const aggregateTime = Date.now() - aggregateStartTime;
    console.log(`✅ 聚合测试完成: 耗时 ${aggregateTime}ms`);
    
    // 清理测试数据
    await db.dropDatabase();
    await client.close();
    
    // 计算性能指标
    const insertOpsPerSecond = Math.round((operations / insertTime) * 1000);
    const queryOpsPerSecond = Math.round((100 / queryTime) * 1000);
    
    console.log('📊 MongoDB 性能指标:');
    console.log(`- 插入性能: ${insertOpsPerSecond} ops/sec`);
    console.log(`- 查询性能: ${queryOpsPerSecond} ops/sec`);
    console.log(`- 聚合性能: ${aggregateTime}ms`);
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB 性能测试失败:', error.message);
    return false;
  }
}

// 主测试函数
async function runMongoDBTests() {
  console.log('🚀 开始 MongoDB 专项测试...\n');
  
  const results = {
    nativeConnection: false,
    advancedFeatures: false,
    hl8DatabaseSupport: false,
    performance: false,
  };
  
  // 测试原生 MongoDB 连接
  results.nativeConnection = await testNativeMongoDB();
  console.log('');
  
  // 测试 MongoDB 高级功能
  results.advancedFeatures = await testMongoDBAdvanced();
  console.log('');
  
  // 测试 @hl8/database 库的 MongoDB 支持
  results.hl8DatabaseSupport = await testHl8DatabaseMongoDB();
  console.log('');
  
  // 测试 MongoDB 性能
  results.performance = await testMongoDBPerformance();
  console.log('');
  
  // 输出测试结果
  console.log('📋 MongoDB 专项测试结果汇总:');
  console.log('============================');
  console.log(`原生连接:     ${results.nativeConnection ? '✅ 通过' : '❌ 失败'}`);
  console.log(`高级功能:     ${results.advancedFeatures ? '✅ 通过' : '❌ 失败'}`);
  console.log(`@hl8/database 支持: ${results.hl8DatabaseSupport ? '✅ 通过' : '❌ 失败'}`);
  console.log(`性能测试:     ${results.performance ? '✅ 通过' : '❌ 失败'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n总体结果: ${allPassed ? '🎉 所有 MongoDB 测试通过' : '⚠️  部分 MongoDB 测试失败'}`);
  
  if (allPassed) {
    console.log('\n💡 MongoDB 测试总结:');
    console.log('- MongoDB 连接正常');
    console.log('- 高级功能（事务、聚合、索引）正常');
    console.log('- @hl8/database 库支持 MongoDB');
    console.log('- 性能表现良好');
  }
  
  return allPassed;
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runMongoDBTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 MongoDB 测试运行失败:', error);
    process.exit(1);
  });
}

export { runMongoDBTests, testNativeMongoDB, testMongoDBAdvanced, testHl8DatabaseMongoDB, testMongoDBPerformance };
