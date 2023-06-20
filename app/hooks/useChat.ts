import { useState, useEffect, useRef, use } from 'react';
import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from 'openai';
import { SYSTEM_MESSAGE, deployContractFunction, readContractFunction } from '@/components/chatData';
import { ReadContractRequest } from '../types/types';

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

export function useChat() {
  const [userInput, setUserInput] = useState<string>("");
  const [streamingChat, setStreamingChat] = useState<boolean>(false);
  const [processingFunctionCall, setProcessingFunctionCall] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([SYSTEM_MESSAGE]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (streamingChat || processingFunctionCall) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [streamingChat, processingFunctionCall]);

  useEffect(() => {
    if (streamingChat) {
      let reducedMessages = [...messages]; // clone the messages array
      let tokensEstimate = reducedMessages.length * 4 + 100;

      while (tokensEstimate > 120) {
        reducedMessages = reducedMessages.slice(Math.floor(reducedMessages.length / 2));
        tokensEstimate = reducedMessages.length * 4 + 100;
      }
      const getChatResponse = async () => {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: reducedMessages,
            functions: [deployContractFunction, readContractFunction],
          }),
        });

        // Start the messages with an empty assistant message
        const assistantMessage = createNewMessage("assistant");
        setMessages(prevMessages => [...prevMessages, assistantMessage]);

        const reader = response?.body?.getReader();
        let buffer = '';
        reader?.read().then(async function processChunk({ done, value }: ReadableStreamReadResult<Uint8Array>): Promise<any> {
          if (done) {
            setStreamingChat(false);
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
                if (!function_args || !name) {
                  console.error("Function call detected, but function name or arguments were not found");
                  setStreamingChat(false);
                  return;
                }
                setProcessingFunctionCall(true);
                const parsedArgs = JSON.parse(function_args);

                if (name === 'deployContract') {
                  const response = await fetch('/api/deploy-contract', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: parsedArgs.name,
                      chains: parsedArgs.chains,
                      sourceCode: parsedArgs.sourceCode,
                      constructorArgs: parsedArgs.constructorArgs || [],
                    }),
                  });
                  if (response.ok) {
                    const result = await response.json();
                    const content = formatResponseForHTML(result)
                    // Append function response to messages
                    setMessages(prevMessages => [...prevMessages, { role: "function", name: name, content: content }]);
                  } else {
                    console.error('Failed to deploy contract: ', response);
                    setMessages(prevMessages => [...prevMessages, { role: "function", name: name, content: "Failed to deploy contract" }]);
                  }
                } else if (name === 'readContract') {
                  console.log("parsedArgs", parsedArgs)
                  console.log("parsed aarg requests spread", ...parsedArgs.requests)

                  const response = await fetch('/api/read-contract', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chain: parsedArgs.chain,
                      requests: parsedArgs.requests
                    }),
                  });
                  if (response.ok) {
                    const result = await response.json();
                    result.forEach((res: any) => {
                      if (res.status === 'success') {
                        if (res.data.status === 'fulfilled') {
                          setMessages(prevMessages => [...prevMessages, { role: "function", name: name, content: JSON.stringify(res.data.value) }]);
                        } else if (res.data.status === 'rejected') {
                          console.error('Function failed: ', res.data.reason);
                        }
                      } else {
                        console.error('Request failed: ', res);
                      }
                    });
                  } else {
                    console.error('Failed to read contract: ', response);
                    setMessages(prevMessages => [...prevMessages, { role: "function", name: name, content: "Failed to read contract" }]);
                  }
                } else if (name === 'fetchAbi') {
                  const response = await fetch('/api/fetch-abi', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chain: parsedArgs.chain,
                      address: parsedArgs.address,
                    }),
                  });
                  if (response.ok) {
                    const result = await response.json();
                    // Append function response to messages
                    setMessages(prevMessages => [...prevMessages, { role: "function", name: name, content: JSON.stringify(result.abi) }]);
                  } else {
                    console.error('Failed to fetch ABI: ', response);
                    setMessages(prevMessages => [...prevMessages, { role: "function", name: name, content: "Failed to fetch ABI" }]);
                  }
                }


                setProcessingFunctionCall(false);
              }
            }
          }
          return reader.read().then(processChunk); // Read next chunk
        });
      };
      if (!loading) {
        getChatResponse();
      }
    }
  }, [streamingChat, processingFunctionCall, loading, messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() === "") {
      return;
    }

    const userMessage = createNewMessage("user", userInput);
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setUserInput("");
    setStreamingChat(true);

  };

  return {
    userInput,
    setUserInput,
    loading,
    messages,
    handleSubmit,
  }
}
