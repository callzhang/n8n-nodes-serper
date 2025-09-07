module.exports = {
	extends: ['@n8n_io/eslint-config/node'],
	parserOptions: {
		project: './tsconfig.json',
		tsconfigRootDir: __dirname,
	},
	rules: {
		'n8n-nodes-base/node-dirname-against-convention': 'error',
		'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'error',
		'n8n-nodes-base/node-class-description-outputs-wrong': 'error',
		'n8n-nodes-base/node-execute-block-double-assertion-for-items': 'error',
		'n8n-nodes-base/node-execute-block-missing-continue-on-fail': 'error',
		'n8n-nodes-base/node-class-description-icon-not-svg': 'error',
	},
};
