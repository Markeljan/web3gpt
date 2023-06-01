import { ButtonMode, IdentityButton,  } from "@civic/ethereum-gateway-react";
import { Box, Typography } from "@mui/material";
import ChatBox from "./ChatBox";

const App = () => {
    
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                mt: { xs: 4, sm: 8}
            }}
        >
            <Typography variant="h2">Web3GPT</Typography>

            <IdentityButton mode={ButtonMode.LIGHT} />

            <ChatBox />
            <iframe width="560" height="315" src="https://www.youtube.com/embed/mMOZx3DpmNg" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>

        </Box>
    );
}

export default App;