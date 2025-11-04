/**
 * ReAct Framework Implementation
 * Reasoning and Acting framework for iterative agent problem solving
 */

import { createChatCompletion } from "../openai";

export interface ReActStep {
  thought: string;
  action: string;
  actionInput: any;
  observation: string;
}

export interface ReActResult {
  steps: ReActStep[];
  finalAnswer: any;
  success: boolean;
  iterations: number;
}

export interface Tool {
  name: string;
  description: string;
  execute: (input: any) => Promise<any>;
}

export class ReActAgent {
  private tools: Map<string, Tool> = new Map();
  private maxIterations: number = 5;

  constructor(tools: Tool[], maxIterations = 5) {
    tools.forEach(tool => this.tools.set(tool.name, tool));
    this.maxIterations = maxIterations;
  }

  async solve(prompt: string, systemPrompt?: string): Promise<ReActResult> {
    const steps: ReActStep[] = [];
    let iteration = 0;

    const toolDescriptions = Array.from(this.tools.values())
      .map(tool => `${tool.name}: ${tool.description}`)
      .join('\n');

    const reactPrompt = `${systemPrompt || 'You are a helpful assistant.'}

Available tools:
${toolDescriptions}

Use this format:
Thought: [your reasoning about what to do next]
Action: [tool name or "Final Answer"]
Action Input: [input for the tool or your final response]
Observation: [result of the action]

Question: ${prompt}

Begin!`;

    let context = reactPrompt;

    while (iteration < this.maxIterations) {
      const response = await createChatCompletion({
        messages: [{ role: "user", content: context }],
        temperature: 0.7,
        maxTokens: 1000
      });

      const step = this.parseReActResponse(response);
      
      if (step.action === "Final Answer") {
        return {
          steps,
          finalAnswer: step.actionInput,
          success: true,
          iterations: iteration + 1
        };
      }

      // Execute tool
      const tool = this.tools.get(step.action);
      if (!tool) {
        step.observation = `Error: Tool '${step.action}' not found`;
      } else {
        try {
          const result = await tool.execute(step.actionInput);
          step.observation = JSON.stringify(result);
        } catch (error) {
          step.observation = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      }

      steps.push(step);
      context += `\n\nThought: ${step.thought}\nAction: ${step.action}\nAction Input: ${step.actionInput}\nObservation: ${step.observation}`;
      
      iteration++;
    }

    return {
      steps,
      finalAnswer: "Max iterations reached without final answer",
      success: false,
      iterations: this.maxIterations
    };
  }

  private parseReActResponse(response: string): ReActStep {
    const thoughtMatch = response.match(/Thought:\s*([\s\S]*?)(?=\nAction:|$)/);
    const actionMatch = response.match(/Action:\s*([\s\S]*?)(?=\nAction Input:|$)/);
    const inputMatch = response.match(/Action Input:\s*([\s\S]*?)(?=\nObservation:|$)/);

    return {
      thought: thoughtMatch?.[1]?.trim() || "No thought provided",
      action: actionMatch?.[1]?.trim() || "No action provided", 
      actionInput: inputMatch?.[1]?.trim() || "",
      observation: ""
    };
  }
}