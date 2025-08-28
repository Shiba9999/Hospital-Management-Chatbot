import axios from "axios";

const BASE_URL = "https://hospitaldocker-gsgmhybjbvbpgxhb.canadacentral-01.azurewebsites.net/chat";

export const sendMessageToChat = async (sessionId, message) => {
  try {
    const response = await axios.post(BASE_URL, {
      session_id: sessionId,
      message: message,
    });
    return response.data;
  } catch (error) {
    console.error("Chat API error:", error);
    throw error;
  }
};
