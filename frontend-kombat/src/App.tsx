import { useState } from "react"

import GameWrapper from "./components/GameWrapper"
import ArrowButton from "./components/ArrowButton"

import StartPage from "./pages/StartPage"
import ConfigPage from "./pages/ConfigPage"
import ModePage from "./pages/ModePage"
import MinionTypePage from "./pages/MinionTypePage"
import SelectCharacterPage from "./pages/SelectCharacterPage"
import SelectMinionHumanPage from "./pages/SelectMinionHumanPage"
import StrategySetupPage from "./pages/StrategySetupPage"

import { setMode } from "./api/gameApi"

function App() {
  const [page, setPage] = useState<
    | "start"
    | "config"
    | "mode"
    | "minionType"
    | "selectUI"
    | "minionSetup"
    | "strategy"
  >("start")

  // -------------------- MODE --------------------
  const handleModeConfirm = async (
    mode: "DUEL" | "SOLITAIRE" | "AUTO"
  ) => {
    try {
      const result = await setMode(mode)
      console.log("Backend response:", result)
      setPage("minionType")
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to connect backend")
    }
  }

  // -------------------- BACK LOGIC --------------------
  const handleBack = () => {
    switch (page) {
      case "config":
        setPage("start")
        break
      case "mode":
        setPage("start")
        break
      case "minionType":
        setPage("mode")
        break
      case "selectUI":
        setPage("minionType")
        break
      case "minionSetup":
        setPage("selectUI")
        break
      case "strategy":
        setPage("minionSetup")
        break
    }
  }

  return (
    <GameWrapper
      overlay={
        page !== "start" && (
          <ArrowButton
            direction="left"
            onClick={handleBack}
            className="absolute top-5 left-2 pointer-events-auto scale-75"
          />
        )
      }
    >
      {/* -------------------- START -------------------- */}
      {page === "start" && (
        <StartPage
          onConfig={() => setPage("config")}
          onStart={() => setPage("mode")}
        />
      )}

      {/* -------------------- CONFIG -------------------- */}
      {page === "config" && (
        <ConfigPage
          onBack={handleBack}
          onConfirm={() => setPage("mode")}
        />
      )}

      {/* -------------------- MODE -------------------- */}
      {page === "mode" && (
        <ModePage
          onBack={handleBack}
          onConfirm={handleModeConfirm}
        />
      )}

      {/* -------------------- MINION TYPE -------------------- */}
      {page === "minionType" && (
        <MinionTypePage
          onBack={handleBack}
          onConfirm={() => setPage("selectUI")}
        />
      )}

      {/* -------------------- SELECT CHARACTER -------------------- */}
      {page === "selectUI" && (
        <SelectCharacterPage
          onBack={handleBack}
          onConfirm={() => setPage("minionSetup")}
        />
      )}

      {/* -------------------- MINION SETUP -------------------- */}
      {page === "minionSetup" && (
        <SelectMinionHumanPage
          onBack={handleBack}
          onConfirm={(minion) => {
            console.log("Selected Minion:", minion)
            setPage("strategy")
          }}
        />
      )}

     {/* -------------------- STRATEGY PAGE -------------------- */}
{page === "strategy" && (
  <StrategySetupPage
    onBack={handleBack}
    onConfirm={(code, defenFactor) => {
      console.log("Strategy Code:", code)
      console.log("Defense:", defenFactor)

      // ตอนนี้ยังไม่ต่อ API
      // แค่ย้อนกลับไปหน้า minionSetup ชั่วคราว
      setPage("minionSetup")
    }}
  />
)}
    </GameWrapper>
  )
}

export default App