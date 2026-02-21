import { useState } from "react"
import GameWrapper from "./components/GameWrapper"
import StartPage from "./pages/StartPage"
import ConfigPage from "./pages/ConfigPage"

function App() {
  const [page, setPage] = useState<"start" | "config">("start")

  return (
    <GameWrapper>
      {page === "start" && (
        <StartPage onConfig={() => setPage("config")} />
      )}

      {page === "config" && (
        <ConfigPage onBack={() => setPage("start")} />
      )}
    </GameWrapper>
  )
}

export default App
