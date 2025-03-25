/**
 * Sequential Thinking Tools
 * 
 * This module defines the sequential thinking tool for the MCP protocol.
 */

// Define the sequential thinking tool
const sequentialThinkingTool = {
  name: 'sequentialthinking',
  description: 'A detailed tool for dynamic and reflective problem-solving through thoughts',
  parameters: {
    type: 'object',
    properties: {
      thought: { 
        type: 'string', 
        description: 'Your current thinking step' 
      },
      nextThoughtNeeded: { 
        type: 'boolean', 
        description: 'Whether another thought step is needed' 
      },
      thoughtNumber: { 
        type: 'integer', 
        description: 'Current thought number', 
        minimum: 1 
      },
      totalThoughts: { 
        type: 'integer', 
        description: 'Estimated total thoughts needed', 
        minimum: 1 
      },
      isRevision: { 
        type: 'boolean', 
        description: 'Whether this revises previous thinking' 
      },
      revisesThought: { 
        type: 'integer', 
        description: 'Which thought is being reconsidered', 
        minimum: 1 
      },
      branchFromThought: { 
        type: 'integer', 
        description: 'Branching point thought number', 
        minimum: 1 
      },
      branchId: { 
        type: 'string', 
        description: 'Branch identifier' 
      },
      needsMoreThoughts: { 
        type: 'boolean', 
        description: 'If more thoughts are needed' 
      }
    },
    required: ['thought', 'nextThoughtNeeded', 'thoughtNumber', 'totalThoughts']
  }
};

// Define the sequential thinking tools tool
const sequentialThinkingToolsTool = {
  name: 'sequentialthinking_tools',
  description: 'A detailed tool for dynamic and reflective problem-solving through thoughts with tool recommendations',
  parameters: {
    type: 'object',
    properties: {
      thought: { 
        type: 'string', 
        description: 'Your current thinking step' 
      },
      nextThoughtNeeded: { 
        type: 'boolean', 
        description: 'Whether another thought step is needed' 
      },
      thoughtNumber: { 
        type: 'integer', 
        description: 'Current thought number', 
        minimum: 1 
      },
      totalThoughts: { 
        type: 'integer', 
        description: 'Estimated total thoughts needed', 
        minimum: 1 
      },
      isRevision: { 
        type: 'boolean', 
        description: 'Whether this revises previous thinking' 
      },
      revisesThought: { 
        type: 'integer', 
        description: 'Which thought is being reconsidered', 
        minimum: 1 
      },
      branchFromThought: { 
        type: 'integer', 
        description: 'Branching point thought number', 
        minimum: 1 
      },
      branchId: { 
        type: 'string', 
        description: 'Branch identifier' 
      },
      needsMoreThoughts: { 
        type: 'boolean', 
        description: 'If more thoughts are needed' 
      },
      currentStep: {
        type: 'object',
        description: 'Current step recommendation',
        properties: {
          stepDescription: {
            type: 'string',
            description: 'What needs to be done'
          },
          recommendedTools: {
            type: 'array',
            description: 'Tools recommended for this step',
            items: {
              type: 'object',
              properties: {
                toolName: {
                  type: 'string',
                  description: 'Name of the tool being recommended'
                },
                confidence: {
                  type: 'number',
                  description: '0-1 indicating confidence in recommendation',
                  minimum: 0,
                  maximum: 1
                },
                rationale: {
                  type: 'string',
                  description: 'Why this tool is recommended'
                },
                priority: {
                  type: 'number',
                  description: 'Order in the recommendation sequence'
                },
                suggestedInputs: {
                  type: 'object',
                  description: 'Optional suggested parameters'
                },
                alternatives: {
                  type: 'array',
                  description: 'Alternative tools that could be used',
                  items: {
                    type: 'string'
                  }
                }
              },
              required: ['toolName', 'confidence', 'rationale', 'priority']
            }
          },
          expectedOutcome: {
            type: 'string',
            description: 'What to expect from this step'
          },
          nextStepConditions: {
            type: 'array',
            description: 'Conditions to consider for the next step',
            items: {
              type: 'string'
            }
          }
        },
        required: ['stepDescription', 'recommendedTools', 'expectedOutcome']
      },
      previousSteps: {
        type: 'array',
        description: 'Steps already recommended',
        items: {
          type: 'object',
          properties: {
            stepDescription: {
              type: 'string',
              description: 'What needs to be done'
            },
            recommendedTools: {
              type: 'array',
              description: 'Tools recommended for this step',
              items: {
                type: 'object',
                properties: {
                  toolName: {
                    type: 'string',
                    description: 'Name of the tool being recommended'
                  },
                  confidence: {
                    type: 'number',
                    description: '0-1 indicating confidence in recommendation',
                    minimum: 0,
                    maximum: 1
                  },
                  rationale: {
                    type: 'string',
                    description: 'Why this tool is recommended'
                  },
                  priority: {
                    type: 'number',
                    description: 'Order in the recommendation sequence'
                  },
                  suggestedInputs: {
                    type: 'object',
                    description: 'Optional suggested parameters'
                  },
                  alternatives: {
                    type: 'array',
                    description: 'Alternative tools that could be used',
                    items: {
                      type: 'string'
                    }
                  }
                },
                required: ['toolName', 'confidence', 'rationale', 'priority']
              }
            },
            expectedOutcome: {
              type: 'string',
              description: 'What to expect from this step'
            },
            nextStepConditions: {
              type: 'array',
              description: 'Conditions to consider for the next step',
              items: {
                type: 'string'
              }
            }
          },
          required: ['stepDescription', 'recommendedTools', 'expectedOutcome']
        }
      },
      remainingSteps: {
        type: 'array',
        description: 'High-level descriptions of upcoming steps',
        items: {
          type: 'string'
        }
      }
    },
    required: ['thought', 'nextThoughtNeeded', 'thoughtNumber', 'totalThoughts']
  }
};

// Export the tools
module.exports = {
  sequentialThinkingTool,
  sequentialThinkingToolsTool,
  getAllTools: () => [sequentialThinkingTool, sequentialThinkingToolsTool]
}; 