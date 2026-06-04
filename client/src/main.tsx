import { createRoot } from "react-dom/client";
import App from "./App";
import "@fontsource/cinzel/latin-400.css";
import "@fontsource/cinzel/latin-600.css";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/cormorant-garamond/latin-600.css";
import "@fontsource/cormorant-garamond/latin-700.css";
import "@fontsource/cormorant-garamond/latin-500-italic.css";
import "@fontsource/cormorant-garamond/latin-600-italic.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/montserrat/latin-500.css";
import "@fontsource/montserrat/latin-600.css";
import "@fontsource/playfair-display/latin-500.css";
import "@fontsource/playfair-display/latin-600.css";
import "@fontsource/playfair-display/latin-700.css";
import "@fontsource/playfair-display/latin-500-italic.css";
import "@fontsource/playfair-display/latin-600-italic.css";
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
