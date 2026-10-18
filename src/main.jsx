import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// No StrictMode: the WebGL experience mutates the DOM (SplitText, GSAP) and
// must be created exactly once.
createRoot(document.getElementById("root")).render(<App />);
