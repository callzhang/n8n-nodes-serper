// Jest setup file for n8n-nodes-serper tests

// Mock n8n-workflow module
jest.mock('n8n-workflow', () => ({
	IExecuteFunctions: {},
	INodeExecutionData: {},
	INodeType: {},
	INodeTypeDescription: {},
	NodeOperationError: class extends Error {
		constructor(node: any, message: string) {
			super(message);
			this.name = 'NodeOperationError';
		}
	},
	NodeConnectionType: {
		Main: 'main',
	},
}));

// Global test setup
beforeAll(() => {
	// Set up any global test configuration
});

afterAll(() => {
	// Clean up any global test configuration
});
