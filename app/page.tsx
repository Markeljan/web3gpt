"use client"
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { Box, Typography, IconButton, Grid } from '@mui/material';
import { YouTube, Twitter } from '@mui/icons-material';
import Message from '@/components/ChatMessage';
import SendMessage from '@/components/SendMessage';
import { useChat } from '@/hooks/useChat';

export default function Home() {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { messages, userInput, setUserInput, handleSubmit, loading } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', pb: 20, color: '#ECECF1', width: '100%', maxWidth: 'none' }}>
        <Box sx={{ backgroundColor: "#444754" }}>
          <Grid container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 1 }}>
            <Typography variant="subtitle2" color="#C5C5D2" sx={{ flex: 1, textAlign: 'center', fontWeight: '300' }}>
              Model: GPT-3.5
            </Typography>

            <IconButton aria-label="Twitter" component="a" target='_blank' href="https://twitter.com/0xmarkeljan">
              <Twitter sx={{ color: '#C5C5D2' }} />
            </IconButton>

            <IconButton aria-label="YouTube" component="a" target='_blank' href='https://www.youtube.com/live/E2Ynuq7Eorc?feature=share&t=2776'>
              <YouTube sx={{ color: '#C5C5D2' }} />
            </IconButton>
          </Grid>

        </Box>
        <Box sx={{
          display: { xs: 'none', md: messages.length ? 'none' : 'flex' }, justifyContent: 'center', alignItems: 'center', width: '555px', height: '120px', backgroundColor: "#fff",
          position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.25, userSelect: 'none', pointerEvents: 'none'
        }}>
          <Image src="/w3gpt_med.svg" alt="W3GPT Logo" width={800} height={800} />
        </Box>
        {messages.map((message, index) => (
          <Message key={index} role={message.role} content={message.content} />
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <SendMessage handleSubmit={handleSubmit} userInput={userInput} setUserInput={setUserInput} loading={loading} />
    </>

  );
}