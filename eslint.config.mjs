import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import jsxA11y from "eslint-plugin-jsx-a11y";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log("filename " + __filename + " dirname " + __dirname);
const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    ...compat.extends("plugin:@typescript-eslint/recommended"),
    {
        ignores: [
            "node_modules/**",
            ".next/**",
            "out/**",
            "build/**",
            "next-env.d.ts",
            "eslint.config.mjs"
        ],
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
        },
        rules: {
            semi: "warn",
            quotes: ["warn", "double"],
            "@typescript-eslint/switch-exhaustiveness-check": "error",
            ...jsxA11y.flatConfigs.recommended.rules,
        },
        
    }
];
export default eslintConfig;