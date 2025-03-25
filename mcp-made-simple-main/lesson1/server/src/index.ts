// 0. Import dependencies
import { MCPServer } from "@modelcontextprotocol/sdk";
import { greetingToolDefinition, handleGreeting } from './tools/greeting';

// 1. Create MCP server instance
console.log("Creating MCP server instance...");
const server = new MCPServer({ stdio: true });

// 2. Define the list of tools
console.log("Defining list of tools...");
const tools = [greetingToolDefinition];
console.log("Tools defined:", tools);

// 3. Add tool call logic
console.log("Registering tools with server...");
server.registerToolsWithDefinitions(tools);

console.log("Setting up request handler...");
server.setRequestHandler(async (request) => {
  console.log("Received request:", request);
  if (request.type === "TOOL_CALL") {
    if (request.toolName === "greeting") {
      console.log("Handling greeting tool call with input:", request.toolInput);
      const result = handleGreeting(request.toolInput);
      console.log("Greeting tool result:", result);
      return result;
    }
  }
  console.log("No handler for request, returning null");
  return null;
});

// 4. Start the MCP server
console.log("Starting MCP server...");
server.start();
console.log("MCP Hello World Server started with configuration:");
console.log("- Tools:", tools.map(t => t.name).join(", "));
console.log("- Transport: stdio");
console.log("Waiting for requests...");
