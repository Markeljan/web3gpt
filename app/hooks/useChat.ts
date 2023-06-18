import { useState, useEffect, useRef } from 'react';
import { Message } from '@/types/types';

export function useChat() {
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [conversation, setConversation] = useState<Message[]>([]);
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
            "description": "The arguments for the contract's constructor. Can be of any type. This field is optional."
          }
        },
        "required": ["name", "chains", "sourceCode"]
      }
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [conversation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() === "") {
      return;
    }

    const newUserMessage: Message = { role: "user", content: userInput };

    const newConversation = [...conversation, newUserMessage, { role: "assistant", content: "" }];

    setLoading(true);
    setConversation(newConversation);
    setUserInput("");
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newConversation),
    });

    if (!response.ok) {
      console.error("Something went wrong with the request");
      return;
    }

    // Get a reader from the response stream
    const reader = response?.body?.getReader();

    let buffer = '';
    reader?.read().then(async function processChunk({ done, value }: ReadableStreamReadResult<Uint8Array>): Promise<any> {
      if (done) {
        const lastMessage = conversation[conversation.length - 1];
        if (lastMessage && lastMessage.content && lastMessage.role === "assistant") {
          const parsedContent = JSON.parse(lastMessage.content);
          if (parsedContent.function_call) {
            const functionName = parsedContent.function_call.name;
            const functionArgs = JSON.parse(parsedContent.function_call.arguments);

            // If the function to be called is deployContract, make an HTTP POST request to the route
            if (functionName === 'deployContract') {
              const [name, chains, sourceCode, constructorArgs] = functionArgs;
              const response = await fetch('/api/deployContract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, chains, sourceCode, constructorArgs })
              });

              if (response.ok) {
                const result = await response.json();

                // Append function response to conversation
                setConversation(prevConversation => [...prevConversation, { role: "function", content: result }]);
              } else {
                console.error('Failed to deploy contract');
              }
            }
          }
        }
        return Promise.resolve();
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
            console.error("Could not parse the following as JSON:", jsonStr);
            continue; // skip to the next line
          }

          if (obj.choices && obj.choices[0].delta.content) {
            const content = obj.choices[0].delta.content;

            // Here you could update the last assistant message in the conversation
            setConversation(prevConversation => {
              let newConversation = [...prevConversation];
              const lastMessageIndex = newConversation.length - 1;
              if (newConversation[lastMessageIndex].role === "assistant") {
                newConversation[lastMessageIndex].content += content;
              }
              return newConversation;
            });
          }
        }
      }

      return reader.read().then(processChunk); // Read next chunk
    });
    setLoading(false);
  };

  return {
    userInput,
    setUserInput,
    loading,
    conversation,
    handleSubmit,
  }
}
