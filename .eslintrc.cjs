module.exports = {
	env: {
		browser: true,
		commonjs: true,
		es2021: true,
		node: true
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:prettier/recommended"
	],
	overrides: [],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: "latest"
	},
	plugins: ["@typescript-eslint"],
	rules: {
		indent: ["error", "tab"],
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/no-explicit-any": "off",
		"linebreak-style": ["error", "windows"],
		quotes: ["error", "double"],
		semi: ["error", "always"],
		"no-empty-function": "off",
		"@typescript-eslint/consistent-type-imports": "warn",
		"@typescript-eslint/no-empty-function": "off"
	}
};
