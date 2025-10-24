import nest from "../../packages/eslint-config/eslint-nest.config.mjs";

export default [
  ...nest,
  {
    ignores: ["jest.config.ts", "dist/**", "coverage/**"],
  },
  {
    files: ["**/*.ts"],
    ignores: ["**/*.spec.ts", "**/*.test.ts"],
    rules: {
      // SAAS Core specific rules for production code
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "prefer-const": "error",
      "no-var": "error",
    },
  },
  {
    files: ["**/*.spec.ts", "**/*.test.ts"],
    rules: {
      // Test files specific rules
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "prefer-const": "off",
      "no-console": "off",
    },
  },
];
