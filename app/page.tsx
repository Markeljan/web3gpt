"use client";

import { Box, Typography } from "@mui/material";

export default function Home() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography variant="h1">Web3 GPT4</Typography>

      <Typography variant="body1">Built during ETHGlobal Lisbon 2023 Hackathon</Typography>
    </Box>
  );
}
