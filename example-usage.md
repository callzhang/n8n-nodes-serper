# n8n Serper Node Usage Guide

## How to Use the Serper Node in n8n

### Step 1: Add the Serper Node
1. In your n8n workflow, click the "+" button to add a new node
2. Search for "Serper" in the node search
3. Select the "Serper" node

### Step 2: Configure Credentials
1. Click on the "Credentials" section in the node
2. Click "Create New" or select existing Serper API credentials
3. Enter your Serper API key (get it from https://serper.dev/)
4. Save the credentials

### Step 3: Configure the Node Parameters

#### Operation Field
- **Field Name**: Operation
- **Type**: Dropdown
- **Value**: Select "Search" from the dropdown
- **Description**: This determines what the node will do

#### Query Field (appears after selecting "Search" operation)
- **Field Name**: Query
- **Type**: Text input
- **Value**: Enter your search query (e.g., "artificial intelligence trends 2024")
- **Description**: The search query to execute

#### Additional Parameters (optional)
- **Number of Results**: How many results to return (1-100, default: 10)
- **Country**: Country code for localized results (e.g., "us", "uk", "ca")
- **Language**: Language code for results (e.g., "en", "es", "fr")
- **Safe Search**: Enable/disable safe search filtering

### Step 4: Example Configuration

```
Operation: Search
Query: "best programming languages 2024"
Number of Results: 10
Country: us
Language: en
Safe Search: off
```

### Step 5: Test the Node
1. Click "Execute Node" to test your configuration
2. Check the output to see the search results

## Troubleshooting

### Query Field Not Visible
If you don't see the Query field:
1. Make sure you've selected "Search" in the Operation dropdown
2. The Query field only appears when Operation is set to "Search"
3. Try refreshing the node or re-adding it to the workflow

### Common Issues
- **Missing API Key**: Make sure you've configured the Serper API credentials
- **Empty Query**: The query field cannot be empty
- **Invalid Parameters**: Check that number of results is between 1-100

## Output Format
The node returns structured data including:
- `organic`: Array of organic search results
- `peopleAlsoAsk`: Related questions
- `relatedSearches`: Related search suggestions
- `searchInformation`: Metadata about the search

## Using as AI Agent Tool
When using this node as a tool in n8n AI agent nodes:
1. The AI agent can automatically set the query based on user input
2. The structured output is optimized for AI processing
3. The node is marked as `usableAsTool: true` for AI agent compatibility
