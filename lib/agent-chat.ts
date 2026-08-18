import { type OpenAIResponsesProviderOptions, openai } from "@ai-sdk/openai"
import { convertToModelMessages, generateText, stepCountIs, streamText, type UIMessage } from "ai"
import { AGENT_DEPLOY_CHAINS, DEFAULT_AGENT, DEFAULT_COMPILER_VERSION, DEFAULT_TOOL_NAMES } from "@/lib/constants"
import { getAgentById } from "@/lib/data/agents"
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
    reasoningEffort: "medium",
    reasoningSummary: "concise",
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
    systemPrompt: buildAgentSystemPrompt(agent.instructions || DEFAULT_AGENT.instructions),
    tools,
  }
}

export const generateAgentReply = async ({ agentId, messages, userId }: AgentChatParams) => {
  const { agent, tools, systemPrompt } = await getAgentRuntime({ agentId, userId })

  const result = await generateText({
    messages: await convertToModelMessages(messages),
    model: openai("gpt-5.4-nano"),
    providerOptions,
    stopWhen: stepCountIs(5),
    system: systemPrompt,
    tools,
  })

  return { agent, result }
}

export const streamAgentReply = async ({ agentId, messages, onFinish, userId }: StreamAgentChatParams) => {
  const { agent, tools, systemPrompt } = await getAgentRuntime({ agentId, userId })

  const result = streamText({
    messages: await convertToModelMessages(messages),
    model: openai("gpt-5.4-nano"),
    onFinish,
    providerOptions,
    stopWhen: stepCountIs(5),
    system: systemPrompt,
    tools,
  })

  return { agent, result }
}
