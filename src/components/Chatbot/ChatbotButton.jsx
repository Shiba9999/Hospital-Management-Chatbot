import React from "react";
import { Fab } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";

const ChatbotButton = ({ onClick }) => {
  return (
    <Fab
      color="primary"
      aria-label="chat"
      onClick={onClick}
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 1000,
      }}
    >
      <ChatIcon />
    </Fab>
  );
};

export default ChatbotButton;
