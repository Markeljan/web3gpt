import { useEffect, useRef } from "react";
import { Message } from "@/types/types";
import ChatMessage from "@/components/ChatMessage";

interface ChatBoxProps {
    conversation: Message[];
}

const ChatBox: React.FC<ChatBoxProps> = ({ conversation }) => {
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [conversation]);

    return (
        <>
            {conversation.map((conversation, index) => (
                <ChatMessage key={index} role={conversation.role} content={conversation.content} />
            ))}
            <div ref={messagesEndRef} />
        </>
    );
}

export default ChatBox;