import { type OpenAIResponsesProviderOptions, openai } from "@ai-sdk/openai"
import { convertToModelMessages, generateText, stepCountIs, streamText, type UIMessage } from "ai"
import { AGENT_DEPLOY_CHAINS, DEFAULT_AGENT, DEFAULT_COMPILER_VERSION, DEFAULT_TOOL_NAMES } from "@/lib/constants"
import { getAgentById } from "@/lib/data/openai"
import { getTools } from "@/lib/tools"

type AgentResponseMessage = {
  role: string
  content: string | Array<{ type: string; text?: string }>
}

type AgentChatParams = {
  agentId: string
  messages: UIMessage[]
  userId?: string
}

type StreamAgentChatParams = AgentChatParams & {
  onFinish?: (event: { response: { messages: AgentResponseMessage[] } }) => void | Promise<void>
}

const providerOptions = {
  openai: {
    reasoningSummary: "concise",
    reasoningEffort: "medium",
  } satisfies OpenAIResponsesProviderOptions,
}

const availableChainsText = AGENT_DEPLOY_CHAINS.map((chain) => `${chain.name} (chainId: ${chain.id})`).join(", ")

export const buildAgentSystemPrompt = (instructions: string): string => `${instructions || DEFAULT_AGENT.instructions}

Current Settings:
- Compiler Version: ${DEFAULT_COMPILER_VERSION}
- Available Chains: ${availableChainsText}`

const getAgentRuntime = async ({ agentId, userId }: Omit<AgentChatParams, "messages">) => {
  const agent = await getAgentById(agentId)
  const tools = getTools(agent.toolNames ?? DEFAULT_TOOL_NAMES, { userId })

  return {
    agent,
    tools,
    systemPrompt: buildAgentSystemPrompt(agent.instructions || DEFAULT_AGENT.instructions),
  }
}

export const generateAgentReply = async ({ agentId, messages, userId }: AgentChatParams) => {
  const { agent, tools, systemPrompt } = await getAgentRuntime({ agentId, userId })

  const result = await generateText({
    model: openai("gpt-5-mini"),
    providerOptions,
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(5),
  })

  return { agent, result }
}

export const streamAgentReply = async ({ agentId, messages, onFinish, userId }: StreamAgentChatParams) => {
  const { agent, tools, systemPrompt } = await getAgentRuntime({ agentId, userId })

  const result = streamText({
    model: openai("gpt-5-mini"),
    providerOptions,
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(5),
    onFinish,
  })

  return { agent, result }
}
