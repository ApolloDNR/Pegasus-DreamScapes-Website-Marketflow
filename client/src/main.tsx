import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const host = window.location.hostname.toLowerCase();
const isPreviewHost =
  host.includes("replit.dev") ||
  host.includes("replit.app") ||
  host.includes("repl.co") ||
  host === "localhost" ||
  host === "127.0.0.1";

if (isPreviewHost) {
  let robotsMeta = document.querySelector('meta[name="robots"]');
  if (!robotsMeta) {
    robotsMeta = document.createElement("meta");
    robotsMeta.setAttribute("name", "robots");
    document.head.appendChild(robotsMeta);
  }
  robotsMeta.setAttribute("content", "noindex,nofollow,noarchive,nosnippet");
}

createRoot(document.getElementById("root")!).render(<App />);
