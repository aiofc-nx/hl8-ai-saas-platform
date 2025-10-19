/**
 * 端到端测试设置
 *
 * @description 配置端到端测试环境，包括测试数据库、Redis连接等
 */

import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module.js";

/**
 * 全局测试应用实例
 */
export let app: INestApplication;

/**
 * 全局测试模块实例
 */
export let moduleFixture: TestingModule;

/**
 * 设置端到端测试环境
 */
beforeAll(async () => {
  moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  
  // 配置应用
  await app.init();
});

/**
 * 清理端到端测试环境
 */
afterAll(async () => {
  if (app) {
    await app.close();
  }
  if (moduleFixture) {
    await moduleFixture.close();
  }
});

/**
 * 获取测试应用实例
 */
export const getApp = (): INestApplication => app;

/**
 * 获取测试模块实例
 */
export const getModuleFixture = (): TestingModule => moduleFixture;
