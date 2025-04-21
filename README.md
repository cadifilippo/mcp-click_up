## Debug

```
npx -y @modelcontextprotocol/inspector npx -y tsx ./main.ts
```

## Add to LLM Client

### Copilot (VSCode)

Add the following to your `.vscode/settings.json`:

```json
{
  "mcp": {
    "servers": {
      "clickup": {
        "command": "npx",
        "args": ["-y", "tsx", "/Users/<your_username>/<folder>/clickup/main.ts"],
        "env": {
          "CLICK_UP_TOKEN": <YOUR_CLICK_UP_TOKEN>,
        }
      }
    }
  }
}
```

### Claude Desktop (MacOs)

**You must build the project first. Run `npm run build` to create the `build` folder.**

Add the following to your `/Users/<your_username>/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "clickup": {
      "command": "/Users/<your_username>/.nvm/versions/node/v22.10.0/bin/node", // Replace with your node path
      "args": [
        "/Users/<your_username>/<folder>/clickup/build/main.js"
      ],
      "env": {
        "CLICK_UP_TOKEN": <YOUR_CLICK_UP_TOKEN>,
      }
    }
  }
}
```
