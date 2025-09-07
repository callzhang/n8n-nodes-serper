import { SerperApi } from '../credentials/SerperApi.credentials';

describe('SerperApi Credentials', () => {
	let credentials: SerperApi;

	beforeEach(() => {
		credentials = new SerperApi();
	});

	describe('Credentials Configuration', () => {
		it('should have correct name', () => {
			expect(credentials.name).toBe('serperApi');
		});

		it('should have correct display name', () => {
			expect(credentials.displayName).toBe('Serper API');
		});

		it('should have correct documentation URL', () => {
			expect(credentials.documentationUrl).toBe('https://serper.dev/docs');
		});

		it('should have API key property', () => {
			expect(credentials.properties).toHaveLength(1);
			expect(credentials.properties[0].name).toBe('apiKey');
			expect(credentials.properties[0].type).toBe('string');
			expect(credentials.properties[0].typeOptions?.password).toBe(true);
			expect(credentials.properties[0].default).toBe('');
		});

		it('should have correct API key description', () => {
			expect(credentials.properties[0].description).toBe('Your Serper API key. Get it from https://serper.dev/');
		});
	});

	describe('Authentication Configuration', () => {
		it('should have correct authentication type', () => {
			expect(credentials.authenticate.type).toBe('generic');
		});

		it('should have correct authentication headers', () => {
			expect(credentials.authenticate.properties.headers).toEqual({
				'X-API-KEY': '={{$credentials.apiKey}}'
			});
		});
	});

	describe('Test Configuration', () => {
		it('should have correct test request configuration', () => {
			expect(credentials.test.request.baseURL).toBe('https://google.serper.dev');
			expect(credentials.test.request.url).toBe('/search');
			expect(credentials.test.request.method).toBe('POST');
			expect(credentials.test.request.headers).toEqual({
				'Content-Type': 'application/json'
			});
			expect(credentials.test.request.body).toEqual({
				q: 'test',
				num: 1
			});
		});
	});
});
