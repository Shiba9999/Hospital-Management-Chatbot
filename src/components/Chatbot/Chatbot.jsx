import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ChatbotButton from "./ChatbotButton";
import ChatWindow from "./ChatWindow";
import { sendMessageToChat } from "../../api/chatApi";
import "/public/css/chatbot.css";
import "/public/css/typingBubble.css";
import "/public/css/toast.css";

// helpers
const shortId = () => uuidv4().replace(/-/g, "").slice(0, 8);
const isValidName = (s) => {
  const t = s.trim();
  if (!t) return false;
  if (/\d/.test(t)) return false; // no digits allowed
  // at least 2 letters overall
  return /[a-zA-Z].*[a-zA-Z]/.test(t);
};
const isValidPhone = (s) => /^\+?\d{10,13}$/.test(s.trim().replace(/\s+/g, ""));

const stageToExpecting = (stage) => {
  switch (stage) {
    case "collect_phone":
      return "phone";
    case "collect_problem":
      return "problem";
    case "collect_time_preference":
      return "doctor-choice";
    case "collect_time_preference_after_doctor":
      return "slot-choice";
    case "final_confirm":
      return "confirm";
    case "done":
      return "done";
    default:
      return null;
  }
};

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [expecting, setExpecting] = useState(null); // name | phone | problem | doctor-choice | slot-choice | confirm | done

  const resetSession = () => {
    setSessionId(shortId());
    setMessages([{ text: "Welcome! Please send me your name", sender: "bot" }]);
    setExpecting("name");
  };

  const startChat = () => {
    setOpen(true);
    resetSession();
  };

  const softExpireSession = () => {
    // keep messages visible but block further API calls until reset
    setSessionId("");
    setExpecting("done");
  };

  const sendWithRetry = async (sessionId, msg, retries = 10, delay = 500) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await sendMessageToChat(sessionId, msg);
      } catch (err) {
        if (
          err?.response?.status === 500 || // axios style
          err?.status === 500 || // fetch style
          err?.message?.includes("500")
        ) {
          console.warn(`Retry ${i + 1}/${retries} after 500 error`);
          if (i < retries - 1) {
            await new Promise((res) => setTimeout(res, delay));
            continue; // retry
          }
        }
        throw err; // other errors -> break immediately
      }
    }
    throw new Error("Max retries reached");
  };

  const handleSend = async (raw) => {
    const msg = (raw || "").trim();
    if (!msg) return;

    // Show user bubble
    setMessages((prev) => [...prev, { text: msg, sender: "user" }]);

    // If session already expired (after "done")
    if (!sessionId) {
      setMessages((prev) => [
        ...prev,
        {
          text: "ℹ️ Session ended. Tap Reset to start a new chat.",
          sender: "bot",
        },
      ]);
      return;
    }

    // Block manual typing when a click is expected
    if (
      expecting === "doctor-choice" ||
      expecting === "slot-choice" ||
      expecting === "confirm"
    ) {
      setMessages((prev) => [
        ...prev,
        { text: "⚠️ Please choose from the options above.", sender: "bot" },
      ]);
      return;
    }

    // Stage-aware validation
    if (expecting === "name" && !isValidName(msg)) {
      setMessages((prev) => [
        ...prev,
        {
          text: "⚠️ That doesn’t look like a valid name. Please enter only letters.",
          sender: "bot",
        },
      ]);
      return;
    }
    if (expecting === "phone" && !isValidPhone(msg)) {
      setMessages((prev) => [
        ...prev,
        {
          text: "⚠️ Please enter a valid phone number (10–13 digits, optional +).",
          sender: "bot",
        },
      ]);
      return;
    }

    try {
      setLoading(true);
      const res = await sendWithRetry(sessionId, msg);

      setLoading(false);

      // Step 4: doctor cards (do not show reply text here)
      if (res?.stage === "collect_time_preference" && res?.context?.doctors) {
        setExpecting("doctor-choice");
        setMessages((prev) => [
          ...prev,
          {
            type: "doctor-list",
            doctors: res.context.doctors,
            onDoctorSelect: async (choice) => {
              // user clicked a doctor card (1, 2, ...)
              //   setMessages((prev2) => [
              //     ...prev2,
              //     { text: `Selected Doctor #${choice}`, sender: "user" },
              //   ]);
              const selectedDoctor = res.context.doctors.find(
                (_, idx) => idx + 1 === choice
              );
              setMessages((prev2) => [
                ...prev2,
                {
                  text: `Selected Doctor ${selectedDoctor?.doctor_name}`,
                  sender: "user",
                },
              ]);
              setLoading(true);
              const doctorRes = await sendWithRetry(sessionId, String(choice));
              setLoading(false);

              // Step 5: show available slots (split by comma)
              if (
                doctorRes?.stage === "collect_time_preference_after_doctor" &&
                doctorRes?.context?.chosen_doctor?.available_slots
              ) {
                setExpecting("slot-choice");
                const slots = doctorRes.context.chosen_doctor.available_slots
                  .split(",")
                  .map((s) => s.trim());

                setMessages((prev3) => [
                  ...prev3,
                  {
                    type: "slot-list",
                    reply: doctorRes.reply, // show the guidance text above the cards
                    slots,
                    onSlotSelect: async (slot) => {
                      setMessages((prev4) => [
                        ...prev4,
                        { text: `Selected Slot: ${slot}`, sender: "user" },
                      ]);

                      setLoading(true);
                      // First API call returns "confirm_slot" message — skip showing it
                      await sendWithRetry(sessionId, slot);

                      // Second call -> final_confirm
                      const confirmRes = await sendWithRetry(sessionId, slot);
                      setLoading(false);

                      if (confirmRes?.stage === "final_confirm") {
                        setExpecting("confirm");
                        setMessages((prev5) => [
                          ...prev5,
                          {
                            type: "confirm",
                            reply: confirmRes.reply,
                            onConfirm: async (ans) => {
                              setMessages((prev6) => [
                                ...prev6,
                                { text: `Selected: ${ans}`, sender: "user" },
                              ]);
                              setLoading(true);
                              const finalRes = await sendWithRetry(
                                sessionId,
                                ans
                              );
                              setLoading(false);
                              if (finalRes?.reply) {
                                setMessages((prev7) => [
                                  ...prev7,
                                  { text: finalRes.reply, sender: "bot" },
                                ]);
                              }
                              // Expire the session after completion
                              softExpireSession();
                            },
                          },
                        ]);
                      }
                    },
                  },
                ]);
              } else if (doctorRes?.reply) {
                // fallback
                setMessages((prev3) => [
                  ...prev3,
                  { text: doctorRes.reply, sender: "bot" },
                ]);
                setExpecting(stageToExpecting(doctorRes?.stage));
              }
            },
          },
        ]);
        return;
      }

      // Normal reply path (name -> phone -> problem)
      if (res?.reply) {
        setMessages((prev) => [...prev, { text: res.reply, sender: "bot" }]);
        setExpecting(stageToExpecting(res?.stage));
      }
    } catch (error) {
      console.log("Chatbot error:", error);
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        { text: "⚠️ Sorry, something went wrong.", sender: "bot" },
      ]);
    }
  };

  useEffect(() => {
    startChat();
  }, []);

  return (
    <>
      <ChatWindow
        onClose={() => {
          setOpen(false);
          // Reset when closing the window
          resetSession();
          setOpen(false);
        }}
        onReset={resetSession}
        messages={messages}
        onSend={handleSend}
        isLoading={loading}
      />

      {/* <ChatbotButton onClick={startChat} /> */}
    </>
  );
};

export default Chatbot;
