import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SerperApi implements ICredentialType {
	name = 'serperApi';
	displayName = 'Serper API';
	documentationUrl = 'https://serper.dev/docs';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Your Serper API key. Get it from https://serper.dev/',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-KEY': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://google.serper.dev',
			url: '/search',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				q: 'test',
				num: 1,
			},
		},
	};
}
