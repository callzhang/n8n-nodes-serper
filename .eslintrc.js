module.exports = {
	extends: ['eslint:recommended'],
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	rules: {
		'no-unused-vars': 'warn',
		'no-console': 'warn',
	},
	env: {
		node: true,
		es6: true,
	},
};
