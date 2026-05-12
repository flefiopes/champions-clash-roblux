/**
 * ESLint flat configuration for the backend API.
 * Uses TypeScript ESLint recommended rules with Prettier compatibility.
 *
 * @module eslint.config
 */
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: ["dist/", "node_modules/", "drizzle/", "*.config.*"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      // Désactiver les règles trop permissives
      "no-console": "off",
      "no-debugger": "warn",

      // TypeScript - Strict
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-nocheck": false,
          "ts-ignore": false,
          "ts-expect-error": false,
          "ts-check": false,
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/no-var-requires": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/prefer-optional-chain": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",

      // Bonnes pratiques
      "max-lines": ["warn", 400],
      "max-depth": ["warn", 4],
      "max-params": ["warn", 8],
      "no-var": "error",
      "prefer-const": "error",
      "eqeqeq": ["error", "always"],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      "no-alert": "warn",
      "no-promise-executor-return": "error",
      "no-unreachable-loop": "error",
      "no-unused-expressions": "error",
      "no-useless-catch": "error",
      "no-useless-escape": "error",
      "require-await": "error",
      "yoda": "error",

      // Bonnes pratiques objet/tableau
      "prefer-object-literal": "off",
      "object-shorthand": "error",
      "quote-props": ["error", "as-needed"],

      // Tableaux
      "no-array-constructor": "error",

      // Strings
      "quotes": ["error", "single"],
      "prefer-template": "error",

      // Regex
      "no-div-regex": "error",
      "no-empty-character-class": "error",
      "no-invalid-regexp": "error",
    },
  },
);
