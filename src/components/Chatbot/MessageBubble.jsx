import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const MessageBubble = ({ text, sender }) => {
  const isUser = sender === "user";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 1,
      }}
    >
      <Paper
        sx={{
          p: 1.5,
          maxWidth: "75%",
          bgcolor: isUser ? "#cb6ce6" : "grey.200",
          color: isUser ? "white" : "black",
          borderRadius: 2,
        }}
      >
        <Typography variant="body2">{text}</Typography>
      </Paper>
    </Box>
  );
};

export default MessageBubble;
