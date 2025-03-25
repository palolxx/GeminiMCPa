#!/usr/bin/env python3
"""
Gemini MCP Server Python Wrapper
This script serves as an entry point for uv to run the Node.js-based MCP server.
"""

import os
import sys
import subprocess
import signal
import json
import platform

def main():
    # Banner
    print("\n===== Gemini MCP Server (Python Wrapper) =====\n")

    # Determine the script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    # Check if Node.js is installed
    try:
        subprocess.run(["node", "--version"], capture_output=True, check=True)
        print("✓ Node.js is installed")
    except (subprocess.SubprocessError, FileNotFoundError):
        print("❌ Error: Node.js is not installed or not in PATH")
        print("Please install Node.js from https://nodejs.org/")
        sys.exit(1)

    # Check for API key
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        # Try to read from .env file
        env_path = os.path.join(script_dir, ".env")
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                for line in f:
                    if line.startswith("GEMINI_API_KEY="):
                        api_key = line.split("=", 1)[1].strip()
                        print(f"✓ API key found in .env file")
                        break
        
        # Try to read from geminikey.txt file
        if not api_key:
            key_path = os.path.join(script_dir, "geminikey.txt")
            if os.path.exists(key_path):
                with open(key_path, "r") as f:
                    api_key = f.read().strip()
                    print(f"✓ API key found in geminikey.txt file")

    if not api_key:
        print("⚠️ Warning: No Gemini API key found!")
        print("Server will run in simulation mode.\n")
    else:
        # Mask most of the API key for security
        masked_key = api_key[:8] + "***" 
        print(f"✓ Using API key: {masked_key}")

    # Set environment variables
    os.environ["GEMINI_API_KEY"] = api_key or ""

    # Check if dependencies are installed
    if not os.path.exists(os.path.join(script_dir, "node_modules")):
        print("Installing Node.js dependencies...")
        try:
            subprocess.run(["npm", "install"], cwd=script_dir, check=True)
            print("✓ Dependencies installed successfully")
        except subprocess.SubprocessError as e:
            print(f"❌ Error installing dependencies: {e}")
            sys.exit(1)
    else:
        print("✓ Node.js dependencies already installed")

    # Start the server
    print("\nStarting Gemini MCP server...\n")

    # Determine which script to run
    server_script = os.path.join(script_dir, "run-mcp.js")
    if not os.path.exists(server_script):
        server_script = os.path.join(script_dir, "server", "simple_mcp_server.js")

    # Start the Node.js process
    node_process = None
    try:
        node_process = subprocess.Popen(
            ["node", server_script],
            env=os.environ,
            cwd=script_dir
        )
        
        # Handle Ctrl+C and program termination
        def signal_handler(sig, frame):
            print("\nShutting down server...")
            if node_process:
                if platform.system() == "Windows":
                    node_process.terminate()
                else:
                    node_process.send_signal(signal.SIGTERM)
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        # Wait for the process to complete
        node_process.wait()
        
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        if node_process:
            node_process.terminate()
        sys.exit(1)

if __name__ == "__main__":
    main() 