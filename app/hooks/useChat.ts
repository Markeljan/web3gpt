import { useState, useEffect, useRef } from 'react';
import { Message } from '@/types/types';

export function useChat() {
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

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
    reader?.read().then(function processChunk({ done, value }: ReadableStreamReadResult<Uint8Array>): any {
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
