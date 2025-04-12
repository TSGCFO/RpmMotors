import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Define global styles as CSS variables to complement theme.json
const style = document.createElement('style');
style.textContent = `
  :root {
    /* Base colors from theme */
    --primary: 0 0% 0%;
    --primary-foreground: 0 0% 100%;
    
    /* Custom colors */
    --secondary: 352 79% 49%; /* Racing red: #E31837 */
    --secondary-foreground: 0 0% 100%;
    --background: 0 0% 100%; /* White: #FFFFFF */
    --foreground: 0 0% 20%; /* Dark grey: #333333 */
    --accent: 0 0% 96%; /* Light grey: #F5F5F5 */
    
    /* Font families */
    --font-poppins: 'Poppins', sans-serif;
    --font-open-sans: 'Open Sans', sans-serif;
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
