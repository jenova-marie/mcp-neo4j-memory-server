/**
 * MCP Help Handler
 * Single responsibility: handle help documentation requests
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { MCPValidationError, MCPErrorCodes } from '../../infrastructure/errors';

// Get help directory from environment (set by entry point) or try common locations
const getHelpDirectory = (): string => {
  // First check if entry point set the help directory
  if (process.env.MCP_HELP_DIR && fs.existsSync(process.env.MCP_HELP_DIR)) {
    return process.env.MCP_HELP_DIR;
  }

  // Fallback to common locations
  const possiblePaths = [
    path.join(process.cwd(), 'dist', 'help'),
    path.join(process.cwd(), 'src', 'help'),
  ];

  for (const dir of possiblePaths) {
    if (fs.existsSync(dir)) {
      return dir;
    }
  }

  // Last fallback
  return path.join(process.cwd(), 'dist', 'help');
};

const HELP_DIR = getHelpDirectory();

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

    // Read help file from resolved help directory
    const filePath = path.join(HELP_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      throw new MCPValidationError(
        `Help file not found: ${fileName} (searched in: ${HELP_DIR})`,
        MCPErrorCodes.RESOURCE_NOT_FOUND,
        { topic, fileName, helpDir: HELP_DIR }
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
