import type { Config } from "jest";

const config: Config = {
  displayName: "@hl8/pure-logger",
  preset: "ts-jest/presets/default-esm",
  testMatch: ["<rootDir>/src/**/*.spec.ts", "<rootDir>/src/**/*.test.ts"],
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "<rootDir>/tsconfig.test.json",
      },
    ],
  },
  transformIgnorePatterns: ["node_modules/(?!(.*\\.mjs$))"],
  moduleNameMapper: {
    "^@hl8/pure-logger$": "<rootDir>/src/index.ts",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testEnvironment: "node",
};

export default config;
