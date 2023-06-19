import { ChatCompletionRequestMessage } from 'openai';
import { useState, useEffect, useRef } from 'react';


export function createNewMessage(role: ChatCompletionRequestMessage["role"], content = ""): ChatCompletionRequestMessage {
  return { role, content };
}

function formatResponseForHTML(responseJson: any): string {
  let htmlString = '';
  
  responseJson.data.contracts.forEach((contract: any, index: number) => {
    htmlString += `The <strong>${contract.name}</strong> has been successfully deployed to the ${contract.chain} with a constructor argument. You can interact with this contract to set and get the name through its functions.<br/><br/>`;
    htmlString += 'Here are the details of the deployed contract:<br/><br/>';
    htmlString += `<ul>\n`;
    htmlString += `<li>Contract Address: <a href="${contract.explorerUrl}" target="_blank">${contract.contractAddress}</a></li><br/>`;
    htmlString += `<li>Transaction on Etherscan: <a href="${contract.explorerUrl}" target="_blank">View Transaction</a></li><br/>`;
    htmlString += `<li>IPFS Link: <a href="${contract.ipfsUrl}" target="_blank">View on IPFS</a></li><br/>`;
    htmlString += `</ul><br/><br/>`;
    htmlString += 'If you need further assistance or have any questions on how to interact with the contract, please let me know.<br/><br/>';
  });
  
  return htmlString;
}



export function useChat() {
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);
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

              // If the assistant's response contains "finish_reason": "function_call", call the deployContract route
              if (obj.choices[0].finish_reason === 'function_call') {
                console.log('Calling deployContract route because of finish_reason: ', obj.choices[0].finish_reason)
                console.log(assistantMessage.function_call)
                const { name, arguments: function_args } = assistantMessage.function_call as { name: string, arguments: string };
                // Parse the arguments to an object
                const parsedArgs = JSON.parse(function_args);

                // name, chain, sourceCode, constructorArgs

                const response = await fetch('/api/deploy-contract', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...parsedArgs })
                });
                if (response.ok) {
                  const result = await response.json();

                  const constent = formatResponseForHTML(result)

                  // Append function response to messages
                  setMessages(prevMessages => [...prevMessages, { role: "function", name: name, content: constent }]);
                } else {
                  console.error('Failed to deploy contract');
                }
              }

              // Update chatResponse fields if they are present in new chunk
              if (obj.choices[0].delta.role !== undefined) {
                assistantMessage.role = obj.choices[0].delta.role;
              }
              if (obj.choices[0].delta.content !== undefined && obj.choices[0].delta.content !== '') {
                assistantMessage.content += obj.choices[0].delta.content;
              }
              if (obj.choices[0].delta.name !== undefined) {
                assistantMessage.name = obj.choices[0].delta.name;
              }
              // When processing chunks, update function_call properties if they are present
              if (obj.choices[0].delta.function_call !== undefined) {
                //if the assistant message does not have a function_call property, create one
                if (!assistantMessage.function_call) {
                  assistantMessage.function_call = {
                    name: '',
                    arguments: '',
                  }
                }

                if (obj.choices[0].delta.function_call.name) {
                  assistantMessage.function_call = {
                    ...assistantMessage.function_call,
                    name: assistantMessage.function_call.name + obj.choices[0].delta.function_call.name,
                  }
                }
                if (obj.choices[0].delta.function_call.arguments) {
                  assistantMessage.function_call = {
                    ...assistantMessage.function_call,
                    arguments: assistantMessage.function_call.arguments + obj.choices[0].delta.function_call.arguments,
                  }
                }


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
