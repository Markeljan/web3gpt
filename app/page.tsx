"use client"
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { Box, Typography, CircularProgress, IconButton, InputAdornment, FilledInput } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown'
import { AccountCircle, SmartToy, YouTube, Twitter } from '@mui/icons-material';

export type Message = {
  role: string,
  content: string,
};

export default function Home() {

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

    setUserInput("");

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


  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', pb: 20, color: '#ECECF1', width: '100%', maxWidth: 'none' }}>
        <Box sx={{ backgroundColor: "#444754" }}>
          <Box
            sx={{
              py: 3,
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box sx={{ flex: 1 }} />
            <Typography variant="subtitle2" color="#C5C5D2" sx={{ flex: 1, textAlign: 'center', fontWeight: '300' }}>
              Model: GPT-3.5
            </Typography>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', pr: 10 }}>
              <IconButton aria-label="Twitter" component="a" target='_blank' href="https://twitter.com/0xmarkeljan">
                <Twitter sx={{color: '#C5C5D2'}}/>
              </IconButton>
              <IconButton aria-label="YouTube" component="a" target='_blank' href='https://www.youtube.com/live/E2Ynuq7Eorc?feature=share&t=2776'>
                <YouTube sx={{color: '#C5C5D2'}}/>
              </IconButton>
            </Box>
          </Box>
        </Box>
        <Box sx={{
          display: {xs: 'none', md: conversation.length ? 'none' : 'flex'}, justifyContent: 'center', alignItems: 'center', width: '555px', height: '120px', backgroundColor: "#fff",
          position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.25, userSelect: 'none', pointerEvents: 'none'
        }}>
          <Image src="/w3gpt_med.svg" alt="W3GPT Logo" width={800} height={800} />
        </Box>
        {conversation.map((conversation, index) => (
          <Box key={index} sx={{ px: 2, backgroundColor: conversation.role === "assistant" ? "#444754" : "#343541" }}>
            <Box sx={{ width: '100%', maxWidth: '48rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', mx: 'auto', my: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'top', width: '100%', p: 1, color: "#ECECF1", my: 0.5, position: 'relative' }}>
                <Box sx={{ width: '3.75rem' }}>
                  {conversation.role === "assistant" ? (
                    <>
                      <SmartToy sx={{ color: '#ECECF1', fontSize: '2rem' }} />
                      <Box
                        sx={{ position: "absolute", left: { xs: "60%", md: '80%' }, transform: "translate(-50%, -50%)", opacity: 0.25, userSelect: 'none', pointerEvents: 'none' }} >
                        <Image src="/w3gpt_med.svg" alt="W3GPT Logo" width={300} height={300} />
                      </Box>

                    </>) :
                    <AccountCircle sx={{ color: '#ECECF1', fontSize: '2rem' }} />}
                </Box>
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', wordWrap: 'break-word', fontSize: '1rem', lineHeight: '1.5rem', fontWeight: '300' }}>
                  <ReactMarkdown linkTarget={"_blank"}>{conversation.content}</ReactMarkdown>
                </Box>
                <Box sx={{ width: { xs: '0.5rem', md: '3.75rem' } }} />
              </Box>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ display: 'flex', position: 'fixed', bottom: 0, paddingTop: '48px', width: '100%', backgroundImage: 'linear-gradient(180deg, rgba(53,55,64,0) 0%, #35373F 50%, #35373F 100%)' }}>
        <form onSubmit={handleSubmit} style={{ paddingLeft: '16px', paddingRight: '16px', display: 'flex', width: '100%', justifyContent: 'center' }}>
          <FilledInput
            fullWidth
            multiline
            disableUnderline
            maxRows={8}
            type="text"
            placeholder="Send a message"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            sx={{
              minHeight: '4rem',  // Add this line
              maxWidth: '48rem',
              width: '100%',
              mb: 4,
              p: 2,
              borderRadius: "0.75rem",
              backgroundColor: '#40414F',
              color: userInput.trim() ? '#ECECF1' : '#8E8EA0',
              "&:hover": {
                backgroundColor: "#40414F",
              },
              "&.Mui-focused": {
                backgroundColor: "#40414F",
              },
              fontWeight: 300,
              border: 1,
              borderColor: '#343541',
              boxShadow: 15,
            }}
            endAdornment={(
              <InputAdornment position="end">
                <IconButton
                  type="submit"
                  disabled={userInput.trim() === ""}
                >
                  {loading ? <CircularProgress size={24} /> : <SendIcon sx={{ fill: userInput.trim() ? '#FFFFFF' : '#6E6E7E' }} />}
                </IconButton>
              </InputAdornment>
            )}
          />
        </form>
      </Box>
    </>

  );
}