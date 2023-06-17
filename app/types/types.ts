export type Message = {
    role: string;
    content: string;
};

export type Conversation = Message[];