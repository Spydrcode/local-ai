# MCP Server Setup

## Connect to Claude Desktop

1. **Build the MCP server:**
   ```bash
   cd mcp-server
   npm install
   npm run build
   ```

2. **Find Claude Desktop config location:**
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`

3. **Add this to your Claude Desktop config:**
   ```json
   {
     "mcpServers": {
       "local-ai": {
         "command": "node",
         "args": ["C:\\Users\\dusti\\git\\local.ai\\mcp-server\\dist\\index.js"],
         "env": {
           "OPENAI_API_KEY": "your-actual-openai-key"
         }
       }
     }
   }
   ```

4. **Restart Claude Desktop**

5. **Test in Claude:**
   - Type: "Use the analyze_site tool on https://example.com"
   - Claude will now have access to your 9 MCP tools

## Available Tools

- `analyze_site` - Analyze website and extract business info
- `generate_profit_insights` - Generate profit optimization insights
- `design_homepage` - Design homepage layouts
- `generate_social_post` - Create social media content
- `generate_blog_post` - Write blog posts
- `build_chatbot_config` - Configure chatbot settings
- `analyze_strategy` - Porter's Five Forces analysis
- `generate_swot` - SWOT analysis
- `generate_quick_wins` - Quick win recommendations

## Connect to Other Clients

### VS Code (Continue extension)
Add to `~/.continue/config.json`:
```json
{
  "mcpServers": {
    "local-ai": {
      "command": "node",
      "args": ["C:\\Users\\dusti\\git\\local.ai\\mcp-server\\dist\\index.js"]
    }
  }
}
```

### Custom Client
```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['C:\\Users\\dusti\\git\\local.ai\\mcp-server\\dist\\index.js']
});

const client = new Client({ name: 'my-client', version: '1.0.0' }, { capabilities: {} });
await client.connect(transport);

// Use tools
const result = await client.callTool({
  name: 'analyze_site',
  arguments: { url: 'https://example.com' }
});
```
