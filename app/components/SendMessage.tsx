import { Box, CircularProgress, FilledInput, IconButton, InputAdornment } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface SendMessageProps {
    loading: boolean;
    userInput: string;
    handleSubmit: (e: React.FormEvent) => void;
    setUserInput: (value: string) => void;
}

const SendMessage: React.FC<SendMessageProps> = ({ loading, userInput, handleSubmit, setUserInput }) => (
    <Box sx={{ display: 'flex', position: 'fixed', bottom: 0, paddingTop: '48px', width: '100%', backgroundImage: 'linear-gradient(180deg, rgba(53,55,64,0) 0%, #35373F 50%, #35373F 100%)' }}>
        <form onSubmit={handleSubmit} style={{ paddingLeft: '16px', paddingRight: '16px', display: 'flex', width: '100%', justifyContent: 'center' }}>
            <FilledInput
                fullWidth
                multiline
                disableUnderline
                disabled={loading}
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
);

export default SendMessage;