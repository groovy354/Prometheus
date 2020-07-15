module.exports = {
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "jsdoc"],
	extends: [
		// "plugin:@typescript-eslint/recommended",
		// "plugin:jsdoc/recommended",
	],
	parserOptions: {
		sourceType: "module",
		ecmaFeatures: {
			modules: true,
		},
	},
	rules: {
		"jsdoc/require-jsdoc": [
			"error",
			{
				contexts: ["ClassProperty"],
				require: {
					ClassExpression: true,
					ClassDeclaration: true,
					MethodDefinition: true,
				},
			},
		],
		"jsdoc/require-param-type": 0,
		"jsdoc/require-param-description": 1,
		"jsdoc/require-description": 2,
	},
	settings: { jsdoc: { mode: "typescript" } },
};
