import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from 'openai';
import { useState, useEffect, useRef } from 'react';

export function createNewMessage(role: ChatCompletionRequestMessageRoleEnum, content: string = ""): ChatCompletionRequestMessage {
  return { role, content };
}

function formatResponseForHTML(responseJson: any): string {
  let htmlString = '';

  responseJson.data.contracts.forEach((contract: any, index: number) => {
    htmlString += `The <strong>${contract.name}</strong> has been successfully deployed to <strong>${contract.chain}</strong>.<br/><br/>`;
    htmlString += 'Here are the details of the deployed contract:<br/><br/>';
    htmlString += `<ul>\n`;
    htmlString += `<li>Contract Address: <strong>${contract.contractAddress}</strong></li><br/>`;
    htmlString += `<li>Transaction on Explorer: <a href="${contract.explorerUrl}" target="_blank">View Transaction</a></li><br/>`;
    htmlString += `<li>IPFS Link: <a href="${contract.ipfsUrl}" target="_blank">View on IPFS</a></li><br/>`;
    htmlString += `</ul><br/>`;
    htmlString += 'If you need further assistance or have any questions on how to interact with the contract, please let me know.';
  });

  return htmlString;
}
const SYSTEM_MESSAGE: ChatCompletionRequestMessage = createNewMessage(
  "system",
  "You are a chat bot responsible for writing and deploying smart contracts on EVM compatible chains. Your main function is 'deployContract', which enables the deployment of Solidity smart contracts (version 0.8.20 or greater) onto specified blockchain networks. The function requires 'name', 'chains', and 'sourceCode', and 'constructorArgs' parameters to be formatted as per the defined structure. Remember, your primary task is to aid in the development and deployment of smart contracts.  After you deploy a contract, you should provide the user with the contract address, transaction hash, and IPFS link."
);

export function useChat() {
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([SYSTEM_MESSAGE]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const functions = [
    {
      "name": "deployContract",
      "description": "Deploy a smart contract. Must be Solidity version 0.8.20 or greater. Must be a single-line string with no newline characters.",
      "parameters": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "The name of the contract. Only letters, no spaces or special characters."
          },
          "chains": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "The blockchain networks to deploy the contract to. No special characters."
          },
          "sourceCode": {
            "type": "string",
            "description": "The source code of the contract. Must be Solidity version 0.8.20 or greater. Must be a single-line string with no newline characters."
          },
          "constructorArgs": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "The arguments for the contract's constructor. Can be of any type. use [] if no arguments are required."
          }
        },
        "required": ["name", "chains", "sourceCode", "constructorArgs"]
      }
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (loading) {
      const getChatResponse = async () => {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: messages,
          }),
        });

        if (!response.ok) {
          console.error("Something went wrong with the request");
          return;
        }

        // Start the messages with an empty assistant message
        const assistantMessage = createNewMessage("assistant");
        setMessages(prevMessages => [...prevMessages, assistantMessage]);

        const reader = response?.body?.getReader();
        let buffer = '';
        reader?.read().then(async function processChunk({ done, value }: ReadableStreamReadResult<Uint8Array>): Promise<any> {
          if (done) {
            return;
          }
          // Convert chunk from Uint8Array to string
          const string = new TextDecoder("utf-8").decode(value);
          // Process the string, extract the content
          const lines = string.split('\n');
          lines[0] = buffer + lines[0];  // prepend buffer to the first line
          buffer = lines.pop() || '';  // remove the last line from lines and save it in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {

              const jsonStr = line.slice('data: '.length);
              let obj;
              try {
                obj = JSON.parse(jsonStr);
              } catch (e) {
                // Ignore non-JSON lines
                if (jsonStr !== "[DONE]") {
                  console.error("Could not parse the following as JSON:", jsonStr);
                }
                continue; // skip to the next line
              }
              // If the assistant's response contains "finish_reason": "function_call", set a flag
              let functionCallDetected = obj.choices[0].finish_reason === 'function_call';

              // Update assistant message normally (including function_call properties if they exist)
              if (obj.choices[0].delta.role !== undefined) {
                assistantMessage.role = obj.choices[0].delta.role;
              }
              if (obj.choices[0].delta.content !== undefined && obj.choices[0].delta.content !== '') {
                assistantMessage.content += obj.choices[0].delta.content;
              }
              if (obj.choices[0].delta.name !== undefined) {
                assistantMessage.name = obj.choices[0].delta.name;
              }

              if (obj.choices[0].delta.function_call !== undefined) {
                // The function_call property exists, so update it in assistantMessage
                assistantMessage.function_call = {
                  name: obj.choices[0].delta.function_call.name || assistantMessage.function_call?.name,
                  arguments: (assistantMessage.function_call?.arguments || "") + (obj.choices[0].delta.function_call.arguments || ""),
                };
                
                // set the content of the message to the function_call name
                assistantMessage.content = `Calling function: ${assistantMessage.function_call.name} With arguments: ${assistantMessage.function_call.arguments}`
              }

              setMessages(prevMessages => {
                let lastMessage = prevMessages[prevMessages.length - 1];

                if (assistantMessage.role === lastMessage.role) {
                  return [...prevMessages.slice(0, -1), assistantMessage];
                } else {
                  return [...prevMessages, assistantMessage];
                }
              });

              // If a function call was detected, execute it
              if (functionCallDetected && assistantMessage.function_call) {
                const { name, arguments: function_args } = assistantMessage.function_call;
                // Parse the arguments to an object
                const parsedArgs = JSON.parse(function_args || '{}');

                const response = await fetch('/api/deploy-contract', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...parsedArgs })
                });
                if (response.ok) {
                  const result = await response.json();
                  const content = formatResponseForHTML(result)

                  // Append function response to messages
                  setMessages(prevMessages => [...prevMessages, { role: "function", name: name, content: content }]);
                } else {
                  console.error('Failed to deploy contract: ', response);
                }
              }
            }
          }
          return reader.read().then(processChunk); // Read next chunk
        });
      };

      getChatResponse().finally(() => setLoading(false));
    }
  }, [loading, messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() === "") {
      return;
    }

    const userMessage = createNewMessage("user", userInput);
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setUserInput("");
    setLoading(true);

  };

  return {
    userInput,
    setUserInput,
    loading,
    messages,
    handleSubmit,
  }
}
