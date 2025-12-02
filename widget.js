import React from "react";
import ReactDOM from "react-dom/client";
import Chatbot from "./src/components/Chatbot/Chatbot.jsx";

class HimsChatbot extends HTMLElement {
  connectedCallback() {
    this.style.all = "unset"; // no shadow DOM
    const root = ReactDOM.createRoot(this);
    root.render(React.createElement(Chatbot));
  }
}

customElements.define("hims-chatbot", HimsChatbot);
