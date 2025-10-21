import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: [
    "<rootDir>/src/**/*.spec.ts",
    "<rootDir>/src/**/*.test.ts",
    "<rootDir>/tests/**/*.spec.ts",
    "<rootDir>/tests/**/*.test.ts",
  ],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
    "!src/**/*.test.ts",
    "!src/**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          target: "es2020",
          moduleResolution: "node",
          allowImportingTsExtensions: false,
          noEmit: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    "^@hl8/application-kernel$": "<rootDir>/src/index.ts",
    "^@hl8/domain-kernel$": "<rootDir>/../domain-kernel/src/index.ts",
  },
  transformIgnorePatterns: ["node_modules/(?!(.*\\.mjs$))"],
};

export default config;
