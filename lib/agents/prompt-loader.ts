import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

let promptsCache: Record<string, string> | null = null;

export function getAgentPrompt(agentName: string): string {
  if (!promptsCache) {
    try {
      const promptsPath = path.join(process.cwd(), 'lib', 'agents', 'prompts.yaml');
      const promptsFile = fs.readFileSync(promptsPath, 'utf8');
      promptsCache = yaml.load(promptsFile) as Record<string, string>;
    } catch (error) {
      console.error('Failed to load prompts.yaml:', error);
      return `You are a ${agentName} providing strategic business analysis.`;
    }
  }

  return promptsCache[agentName] || `You are a ${agentName} providing strategic business analysis.`;
}