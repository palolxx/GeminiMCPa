# Using Puppeteer with Gemini MCP

This guide explains how to use Puppeteer browser automation with the Gemini Sequential Thinking tools.

## Getting Started

1. Run the `run-with-puppeteer.bat` file to:
   - Start the Puppeteer MCP server in the background
   - Start the Gemini MCP server

2. Keep both terminal windows open while using the tools.

## Available Puppeteer Tools

Puppeteer provides browser automation capabilities in Cursor:

- `mcp__puppeteer_navigate` - Navigate to a URL
- `mcp__puppeteer_screenshot` - Take a screenshot
- `mcp__puppeteer_click` - Click an element
- `mcp__puppeteer_fill` - Fill out an input field
- `mcp__puppeteer_select` - Select an option in a dropdown
- `mcp__puppeteer_hover` - Hover over an element
- `mcp__puppeteer_evaluate` - Execute JavaScript code

## Example Usage with Sequential Thinking

You can combine Puppeteer with sequential thinking to create powerful workflows:

```
I need to analyze a website using sequential thinking and Puppeteer. 
First, I'd like to navigate to example.com, take a screenshot, and then analyze the page structure.
```

## Example Workflow

Here's how a typical workflow combining both tools might look:

1. **Sequential Thought 1**: Define the analysis goals and approach
2. **Puppeteer Action**: Navigate to the website
3. **Puppeteer Action**: Take a screenshot
4. **Sequential Thought 2**: Analyze the page structure
5. **Puppeteer Action**: Extract data using evaluate()
6. **Sequential Thought 3**: Process and interpret the extracted data

## Sample Code

Here's a sample of what you might ask Cursor to do:

```
Let's analyze the homepage of example.com using sequential thinking:

1. First, navigate to the site and take a screenshot
2. Then analyze the structure and identify key elements
3. Finally, extract the main content and headings
```

When Cursor uses Puppeteer, it will look like this:

```python
# Navigate to the URL
mcp__puppeteer_navigate(url="https://example.com")

# Take a screenshot
mcp__puppeteer_screenshot(name="homepage")

# Extract headings
mcp__puppeteer_evaluate(script="""
  return Array.from(document.querySelectorAll('h1, h2, h3')).map(el => ({
    tag: el.tagName,
    text: el.textContent.trim()
  }));
""")
```

## Troubleshooting

If you encounter issues:

1. Make sure both servers are running (both terminal windows should be open)
2. Verify you've selected "gemini" as the MCP provider in Cursor
3. If Puppeteer tools aren't available, try restarting Cursor
4. Check that you have a working internet connection for Puppeteer to access websites

## Advanced Usage

You can combine sequential thinking with Puppeteer for tasks like:

- Web scraping with structured analysis
- Automated testing with thoughtful test planning
- UI analysis and reporting
- Data extraction and processing

Remember that Puppeteer runs a real browser, so all actions are performed as if a real user was interacting with the page. 