import { useState } from "react"
import GameWrapper from "./components/GameWrapper"
import StartPage from "./pages/StartPage"
import ConfigPage from "./pages/ConfigPage"
import ModePage from "./pages/ModePage"
import MinionTypePage from "./pages/MinionTypePage"
import { setMode } from "./api/gameApi"

function App() {
  const [page, setPage] = useState<
    "start" | "config" | "mode" | "minion" | "minionSetup"
  >("start")

  const handleModeConfirm = async (
    mode: "DUEL" | "SOLITAIRE" | "AUTO"
  ) => {
    try {
      console.log("Sending mode:", mode)

      const result = await setMode(mode)

      console.log("Backend response:", result)

      setPage("minion")

    } catch (error) {
      console.error("Error:", error)
      alert("Failed to connect backend")
    }
  }

  return (
    <GameWrapper>

      {page === "start" && (
        <StartPage
          onConfig={() => setPage("config")}
          onStart={() => setPage("mode")}
        />
      )}

      {page === "config" && (
        <ConfigPage
          onBack={() => setPage("start")}
          onConfirm={() => setPage("mode")}
        />
      )}

      {page === "mode" && (
        <ModePage
          onBack={() => setPage("start")}
          onConfirm={handleModeConfirm}
        />
      )}

      {page === "minion" && (
        <MinionTypePage
          onBack={() => setPage("mode")}
          onConfirm={(minionType) => {
            console.log("Selected Minion Type:", minionType)

            // 🔥 ไปหน้า MinionSetup แทน alert
            setPage("minionSetup")
          }}
        />
      )}

      {page === "minionSetup" && (
        <div className="text-white text-3xl">
          MINION SETUP PAGE (ยังไม่ได้สร้าง)
        </div>
      )}

    </GameWrapper>
  )
}

export default App