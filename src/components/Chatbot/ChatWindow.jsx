import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Card,
  CardContent,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import DoctorCard from "./DoctorCard";
import TypingBubble from "./TypingBubble";
import Toast from "./Toast";

const ChatWindow = ({ onClose, onReset, messages, onSend, isLoading }) => {
  const [toastMessage, setToastMessage] = useState("");
  return (
    <Paper
      elevation={6}
      className="chat-window"
      // sx={{
      //   width: 450,
      //   height: 450,
      //   position: "fixed",
      //   bottom: 80,
      //   right: 20,
      //   display: "flex",
      //   flexDirection: "column",
      //   borderRadius: 2,
      //   overflow: "hidden",
      //   zIndex: 1000,
      // }}
    >
      {/* Header */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}
      <Box
        className="ai-header"
        sx={{
          p: 2,
          // bgcolor: "primary.main",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle1">You Can Ask Me Anything</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title="Reset session">
            <IconButton size="small" onClick={onReset} sx={{ color: "white" }}>
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
          {/* <IconButton size="small" onClick={onClose} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton> */}
        </Box>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          overflowY: "auto",
          bgcolor: "#f9f9f9",
        }}
      >
        {messages.map((msg, index) => {
          // Step 4: Doctor list
          if (msg.type === "doctor-list") {
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  justifyContent: "flex-start",
                }}
              >
                {msg.doctors.map((doc, i) => (
                  <DoctorCard
                    key={doc.doctor_id}
                    doctor={doc}
                    index={i}
                    onSelect={msg.onDoctorSelect}
                  />
                ))}
              </Box>
            );
          }

          // Step 5: Slot list
          if (msg.type === "slot-list") {
            return (
              <Box
                key={index}
                sx={{ display: "flex", flexDirection: "column", gap: 1 }}
              >
                <Typography variant="body2" mt={2} sx={{ fontWeight: "bold" }}>
                  {msg.reply}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {msg.slots.map((slot, i) => (
                    <Card
                      key={`${slot}-${i}`}
                      sx={{
                        cursor: "pointer",
                        minWidth: 90,
                        textAlign: "center",
                        border: "1px solid #1976d2",
                        "&:hover": { bgcolor: "#e3f2fd" },
                      }}
                      onClick={() => msg.onSlotSelect(slot)}
                    >
                      <CardContent sx={{ p: 1 }}>
                        <Typography variant="body2">{slot}</Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            );
          }

          // Step 6: Confirmation (Yes/No)
          if (msg.type === "confirm") {
            return (
              <Box
                key={index}
                sx={{ display: "flex", flexDirection: "column", gap: 1 }}
              >
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {msg.reply}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => msg.onConfirm("yes")}
                  >
                    YES
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => msg.onConfirm("no")}
                  >
                    NO
                  </Button>
                </Box>
              </Box>
            );
          }

          // Default bubble
          return <MessageBubble key={index} {...msg} />;
        })}

        {isLoading && <TypingBubble />}
      </Box>

      {/* Input */}
      <ChatInput onSend={onSend} setToastMessage={setToastMessage} />
    </Paper>
  );
};

export default ChatWindow;
