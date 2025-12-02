import React, { useRef, useState } from "react";
import { Box, TextField, IconButton, CircularProgress } from "@mui/material";
import { WavRecorder } from "../../utils/wavRecorder";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";

const ChatInput = ({ onSend, setToastMessage }) => {
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const recorderRef = useRef(null);

  // -----------------------
  // 🎤 Start Recording
  // -----------------------
  const startRecording = async () => {
    recorderRef.current = new WavRecorder();
    await recorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = async () => {
    setRecording(false);
    setLoading(true);
    const wavFile = await recorderRef.current.stop();
    sendToSpeechAPI(wavFile);
  };
  // -----------------------
  // 📤 Convert Blob → WAV → Send to API
  // -----------------------
  const sendToSpeechAPI = async (file) => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(
      "https://sttconfi-e4fdbaa3bjcbbmg8.canadacentral-01.azurewebsites.net/stt",
      {
        method: "POST",
        body: form,
      }
    );

    const data = await res.json();
    if (data.error) {
      setToastMessage(data.error); // <-- SHOW POPUP
      setLoading(false);
      return;
    }
    if (data.text) setMessage((prev) => prev + " " + data.text);
    setLoading(false);
  };
  const handleSend = () => {
    if (message.trim() === "") return;
    onSend(message);
    setMessage("");
  };

  return (
    <Box sx={{ display: "flex", p: 1, borderTop: "1px solid #ddd" }}>
      <TextField
        fullWidth
        size="small"
        sx={{ mr: 2 }}
        placeholder="Enter your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />

      {/* 🎤 MIC BUTTON */}
      <IconButton
        onClick={recording ? stopRecording : startRecording}
        sx={{ color: "#750096", mx: 1 }}
        className="mic-btn"
      >
        {loading ? (
          <CircularProgress size={22} sx={{ color: "#750096" }} />
        ) : recording ? (
          <StopIcon />
        ) : (
          <MicIcon />
        )}
      </IconButton>

      <IconButton className="send-button" onClick={handleSend}>
        <SendIcon />
      </IconButton>
    </Box>
  );
};

export default ChatInput;
