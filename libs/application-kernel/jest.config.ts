import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/test"],
  testMatch: [
    "<rootDir>/src/**/*.spec.ts",
    "<rootDir>/src/**/*.test.ts",
    "<rootDir>/test/**/*.spec.ts",
    "<rootDir>/test/**/*.test.ts",
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
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    "^@hl8/application-kernel$": "<rootDir>/src/index.ts",
    "^@hl8/domain-kernel$": "<rootDir>/../domain-kernel/src/index.ts",
    "^@hl8/exceptions$": "<rootDir>/../exceptions/src/index.ts",
  },
  transformIgnorePatterns: ["node_modules/(?!(.*\\.mjs$))"],
};

export default config;
