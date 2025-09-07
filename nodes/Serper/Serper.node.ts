import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class Serper implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Serper',
		name: 'serper',
		icon: 'file:serper.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["query"]}}',
		description: 'Search the web using Serper API',
		defaults: {
			name: 'Serper',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'serperApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Search',
						value: 'search',
						description: 'Perform a web search',
						action: 'Search the web',
					},
				],
				default: 'search',
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				placeholder: 'Enter your search query',
				description: 'The search query to execute',
				displayOptions: {
					show: {
						operation: ['search'],
					},
				},
			},
			{
				displayName: 'Number of Results',
				name: 'num',
				type: 'number',
				default: 10,
				description: 'Number of search results to return (1-100)',
				displayOptions: {
					show: {
						operation: ['search'],
					},
				},
			},
			{
				displayName: 'Country',
				name: 'gl',
				type: 'string',
				default: 'us',
				description: 'Country code for localized results (e.g., us, uk, ca)',
				displayOptions: {
					show: {
						operation: ['search'],
					},
				},
			},
			{
				displayName: 'Language',
				name: 'hl',
				type: 'string',
				default: 'en',
				description: 'Language code for results (e.g., en, es, fr)',
				displayOptions: {
					show: {
						operation: ['search'],
					},
				},
			},
			{
				displayName: 'Safe Search',
				name: 'safe',
				type: 'options',
				options: [
					{
						name: 'Off',
						value: 'off',
					},
					{
						name: 'Active',
						value: 'active',
					},
				],
				default: 'off',
				description: 'Safe search filter',
				displayOptions: {
					show: {
						operation: ['search'],
					},
				},
			},
		],
		// This property makes the node usable as a tool in AI agent nodes
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const query = this.getNodeParameter('query', i) as string;

				if (!query) {
					throw new NodeOperationError(this.getNode(), 'Query parameter is required');
				}

				if (operation === 'search') {
					const num = this.getNodeParameter('num', i, 10) as number;
					const gl = this.getNodeParameter('gl', i, 'us') as string;
					const hl = this.getNodeParameter('hl', i, 'en') as string;
					const safe = this.getNodeParameter('safe', i, 'off') as string;

					const credentials = await this.getCredentials('serperApi');
					if (!credentials?.apiKey) {
						throw new NodeOperationError(this.getNode(), 'Serper API key is required');
					}

					const requestBody = {
						q: query,
						num: Math.min(Math.max(num, 1), 100), // Ensure between 1-100
						gl,
						hl,
						safe,
					};

					const response = await this.helpers.requestWithAuthentication.call(
						this,
						'serperApi',
						{
							method: 'POST',
							url: 'https://google.serper.dev/search',
							headers: {
								'Content-Type': 'application/json',
							},
							body: requestBody,
							json: true,
						},
					);

					// Format the response for better usability in AI agents
					const formattedResponse = {
						query: query,
						searchParameters: {
							num,
							gl,
							hl,
							safe,
						},
						organic: response.organic || [],
						peopleAlsoAsk: response.peopleAlsoAsk || [],
						relatedSearches: response.relatedSearches || [],
						searchInformation: response.searchInformation || {},
					};

					returnData.push({
						json: formattedResponse,
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});
				} else {
					throw error;
				}
			}
		}

		return [returnData];
	}
}
