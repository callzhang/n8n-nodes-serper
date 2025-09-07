import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

export class Unsubscribe implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Unsubscribe',
		name: 'unsubscribe',
		icon: 'file:unsubscribe.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["url"]}}',
		description: 'Click unsubscribe links and get webpage information',
		defaults: {
			name: 'Unsubscribe',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Click Unsubscribe Link',
						value: 'click_link',
						description: 'Click an unsubscribe link and get webpage info',
						action: 'Click unsubscribe link',
					},
					{
						name: 'Extract Links from Email',
						value: 'extract_links',
						description: 'Extract unsubscribe links from email content',
						action: 'Extract unsubscribe links',
					},
				],
				default: 'click_link',
			},
			{
				displayName: 'Unsubscribe URL',
				name: 'url',
				type: 'string',
				default: '',
				placeholder: 'https://example.com/unsubscribe',
				description: 'The unsubscribe URL to click',
				displayOptions: {
					show: {
						operation: ['click_link'],
					},
				},
			},
			{
				displayName: 'Email Content',
				name: 'emailContent',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: '',
				placeholder: 'Paste email content here...',
				description: 'Email content to extract unsubscribe links from',
				displayOptions: {
					show: {
						operation: ['extract_links'],
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

				if (operation === 'click_link') {
					const url = this.getNodeParameter('url', i) as string;

					if (!url) {
						throw new NodeOperationError(this.getNode(), 'URL is required for click_link operation');
					}

					// Click the unsubscribe link and get webpage info
					try {
						const response = await this.helpers.requestWithAuthentication.call(
							this,
							'httpBasicAuth',
							{
								method: 'GET',
								url: url,
								headers: {
									'User-Agent': 'Mozilla/5.0 (compatible; n8n-unsubscribe-bot)',
									'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
									'Accept-Language': 'en-US,en;q=0.5',
									'Accept-Encoding': 'gzip, deflate',
									'Connection': 'keep-alive',
								},
								timeout: 30000,
								followRedirect: true,
								resolveWithFullResponse: true,
							},
						);

						// Extract title from HTML
						const titleMatch = response.body.match(/<title[^>]*>([^<]*)<\/title>/i);
						const title = titleMatch ? titleMatch[1].trim() : 'No title found';

						// Check for unsubscribe confirmation
						const confirmationKeywords = [
							'unsubscribed',
							'unsubscribe successful',
							'successfully unsubscribed',
							'removed from mailing list',
							'no longer receive',
							'opt-out successful',
							'cancelled subscription',
						];
						const lowerContent = response.body.toLowerCase();
						const hasUnsubscribeConfirmation = confirmationKeywords.some(keyword => lowerContent.includes(keyword));

						// Extract webpage information
						const webpageInfo = {
							statusCode: response.statusCode,
							statusMessage: response.statusMessage,
							headers: response.headers,
							url: response.request?.uri?.href || url,
							finalUrl: response.request?.uri?.href || url,
							contentType: response.headers['content-type'] || 'unknown',
							contentLength: response.headers['content-length'] || 'unknown',
							title,
							hasUnsubscribeConfirmation,
							redirects: response.request?.redirects || [],
						};

						returnData.push({
							json: {
								success: true,
								operation: 'click_link',
								url,
								result: {
									success: true,
									webpageInfo,
									message: `Successfully accessed unsubscribe page. Status: ${response.statusCode}`,
								},
								timestamp: new Date().toISOString(),
							},
							pairedItem: { item: i },
						});
					} catch (error) {
						returnData.push({
							json: {
								success: false,
								operation: 'click_link',
								url,
								result: {
									success: false,
									error: (error as Error).message,
									message: `Failed to access unsubscribe URL: ${url}`,
								},
								timestamp: new Date().toISOString(),
							},
							pairedItem: { item: i },
						});
					}
				} else if (operation === 'extract_links') {
					const emailContent = this.getNodeParameter('emailContent', i) as string;

					if (!emailContent) {
						throw new NodeOperationError(this.getNode(), 'Email content is required for extract_links operation');
					}

					// Extract unsubscribe links from email content
					const urlPatterns = [
						// Direct unsubscribe URLs
						/(https?:\/\/[^\s<>"]*unsubscribe[^\s<>"]*)/gi,
						// Opt-out URLs
						/(https?:\/\/[^\s<>"]*opt[_-]?out[^\s<>"]*)/gi,
						// Remove URLs
						/(https?:\/\/[^\s<>"]*remove[^\s<>"]*)/gi,
						// Cancel URLs
						/(https?:\/\/[^\s<>"]*cancel[^\s<>"]*)/gi,
						// Stop URLs
						/(https?:\/\/[^\s<>"]*stop[^\s<>"]*)/gi,
						// Generic email service unsubscribe patterns
						/(https?:\/\/[^\s<>"]*mail[^\s<>"]*unsubscribe[^\s<>"]*)/gi,
					];

					const allUrls: string[] = [];
					urlPatterns.forEach(pattern => {
						const matches = emailContent.match(pattern) || [];
						allUrls.push(...matches);
					});

					// Remove duplicates and clean URLs
					const links = [...new Set(allUrls)].map(url => url.trim());

					returnData.push({
						json: {
							success: true,
							operation: 'extract_links',
							links,
							totalFound: links.length,
							timestamp: new Date().toISOString(),
						},
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { 
							success: false,
							error: (error as Error).message,
							timestamp: new Date().toISOString(),
						},
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
