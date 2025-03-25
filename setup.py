from setuptools import setup, find_packages

setup(
    name="gemini-mcp-server",
    version="1.0.0",
    description="Gemini Sequential Thinking MCP Server",
    author="",
    author_email="",
    packages=find_packages(),
    include_package_data=True,
    py_modules=["gemini_mcp_server"],
    entry_points={
        "console_scripts": [
            "gemini-mcp-server=gemini_mcp_server:main",
        ],
    },
    install_requires=[],
    python_requires=">=3.7",
) 