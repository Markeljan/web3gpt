# Web3GPT Skill

Use the Web3GPT skill endpoint to start a chat, continue a chat, and optionally return the full history.

Base endpoint:

`https://w3gpt.ai/api/skill`

## Start a new chat

Call the endpoint with no parameters.

```bash
curl https://w3gpt.ai/api/skill
```

Response:

```json
{
  "agentId": "agent_web3gpt",
  "chatId": "generated-chat-id",
  "response": null
}
```

Save the `chatId`. That is the secret for continuing the same thread.

## Continue a chat

Send a message with the same `chatId`.

```bash
curl -X POST "https://w3gpt.ai/api/skill?chatId=generated-chat-id" \
  -H "Content-Type: application/json" \
  -d '{"message":"Deploy an ERC20 on Polygon mainnet with 1,000,000 supply"}'
```

Response:

```json
{
  "agentId": "agent_web3gpt",
  "chatId": "generated-chat-id",
  "response": "..."
}
```

## Full history

History is off by default.

- `history=true` returns the full simplified history
- `history=false` or omitting it returns only the latest response
- `full=true` is supported as an alias for `history=true`

Example:

```bash
curl "https://w3gpt.ai/api/skill?chatId=generated-chat-id&history=true"
```

## Optional parameters

- `chatId`: continue an existing chat
- `agentId`: use a different Web3GPT agent
- `message`: send a message by query string for small requests
- `history`: include the full history, defaults to `false`
- `full`: alias for `history`

## Notes

- If you call the endpoint without a `chatId`, a new chat is created automatically.
- If you call the endpoint without a `message`, you still get back a `chatId`.
- Deployments happen through the agent conversation. Tell the agent which chain to use.
- Polygon mainnet deployment is available through the agent/skill endpoint, not the wallet UI connectors.
- Server-side deployment returns only after a successful contract-creation receipt. The tool result includes the chain ID, contract address, transaction hash, contract explorer URL, and transaction explorer URL.
- Public aggregate deployment and custom-agent counts are available at `https://w3gpt.ai/api/stats`.
