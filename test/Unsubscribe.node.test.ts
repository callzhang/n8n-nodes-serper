import { Unsubscribe } from '../nodes/Unsubscribe/Unsubscribe.node';

describe('Unsubscribe Node', () => {
	const unsubscribeNode = new Unsubscribe();

	describe('Node Description', () => {
		it('should have correct display name', () => {
			expect(unsubscribeNode.description.displayName).toBe('Unsubscribe');
		});

		it('should have correct name', () => {
			expect(unsubscribeNode.description.name).toBe('unsubscribe');
		});

		it('should be usable as a tool', () => {
			expect(unsubscribeNode.description.usableAsTool).toBe(true);
		});

		it('should have correct input/output configuration', () => {
			expect(unsubscribeNode.description.inputs).toHaveLength(1);
			expect(unsubscribeNode.description.outputs).toHaveLength(1);
		});

		it('should not require credentials', () => {
			expect(unsubscribeNode.description.credentials).toBeUndefined();
		});

		it('should have operation options', () => {
			const operationProperty = unsubscribeNode.description.properties?.find(
				(prop) => prop.name === 'operation',
			);
			expect(operationProperty).toBeDefined();
			expect(operationProperty?.options).toHaveLength(2);
		});
	});

	describe('Execute Function - Click Link Operation', () => {
		it('should execute click_link operation successfully', async () => {
			const mockExecuteFunctions = {
				getInputData: jest.fn(() => [{}]),
				getNodeParameter: jest.fn((name: string) => {
					if (name === 'operation') return 'click_link';
					if (name === 'url') return 'https://example.com/unsubscribe';
					return {};
				}),
				getNode: jest.fn(() => ({ name: 'Unsubscribe' })),
				continueOnFail: jest.fn(() => false),
				helpers: {
					requestWithAuthentication: {
						call: jest.fn(() => Promise.resolve({
							statusCode: 200,
							statusMessage: 'OK',
							headers: { 'content-type': 'text/html' },
							body: '<html><head><title>Unsubscribed Successfully</title></head><body>You have been unsubscribed</body></html>',
							request: { uri: { href: 'https://example.com/unsubscribe' }, redirects: [] }
						}))
					}
				}
			} as any;

			const result = await unsubscribeNode.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toMatchObject({
				success: true,
				operation: 'click_link',
				url: 'https://example.com/unsubscribe',
			});
		});

		it('should handle missing URL', async () => {
			const mockExecuteFunctions = {
				getInputData: jest.fn(() => [{}]),
				getNodeParameter: jest.fn((name: string) => {
					if (name === 'operation') return 'click_link';
					if (name === 'url') return '';
					return {};
				}),
				getNode: jest.fn(() => ({ name: 'Unsubscribe' })),
				continueOnFail: jest.fn(() => false),
			} as any;

			await expect(unsubscribeNode.execute.call(mockExecuteFunctions)).rejects.toThrow();
		});

		it('should handle HTTP errors', async () => {
			const mockExecuteFunctions = {
				getInputData: jest.fn(() => [{}]),
				getNodeParameter: jest.fn((name: string) => {
					if (name === 'operation') return 'click_link';
					if (name === 'url') return 'https://example.com/unsubscribe';
					return {};
				}),
				getNode: jest.fn(() => ({ name: 'Unsubscribe' })),
				continueOnFail: jest.fn(() => false),
				helpers: {
					requestWithAuthentication: {
						call: jest.fn(() => Promise.reject(new Error('Network error')))
					}
				}
			} as any;

			const result = await unsubscribeNode.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toMatchObject({
				success: false,
				operation: 'click_link',
				url: 'https://example.com/unsubscribe',
				result: {
					success: false,
					error: 'Network error',
				}
			});
		});
	});

	describe('Execute Function - Extract Links Operation', () => {
		it('should execute extract_links operation successfully', async () => {
			const mockExecuteFunctions = {
				getInputData: jest.fn(() => [{}]),
				getNodeParameter: jest.fn((name: string) => {
					if (name === 'operation') return 'extract_links';
					if (name === 'emailContent') return 'Click here to unsubscribe: https://example.com/unsubscribe or visit https://example.com/opt-out';
					return {};
				}),
				getNode: jest.fn(() => ({ name: 'Unsubscribe' })),
				continueOnFail: jest.fn(() => false),
			} as any;

			const result = await unsubscribeNode.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toMatchObject({
				success: true,
				operation: 'extract_links',
				links: expect.arrayContaining([
					'https://example.com/unsubscribe',
					'https://example.com/opt-out'
				]),
				totalFound: 2,
			});
		});

		it('should handle missing email content', async () => {
			const mockExecuteFunctions = {
				getInputData: jest.fn(() => [{}]),
				getNodeParameter: jest.fn((name: string) => {
					if (name === 'operation') return 'extract_links';
					if (name === 'emailContent') return '';
					return {};
				}),
				getNode: jest.fn(() => ({ name: 'Unsubscribe' })),
				continueOnFail: jest.fn(() => false),
			} as any;

			await expect(unsubscribeNode.execute.call(mockExecuteFunctions)).rejects.toThrow();
		});

		it('should handle email content with no unsubscribe links', async () => {
			const mockExecuteFunctions = {
				getInputData: jest.fn(() => [{}]),
				getNodeParameter: jest.fn((name: string) => {
					if (name === 'operation') return 'extract_links';
					if (name === 'emailContent') return 'This is a regular email with no unsubscribe links.';
					return {};
				}),
				getNode: jest.fn(() => ({ name: 'Unsubscribe' })),
				continueOnFail: jest.fn(() => false),
			} as any;

			const result = await unsubscribeNode.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toMatchObject({
				success: true,
				operation: 'extract_links',
				links: [],
				totalFound: 0,
			});
		});
	});

	describe('Error Handling', () => {
		it('should handle errors with continue on fail', async () => {
			const mockExecuteFunctions = {
				getInputData: jest.fn(() => [{}]),
				getNodeParameter: jest.fn(() => {
					throw new Error('Parameter error');
				}),
				getNode: jest.fn(() => ({ name: 'Unsubscribe' })),
				continueOnFail: jest.fn(() => true),
			} as any;

			const result = await unsubscribeNode.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toMatchObject({
				success: false,
				error: expect.any(String),
			});
		});
	});
});