// @ts-check
import path from "node:path";
import { fileURLToPath } from "node:url";

import { includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
import { flatConfigs as importPlugin } from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

export default tseslint.config(
  includeIgnoreFile(gitignorePath),
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  reactHooks.configs["recommended-latest"],
  // This package isn't typed properly
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  importPlugin.recommended,
  {
    rules: {
      "react-hooks/exhaustive-deps": [
        "warn",
        {
          additionalHooks:
            "(useEditorEffect|useLayoutGroupEffect|useClientLayoutEffect)$",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports" },
      ],
      "no-console": ["error", { allow: ["error"] }],
      "import/extensions": ["error", "ignorePackages"],
      "import/order": [
        "error",
        {
          alphabetize: {
            order: "asc",
          },
          groups: ["builtin", "external", "parent", "sibling", "index"],
          "newlines-between": "always",
          warnOnUnassignedImports: true,
        },
      ],
      "sort-imports": [
        "error",
        {
          allowSeparatedGroups: true,
          ignoreDeclarationSort: true,
        },
      ],
      "import/no-unresolved": "off", // Typescript does this better!
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    // @ts-expect-error This package isn't typed properly
    extends: [importPlugin.typescript],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            "eslint.config.js",
            "vite.config.ts",
            "lint-staged.config.js",
            "demo/main.tsx",
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    plugins: {
      react,
    },
    settings: {
      // "import/extensions": [".js", ".jsx", ".ts", ".tsx"],
      // "import/external-module-folders": ["node_modules"],
      // "import/parsers": {
      //   "@typescript-eslint/parser": [".ts", ".tsx"],
      // },
      react: {
        version: "detect",
      },
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: react.configs.recommended.rules,
  },
);
