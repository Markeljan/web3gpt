import { Box } from '@mui/material';
import { SmartToy, AccountCircle } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown'
import { Message } from '@/types/types';

const ChatMessage: React.FC<Message> = ({ role, content }) => (
    <Box px={2} sx={{ backgroundColor: role === "assistant" ? "#444754" : "#343541" }}>
        <Box sx={{ width: '100%', maxWidth: '48rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', mx: 'auto', my: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'top', width: '100%', p: 1, color: "#ECECF1", my: 0.5, position: 'relative' }}>
                <Box sx={{ width: '3.75rem' }}>
                    {role === "assistant" ? (
                        <SmartToy sx={{ color: '#ECECF1', fontSize: '2rem' }} />
                    ) : (
                        <AccountCircle sx={{ color: '#ECECF1', fontSize: '2rem' }} />
                    )}
                </Box>
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', wordWrap: 'break-word', fontSize: '1rem', lineHeight: '1.5rem', fontWeight: '300' }}>
                    <ReactMarkdown linkTarget={"_blank"}>{content}</ReactMarkdown>
                </Box>
                <Box sx={{ width: { xs: '0.5rem', md: '3.75rem' } }} />
            </Box>
        </Box>
    </Box>
);

export default ChatMessage;