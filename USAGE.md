# Using Sequential Thinking in Cursor

This document explains how to use the Sequential Thinking MCP tools in your Cursor chats.

## Available Tools

Two sequential thinking tools are available:

1. **sequentialthinking** - Basic sequential thinking for problem decomposition
2. **sequentialthinking_tools** - Enhanced thinking with tool recommendations

## Starting the Server

1. Run the `GeminiMCP.bat` file to install dependencies and start the server
2. Keep the terminal window open while using the tools

## Using in Cursor

### Enabling the MCP Provider

1. In Cursor, press `Ctrl+Shift+P` to open the command palette
2. Type "Toggle MCP Provider" and select it
3. Select "gemini" from the list

### Example Prompts for Sequential Thinking

Here are some examples of how to prompt Cursor to use sequential thinking:

#### Basic Sequential Thinking

```
I'd like to analyze this problem using sequential thinking. Can you break down the analysis into logical steps?
```

```
Let's use sequential thinking to solve this problem. Start by breaking it down into smaller parts.
```

```
This is a complex issue. Can you help me think about it step by step using sequential thinking?
```

#### Sequential Thinking with Tools

```
I need to solve this programming problem. Could you use sequential thinking with tools to help me approach it methodically?
```

```
Please analyze this codebase using sequential thinking with tools. I need to understand how to implement [feature].
```

```
Let's use sequential thinking to debug this issue. What tools should I use at each step?
```

## Best Practices

1. **Start with a clear problem statement** - Clearly define what you're trying to solve
2. **Allow for multiple thoughts** - Sequential thinking works best with 3-7 thoughts
3. **Be patient** - The tool may take a moment to process complex problems
4. **Revise when needed** - You can ask to revise earlier thoughts if new information emerges
5. **Use with code analysis** - Sequential thinking is particularly powerful for understanding complex codebases

## Troubleshooting

If the tools aren't appearing in Cursor:

1. Make sure the server is running (terminal window is open)
2. Verify you've selected "gemini" as the MCP provider
3. Restart Cursor if the tools still don't appear
4. Check the terminal for error messages

## Example Session

Here's an example of how a sequential thinking session might look:

```
User: I need to implement a user authentication system for my Node.js app. Can you help me think through this using sequential thinking?

AI: I'll help you think through implementing a user authentication system for your Node.js app using sequential thinking.

Thought 1: Define authentication requirements
First, we need to clarify what authentication features are needed. This typically includes:
- User registration with email/password
- Login functionality
- Password reset capabilities
- Session management
- Access control for protected routes

We should also consider whether we need social login (OAuth), email verification, or advanced features like multi-factor authentication.

Thought 2: Choose the authentication approach
We have several options:
1. Build from scratch (not recommended for security-critical systems)
2. Use middleware like Passport.js
3. Use an authentication service like Auth0, Firebase Auth, or Cognito
4. Use a Node.js-specific auth library like jwt-auth

For most applications, Passport.js with JWT (JSON Web Tokens) is a solid choice - flexible, well-maintained, and integrates well with Express.

Thought 3: Set up the database model
We'll need a User model with fields for:
- Email (unique)
- Password (hashed, never stored in plain text)
- Name/profile information
- Account status
- Creation/update timestamps
- Role/permissions

If using MongoDB with Mongoose, we might define a schema with password hashing middleware.

Thought 4: Implement registration and login routes
Create Express routes:
- POST /auth/register - For new user signup
- POST /auth/login - For user authentication
- POST /auth/logout - To invalidate sessions
- POST /auth/forgot-password - For password reset requests

Each route needs proper validation, error handling, and security considerations.

Thought 5: Add middleware for protected routes
Create middleware to verify the JWT token on protected routes:
- Extract token from Authorization header
- Verify token signature
- Check token expiration
- Attach user data to request object
- Allow or deny access

This middleware can be applied selectively to routes requiring authentication.

Shall I continue with more thoughts on testing, security considerations, and deployment?
```

This example shows how sequential thinking breaks down a complex problem into manageable steps, providing clarity and structure to the implementation process.

## Advanced Usage

You can also use the sequential thinking tools with other Cursor capabilities:

- Combine with code search to analyze existing codebases
- Use with file editing to implement solutions step by step
- Integrate with debugging workflows to methodically locate and fix issues

## Conclusion

Sequential thinking helps tackle complex problems by breaking them down into logical steps. By using these tools in Cursor, you can approach difficult coding challenges with more structure and clarity.
