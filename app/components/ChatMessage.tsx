import { Box } from '@mui/material';
import { SmartToy, AccountCircle } from '@mui/icons-material';
import { ChatCompletionResponseMessage } from 'openai';


const renderHTMLContent = (htmlString: string) => {
    // Regex for bold, italic and link tags
    const boldRegex = /<b>(.*?)<\/b>/g;
    const italicRegex = /<i>(.*?)<\/i>/g;
    const linkRegex = /<a href="(.*?)">(.*?)<\/a>/g;

    // Replaces the tags with their React equivalent
    let formattedString = htmlString
        .replace(boldRegex, (_, match) => `<strong>${match}</strong>`)
        .replace(italicRegex, (_, match) => `<em>${match}</em>`)
        .replace(linkRegex, (_, href, text) => `<a href="${href}" target="_blank" rel="noopener noreferrer" class="customLink">${text}</a>`);

    // Since this is a string of HTML, it needs to be parsed into React elements.
    // This is generally not advised because it can be a security risk.
    // In this case, we know exactly what we're putting in, so it's fine.
    return <div dangerouslySetInnerHTML={{ __html: formattedString }} />;
};


const ChatMessage: React.FC<ChatCompletionResponseMessage> = ( message ) => {
    if (!message) return null;
    const { role, content, function_call } = message;

    if (role === "system") return null;

    return (
        <Box px={2} sx={{ backgroundColor: role === "assistant" ? "#444754" : "#343541" }}>
            <Box sx={{ width: '100%', maxWidth: '48rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', mx: 'auto', my: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'top', width: '100%', p: 1, color: "#ECECF1", my: 0.5, position: 'relative' }}>
                    <Box sx={{ width: '3.75rem' }}>
                        {role === "user" ? (
                            <AccountCircle sx={{ color: '#ECECF1', fontSize: '2rem' }} />
                           
                        ) : role === "assistant" ?  (
                            <SmartToy sx={{ color: '#ECECF1', fontSize: '2rem' }} />
                        ) : null}
                    </Box>
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', wordWrap: 'break-word', fontSize: '1rem', lineHeight: '1.5rem', fontWeight: '300' }}>
                        {renderHTMLContent(content || "")}
                    </Box>
                    <Box sx={{ width: { xs: '0.5rem', md: '3.75rem' } }} />
                </Box>
            </Box>
        </Box>
    );
}

export default ChatMessage;