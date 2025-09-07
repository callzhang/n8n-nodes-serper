# n8n-nodes-serper

A custom n8n node for Serper web search API that can be used as a tool in AI agent nodes.

## Features

- **Web Search**: Perform web searches using Serper's Google Search API
- **AI Agent Compatible**: Designed to work seamlessly with n8n's AI agent nodes
- **Configurable Parameters**: Customize search results, country, language, and safe search settings
- **Structured Output**: Returns formatted search results optimized for AI processing

## Installation

### From npm

```bash
npm install n8n-nodes-serper
```

### From source

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the package: `npm run build`
4. Copy the `dist` folder to your n8n custom nodes directory

## Setup

1. Get your Serper API key from [serper.dev](https://serper.dev/)
2. In n8n, add the Serper node to your workflow
3. Configure the Serper API credentials with your API key
4. Set your search parameters and query

## Usage

### Basic Search

1. Add the Serper node to your workflow
2. Configure the credentials with your Serper API key
3. Set the search query
4. Configure additional parameters as needed:
   - **Number of Results**: 1-100 (default: 10)
   - **Country**: Country code for localized results (default: us)
   - **Language**: Language code for results (default: en)
   - **Safe Search**: Enable/disable safe search filtering

### As an AI Agent Tool

The Serper node is designed to work as a tool in n8n's AI agent nodes. Simply add it to your agent workflow and the AI will be able to perform web searches as part of its toolset.

## Output Format

The node returns structured data including:

- **organic**: Array of organic search results
- **peopleAlsoAsk**: Related questions
- **relatedSearches**: Related search suggestions
- **searchInformation**: Metadata about the search

## API Reference

### Serper API

This node uses the [Serper API](https://serper.dev/docs) for web search functionality.

### Parameters

- `query` (required): The search query
- `num` (optional): Number of results (1-100, default: 10)
- `gl` (optional): Country code (default: us)
- `hl` (optional): Language code (default: en)
- `safe` (optional): Safe search setting (off/active, default: off)

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
git clone https://github.com/your-username/n8n-nodes-serper.git
cd n8n-nodes-serper
npm install
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Format

```bash
npm run format
```

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues and questions:
- Create an issue on GitHub
- Check the [Serper API documentation](https://serper.dev/docs)
- Visit the [n8n community forum](https://community.n8n.io/)
