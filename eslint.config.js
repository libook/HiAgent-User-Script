import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';

/* eslint-disable sort-keys */
export default [
    {
        "name": 'app/files-to-lint',
        "files": ['**/*.{js,mjs}'],
    },

    {
        "name": 'app/files-to-ignore',
        "ignores": ['**/dist/**', '**/coverage/**'],
    },

    {
        "languageOptions": {
            "globals": {
                ...globals.browser, // 包含所有浏览器 DOM API
                ...globals.es2026,  // 包含 ES2021 全局对象
            },

            // 配置 ECMAScript 版本（可选）
            "ecmaVersion": "latest",
            "sourceType": "module", // 若使用 ES 模块（import/export），设为 "module"；普通脚本设为 "script"
        },
    },

    js.configs.recommended,
    stylistic.configs['all'],
    {
        "files": [
            "**/*.js",
        ],
        "rules": {
            // Disable stylistic rules, open as needed
            ...Object.fromEntries(
                Object.keys(stylistic.rules).map(rule => [
                    `@stylistic/${rule}`,
                    'off',
                ]),
            ),
            "camelcase": [
                "error",
            ],
            "default-case": [
                "error",
            ],
            "eqeqeq": [
                "error",
                "smart",
            ],
            "func-style": [
                "error",
                "expression",
                {
                    "allowArrowFunctions": true,
                },
            ],
            "indent": [
                "error",
                4, // eslint-disable-line no-magic-numbers
                {
                    "SwitchCase": 1,
                },
            ],
            "linebreak-style": [
                "error",
                "unix",
            ],
            "no-eval": [
                "error",
            ],
            "no-implicit-coercion": [
                "warn",
            ],
            "no-implied-eval": [
                "error",
            ],
            "no-magic-numbers": [
                "warn",
                {
                    "ignore": [
                        0, // judge length; first index of array;
                        1, // length -1 is the last index of array;
                    ],
                    "ignoreArrayIndexes": true,
                    "ignoreClassFieldInitialValues": true,
                    "ignoreDefaultValues": true,
                },
            ],
            "no-nested-ternary": [
                "error",
            ],
            "no-shadow": [
                "error",
            ],
            "no-throw-literal": [
                "warn",
            ],
            "no-unneeded-ternary": [
                "warn",
            ],
            "no-useless-call": [
                "warn",
            ],
            "no-useless-computed-key": [
                "warn",
            ],
            "no-useless-concat": [
                "warn",
            ],
            "no-useless-constructor": [
                "warn",
            ],
            "no-useless-rename": [
                "warn",
            ],
            "no-useless-return": [
                "warn",
            ],
            "no-var": [
                "error",
            ],
            "prefer-arrow-callback": [
                "warn",
            ],
            "prefer-const": [
                "error",
            ],
            "prefer-promise-reject-errors": [
                "error",
            ],
            "prefer-template": [
                "warn",
            ],
            "semi": [
                "error",
                "always",
            ],
            "sort-imports": [
                "warn",
                {
                    "ignoreCase": true,
                    "ignoreDeclarationSort": true,
                },
            ],
            "sort-keys": [
                "warn",
                "asc",
                {
                    "caseSensitive": false,
                    "natural": true,
                },
            ],
            "@stylistic/array-bracket-newline": [
                "warn",
                "consistent",
            ],
            "@stylistic/array-element-newline": [
                "warn",
                "consistent",
            ],
            "@stylistic/comma-dangle": [
                "warn",
                "always-multiline",
            ],
            "@stylistic/dot-location": [
                "warn",
                "property",
            ],
            "@stylistic/eol-last": [
                "warn",
                "always",
            ],
            "@stylistic/function-call-argument-newline": [
                "warn",
                "consistent",
            ],
            "@stylistic/function-paren-newline": [
                "warn",
                "consistent",
            ],
            "@stylistic/no-confusing-arrow": [
                "error",
                {
                    "allowParens": true,
                    "onlyOneSimpleParam": false,
                },
            ],
            "@stylistic/no-mixed-spaces-and-tabs": [
                "warn",
            ],
            "@stylistic/quote-props": [
                "warn",
                "always",
            ],
        },
    },
];
