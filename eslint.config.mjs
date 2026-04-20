import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored third-party bundle (minified, not our code).
    "lib/pretext.js",
  ]),
  // Honor the `_` prefix convention for intentionally unused args /
  // vars / caught errors. 64 of the 78 warnings on the 2026-04-18
  // lint run were `_foo is defined but never used` on params that
  // were explicitly prefixed to signal "don't use me." Flipping the
  // ignore pattern silences the intended noise without hiding real
  // unused-code bugs (which would not be prefixed).
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;
