import Image from "next/image";
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
                mt: -12,
            }}
        >
            <Box textAlign='center'>
                <Image src="/w3gptlogo_medium.svg" alt="Web3GPT Logo" height={400} width={400} />
            </Box>
            <ChatBox />
            <iframe width="560" height="315" src="https://www.youtube.com/embed/E2Ynuq7Eorc?start=2776" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
            <footer>
                <Typography variant="body1" color="textSecondary">
                   <a href="https://twitter.com/0xMarkeljan">Twitter</a> | <a href="https://github.com/markeljan/web3-gpt4">Github</a>
                </Typography>
            </footer>
        </Box>
    );
}

export default App;