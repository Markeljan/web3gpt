import { useEffect, useRef } from "react";
import { ChatCompletionResponseMessage } from "openai";
import ChatMessage from "@/components/ChatMessage";


const ChatBox: React.FC<ChatCompletionResponseMessage[]> = (messages) => {
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    return (
        <>
            {messages.map((message: ChatCompletionResponseMessage, index) => (
                <ChatMessage key={index} {...message} />
            ))}
            <div ref={messagesEndRef} />
        </>
    );
}

export default ChatBox;