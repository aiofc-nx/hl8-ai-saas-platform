/** @type {import('jest').Config} */
module.exports = {
  displayName: 'interface-kernel',
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { 
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: false,
      isolatedModules: true
    }]
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: '../../coverage/libs/interface-kernel',
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts'
  ],
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/src/**/*.test.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    '^@hl8/domain-kernel$': '<rootDir>/../../libs/domain-kernel/src/index.ts',
    '^@hl8/application-kernel$': '<rootDir>/../../libs/application-kernel/src/index.ts',
    '^@hl8/infrastructure-kernel$': '<rootDir>/../../libs/infrastructure-kernel/src/index.ts'
  },
  testTimeout: 10000,
  // 强制 Jest 在测试完成后退出
  forceExit: true,
  // 检测未关闭的句柄
  detectOpenHandles: true,
  // 静默模式，减少输出
  verbose: false,
  // 清理模拟和定时器
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true
};