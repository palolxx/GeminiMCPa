#!/usr/bin/env python3
"""
Simple Gemini MCP Server Runner
"""
import os
import sys
import subprocess
import time

def main():
    # Print banner
    print("\n===== Gemini MCP Server =====\n")
    
    # Get directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Set API key
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        # Try .env file
        if os.path.exists(os.path.join(script_dir, ".env")):
            with open(os.path.join(script_dir, ".env"), "r") as f:
                for line in f:
                    if line.startswith("GEMINI_API_KEY="):
                        api_key = line.split("=", 1)[1].strip()
                        break
        
        # Try geminikey.txt
        if not api_key and os.path.exists(os.path.join(script_dir, "geminikey.txt")):
            with open(os.path.join(script_dir, "geminikey.txt"), "r") as f:
                api_key = f.read().strip()
    
    # Check API key
    if not api_key:
        print("WARNING: No API key found. Server will run in simulation mode.")
    else:
        print(f"Using API key: {api_key[:8]}***")
    
    # Set environment variable
    os.environ["GEMINI_API_KEY"] = api_key or ""
    
    # Start Node.js server
    print("\nStarting Node.js MCP server...\n")
    
    # Determine which script to run
    server_script = os.path.join(script_dir, "run-mcp.js")
    if not os.path.exists(server_script):
        server_script = os.path.join(script_dir, "server", "simple_mcp_server.js")
    
    try:
        # Use subprocess.run to keep the script running until the server exits
        result = subprocess.run(["node", server_script], env=os.environ)
        if result.returncode != 0:
            print(f"\nServer exited with code {result.returncode}")
            return result.returncode
    except KeyboardInterrupt:
        print("\nServer stopped by user.")
    except Exception as e:
        print(f"\nError starting server: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 