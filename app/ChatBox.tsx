import { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, List, ListItem, Typography } from "@mui/material";
import axios from 'axios';

interface Message {
    role: "user" | "assistant";
    content: string;
}

const ChatBox: React.FC = () => {
    const [input, setInput] = useState<string>("");
    const [conversation, setConversation] = useState<Message[]>([]);

    // Scroll to bottom of chatbox on update
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversation]);

    const handleSend = async () => {
        setConversation([...conversation, { role: "user", content: input }]);

        // Send a POST request to the OpenAI API
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [...conversation, { role: "user", content: input }]
            },
            { headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPEN_AI_API_KEY}` } }
        );

        setConversation([...conversation, { role: "user", content: input }, { role: "assistant", content: response.data.choices[0].message.content }]);
        setInput("");
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: 400, overflow: 'auto' }}>
            <List>
                {conversation.map((message, index) => (
                    <ListItem key={index}>
                        <Typography variant="body1" color={message.role === 'assistant' ? "primary" : "secondary"}>
                            <strong>{message.role}:</strong> {message.content}
                        </Typography>
                    </ListItem>
                ))}
                <div ref={messagesEndRef} />
            </List>
            <Box sx={{ display: 'flex', marginTop: 'auto', padding: 1 }}>
                <TextField
                    variant="outlined"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    fullWidth
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSend}
                >
                    Send
                </Button>
            </Box>
        </Box>
    );
}

export default ChatBox;
