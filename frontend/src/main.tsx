import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import { App } from "./App";
import "./style.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <Provider store={store}>
    <App />
  </Provider>
);
