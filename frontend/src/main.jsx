import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./AuthContext.jsx"; // <--- 1. Import it

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {" "}
        {/* <--- 2. Wrap your App inside it */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
