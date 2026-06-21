import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { store } from "./store"
import { Provider } from "react-redux"


if (import.meta.env.DEV) {
  void (async () => {
    const [{ default: React }, { default: axe }] = await Promise.all([
      import("react"),
      import("@axe-core/react"),
    ])
    const ReactDOM = await import("react-dom")
    axe(React, ReactDOM, 1000)
  })()
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
)
