/**
 * MCP Help Handler
 * Single responsibility: handle help documentation requests
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { MCPValidationError, MCPErrorCodes } from '../../infrastructure/errors';

// Map of available help topics to their filenames
const HELP_FILES: Record<string, string> = {
  'SCHEMA': 'SCHEMA.md',
  'SCHEMA.design': 'SCHEMA.design.md',
  'SCHEMA.project': 'SCHEMA.project.md',
  'SCHEMA.testing': 'SCHEMA.testing.md',
  'SCHEMA.research': 'SCHEMA.research.md',
  'SCHEMA.tasks': 'SCHEMA.tasks.md',
};

export class McpHelpHandler {

  /**
   * Get help documentation for a topic
   */
  async handleHelp(topic: string = 'SCHEMA'): Promise<{
    topic: string;
    content: string;
  }> {

    // Normalize topic - support both "tasks" and "SCHEMA.tasks"
    let normalizedTopic: string;

    if (topic.includes('.')) {
      // Full format: "SCHEMA.tasks" → "SCHEMA.tasks"
      normalizedTopic = topic.split('.').map((part, i) => i === 0 ? part.toUpperCase() : part.toLowerCase()).join('.');
    } else if (topic.toUpperCase() === 'SCHEMA') {
      // Just "SCHEMA" → "SCHEMA"
      normalizedTopic = 'SCHEMA';
    } else {
      // Short format: "tasks" → "SCHEMA.tasks"
      normalizedTopic = `SCHEMA.${topic.toLowerCase()}`;
    }

    // Check if topic exists
    const fileName = HELP_FILES[normalizedTopic];
    if (!fileName) {
      const available = Object.keys(HELP_FILES).join(', ');
      throw new MCPValidationError(
        `Unknown help topic: ${topic}. Available topics: ${available}`,
        MCPErrorCodes.INVALID_REQUEST,
        { topic, available: Object.keys(HELP_FILES) }
      );
    }

    // Read help file - resolve from dist/help in production, src/help in dev
    // Try dist/help first (production), fall back to src/help (dev)
    let filePath = path.join(process.cwd(), 'dist', 'help', fileName);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), 'src', 'help', fileName);
    }

    if (!fs.existsSync(filePath)) {
      throw new MCPValidationError(
        `Help file not found: ${fileName}`,
        MCPErrorCodes.RESOURCE_NOT_FOUND,
        { topic, fileName }
      );
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    return {
      topic: normalizedTopic,
      content
    };
  }

  /**
   * List all available help topics
   */
  async listTopics(): Promise<string[]> {
    return Object.keys(HELP_FILES);
  }
}
