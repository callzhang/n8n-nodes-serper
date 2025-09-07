import { Serper } from '../nodes/Serper/Serper.node';
import { IExecuteFunctions, INodeExecutionData, INodeTypeDescription } from 'n8n-workflow';

// Mock n8n-workflow functions
const mockExecuteFunctions = {
	getInputData: jest.fn(),
	getNodeParameter: jest.fn(),
	getCredentials: jest.fn(),
	continueOnFail: jest.fn(),
	helpers: {
		requestWithAuthentication: jest.fn(),
	},
} as unknown as IExecuteFunctions;

describe('Serper Node', () => {
	let serperNode: Serper;

	beforeEach(() => {
		serperNode = new Serper();
		jest.clearAllMocks();
	});

	describe('Node Description', () => {
		it('should have correct display name', () => {
			expect(serperNode.description.displayName).toBe('Serper');
		});

		it('should have correct name', () => {
			expect(serperNode.description.name).toBe('serper');
		});

		it('should be usable as tool', () => {
			expect(serperNode.description.usableAsTool).toBe(true);
		});

		it('should have correct inputs and outputs', () => {
			expect(serperNode.description.inputs).toHaveLength(1);
			expect(serperNode.description.outputs).toHaveLength(1);
		});

		it('should have required credentials', () => {
			expect(serperNode.description.credentials).toHaveLength(1);
			expect(serperNode.description.credentials?.[0].name).toBe('serperApi');
			expect(serperNode.description.credentials?.[0].required).toBe(true);
		});
	});

	describe('Execute Function', () => {
		beforeEach(() => {
			(mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue([
				{ json: { test: 'data' } }
			]);
			(mockExecuteFunctions.getNodeParameter as jest.Mock).mockImplementation((param, index) => {
				const params: Record<string, any> = {
					operation: 'search',
					query: 'test query',
					num: 10,
					gl: 'us',
					hl: 'en',
					safe: 'off'
				};
				return params[param];
			});
			(mockExecuteFunctions.getCredentials as jest.Mock).mockResolvedValue({
				apiKey: 'test-api-key'
			});
			(mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(false);
		});

		it('should execute search operation successfully', async () => {
			const mockResponse = {
				organic: [
					{
						title: 'Test Result',
						link: 'https://example.com',
						snippet: 'Test snippet'
					}
				],
				peopleAlsoAsk: [],
				relatedSearches: [],
				searchInformation: {
					totalResults: '1'
				}
			};

			(mockExecuteFunctions.helpers.requestWithAuthentication as jest.Mock).mockResolvedValue(mockResponse);

			const result = await serperNode.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toMatchObject({
				query: 'test query',
				searchParameters: {
					num: 10,
					gl: 'us',
					hl: 'en',
					safe: 'off'
				},
				organic: mockResponse.organic,
				peopleAlsoAsk: mockResponse.peopleAlsoAsk,
				relatedSearches: mockResponse.relatedSearches,
				searchInformation: mockResponse.searchInformation
			});
		});

		it('should handle missing query parameter', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock).mockImplementation((param) => {
				if (param === 'query') return '';
				return 'search';
			});

			await expect(serperNode.execute.call(mockExecuteFunctions)).rejects.toThrow();
		});

		it('should handle missing API key', async () => {
			(mockExecuteFunctions.getCredentials as jest.Mock).mockResolvedValue({});

			await expect(serperNode.execute.call(mockExecuteFunctions)).rejects.toThrow();
		});

		it('should handle API request failure', async () => {
			(mockExecuteFunctions.helpers.requestWithAuthentication as jest.Mock).mockRejectedValue(
				new Error('API Error')
			);

			await expect(serperNode.execute.call(mockExecuteFunctions)).rejects.toThrow('API Error');
		});

		it('should handle continue on fail', async () => {
			(mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(true);
			(mockExecuteFunctions.helpers.requestWithAuthentication as jest.Mock).mockRejectedValue(
				new Error('API Error')
			);

			const result = await serperNode.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toMatchObject({
				error: 'API Error'
			});
		});

		it('should limit num parameter to valid range', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock).mockImplementation((param) => {
				const params: Record<string, any> = {
					operation: 'search',
					query: 'test query',
					num: 150, // Invalid value
					gl: 'us',
					hl: 'en',
					safe: 'off'
				};
				return params[param];
			});

			const mockResponse = { organic: [] };
			(mockExecuteFunctions.helpers.requestWithAuthentication as jest.Mock).mockResolvedValue(mockResponse);

			await serperNode.execute.call(mockExecuteFunctions);

			expect(mockExecuteFunctions.helpers.requestWithAuthentication).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({
					body: expect.objectContaining({
						num: 100 // Should be limited to 100
					})
				})
			);
		});
	});

	describe('Request Body Validation', () => {
		beforeEach(() => {
			(mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue([
				{ json: { test: 'data' } }
			]);
			(mockExecuteFunctions.getCredentials as jest.Mock).mockResolvedValue({
				apiKey: 'test-api-key'
			});
			(mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(false);
		});

		it('should send correct request body to Serper API', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock).mockImplementation((param) => {
				const params: Record<string, any> = {
					operation: 'search',
					query: 'test search',
					num: 5,
					gl: 'uk',
					hl: 'en',
					safe: 'active'
				};
				return params[param];
			});

			(mockExecuteFunctions.helpers.requestWithAuthentication as jest.Mock).mockResolvedValue({});

			await serperNode.execute.call(mockExecuteFunctions);

			expect(mockExecuteFunctions.helpers.requestWithAuthentication).toHaveBeenCalledWith(
				'serperApi',
				expect.objectContaining({
					method: 'POST',
					url: 'https://google.serper.dev/search',
					headers: {
						'Content-Type': 'application/json'
					},
					body: {
						q: 'test search',
						num: 5,
						gl: 'uk',
						hl: 'en',
						safe: 'active'
					},
					json: true
				})
			);
		});
	});
});
