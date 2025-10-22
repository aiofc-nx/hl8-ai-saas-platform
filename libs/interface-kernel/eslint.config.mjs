import nest from "../../packages/eslint-config/eslint-nest.config.mjs";

export default [
  ...nest,
  {
    ignores: ["**/*.spec.ts", "**/*.test.ts"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
      },
    },
  },
];
