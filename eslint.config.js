import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Hard rule: no Math.random() anywhere. Use src/sim/rng.ts (seeded mulberry32) instead.
      "no-restricted-properties": [
        "error",
        {
          object: "Math",
          property: "random",
          message:
            "Math.random() is banned. Use the seeded RNG in src/sim/rng.ts instead.",
        },
      ],
    },
  },
  {
    // Hard rule: src/sim/ is pure TypeScript. It must import nothing —
    // no npm packages (react, three, zustand, ...) and no DOM globals.
    // Only relative imports within src/sim/ itself are allowed.
    files: ["src/sim/**/*.{ts,tsx}"],
    ignores: ["src/sim/**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ImportDeclaration[source.value=/^(?!\\.)/]",
          message:
            "src/sim/ must not import external packages. It is pure TypeScript (no three, no react, no DOM). Only relative imports within src/sim/ are allowed.",
        },
      ],
      "no-restricted-globals": [
        "error",
        { name: "window", message: "src/sim/ must not touch the DOM." },
        { name: "document", message: "src/sim/ must not touch the DOM." },
        { name: "navigator", message: "src/sim/ must not touch the DOM." },
        { name: "localStorage", message: "src/sim/ must not touch the DOM." },
        { name: "sessionStorage", message: "src/sim/ must not touch the DOM." },
        { name: "fetch", message: "src/sim/ must not touch the DOM." },
        {
          name: "requestAnimationFrame",
          message: "src/sim/ must not touch the DOM.",
        },
      ],
    },
  },
);
