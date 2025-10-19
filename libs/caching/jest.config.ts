import type { Config } from "jest";

const config: Config = {
  displayName: "@hl8/business-core",
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@hl8/isolation-model/index\\.js$":
      "<rootDir>/../../libs/isolation-model/dist/index.js",
    "^@hl8/(.*)$": "<rootDir>/../../libs/$1/src",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "NodeNext",
          moduleResolution: "NodeNext",
        },
      },
    ],
  },
  roots: ["<rootDir>/src"],
  testMatch: ["<rootDir>/src/**/*.spec.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
    "!src/**/*.d.ts",
    "!src/index.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 38,
      functions: 40,
      lines: 46,
      statements: 46,
    },
  },
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};

export default config;
