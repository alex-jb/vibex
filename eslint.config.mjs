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
    // Demo recorder + asset-gen scripts: Playwright/puppeteer helper
    // noise (unused vars, no-unused-expressions), not production code.
    "scripts/**",
    // Playwright e2e specs: structural step-fixture vars surface
    // as unused; not real dead code.
    "e2e/**",
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
      // React 19 / react-compiler activated this rule aggressively via the
      // eslint-config-next 16.2.4 bump (2026-04-22). It flags legitimate
      // patterns in this codebase: URL-parsing on mount, reset-on-prop-change
      // animation state, `useEffect(() => { fetchOnce(); }, [])` mount fetches.
      // Demoting to warn keeps visibility without blocking CI. Re-promote to
      // error after a dedicated pass refactors the 11 call sites to the
      // adjust-state-on-prop-change or useState-initializer patterns.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
