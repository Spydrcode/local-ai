# Local AI MCP Server

MCP (Model Context Protocol) server with specialized AI agents for the LocalIQ sales demo tool.

## Overview

This MCP server exposes 6 specialized AI agents as tools that can be used by any MCP client (GitHub Copilot, Claude Desktop, etc.):

- **SiteAnalysisAgent**: Analyzes websites to extract detailed business intelligence (exact sub-niche, differentiators, target audience)
- **ProfitIQAgent**: Generates hyper-specific business insights with competitive analysis and actionable recommendations
- **HomepageDesignAgent**: Creates custom homepage blueprints with industry-specific colors and conversion-optimized sections
- **ContentGenerationAgent**: Generates social media posts and SEO-optimized blog content (500-700 words)
- **ChatbotConfigAgent**: Builds complete chatbot configurations with personality, FAQs, and escalation rules

**🎯 All agents enforce business-specific differentiation** using enhanced prompts that:

- Identify exact business sub-niches (not just "restaurant" but "Texas BBQ catering operation")
- Avoid generic advice and templates
- Reference actual products/services by name
- Include industry-specific metrics and comparisons
- Match appropriate brand voice and positioning

## Installation

```bash
cd mcp-server
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Add your OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY=sk-...
   ```

## Development

Build the server:

```bash
npm run build
```

Watch mode (auto-rebuild on changes):

```bash
npm run dev
```

## Usage

### With VS Code GitHub Copilot

Add to your `.vscode/mcp.json`:

```json
{
  "servers": {
    "local-ai-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["c:\\Users\\dusti\\git\\local.ai\\mcp-server\\dist\\index.js"]
    }
  }
}
```

### With Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "local-ai-mcp": {
      "command": "node",
      "args": ["c:\\Users\\dusti\\git\\local.ai\\mcp-server\\dist\\index.js"]
    }
  }
}
```

## Available Tools

### analyze_site

Analyzes a website URL to extract business information, services, and unique value propositions.

**Parameters:**

- `url` (string, required): The website URL to analyze

### generate_profit_insights

Generates business-specific insights including sub-niche identification, competitive analysis, and action items.

**Parameters:**

- `businessInfo` (string, required): Business description and details
- `industry` (string, optional): Industry category

### design_homepage

Creates a custom homepage blueprint with industry-specific colors, layout recommendations, and content sections.

**Parameters:**

- `businessInfo` (string, required): Business details
- `differentiators` (string, required): Unique selling points

### generate_social_post

Creates platform-specific social media posts.

**Parameters:**

- `businessInfo` (string, required): Business context
- `platform` (string, required): "facebook" | "twitter" | "linkedin" | "instagram"
- `topic` (string, optional): Specific topic or angle

### generate_blog_post

Generates SEO-optimized blog content.

**Parameters:**

- `businessInfo` (string, required): Business context
- `topic` (string, required): Blog post topic
- `keywords` (string[], optional): Target SEO keywords

### build_chatbot_config

Creates a chatbot configuration including personality, FAQs, and escalation rules.

**Parameters:**

- `businessInfo` (string, required): Business details
- `tone` (string, optional): Chatbot personality ("professional" | "friendly" | "casual")

## Architecture

```
mcp-server/
├── src/
│   ├── index.ts           # Main MCP server entry point
│   ├── agents/            # AI agent implementations
│   │   ├── SiteAnalysisAgent.ts
│   │   ├── ProfitIQAgent.ts
│   │   ├── HomepageDesignAgent.ts
│   │   ├── ContentGenerationAgent.ts
│   │   └── ChatbotConfigAgent.ts
│   └── config/
│       └── openai.ts      # OpenAI client configuration
├── dist/                  # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── .env                   # Environment variables (not in git)
```

## Development Notes

### AI Configuration

- **Models**: All agents use GPT-4 via OpenAI API
- **Temperature settings**:
  - ProfitIQ: 0.75 (balanced analysis)
  - Homepage Design: 0.8 (creative design)
  - Social Posts: 0.85 (engaging content)
  - Blog Posts: 0.75 (expertise + creativity)
  - Chatbot: 0.7 (personality + consistency)
- **MaxTokens**: 1200-1800 depending on agent (room for detailed outputs)

### Prompt Engineering

- All agents use enhanced prompts that enforce specificity
- Mandatory requirements for exact sub-niche identification
- Forbidden generic phrases and templates
- Industry-specific examples provided
- Competitive analysis required
- Voice markers for demonstrating expertise

### Transport

- Uses stdio transport for local VS Code/Copilot integration
- Handles errors gracefully with descriptive messages
- JSON response format where appropriate

### Synced with Main API

The MCP agents are synchronized with `/pages/api/generate-demo.ts` and use the same enhanced prompts from `lib/prompts.ts` for consistency across the application.

## Troubleshooting

**Server not showing in VS Code:**

1. Ensure `npm run build` was successful
2. Check that `.vscode/mcp.json` has the correct absolute path
3. Restart VS Code after modifying `mcp.json`
4. Check VS Code Output panel (View > Output, select "MCP")

**OpenAI API errors:**

1. Verify `OPENAI_API_KEY` is set in `.env`
2. Check API key has sufficient credits
3. Review rate limits if seeing 429 errors

**Build errors:**

1. Run `npm install` to ensure all dependencies are installed
2. Check TypeScript version: `npx tsc --version`
3. Delete `dist/` and `node_modules/`, then rebuild
