import { useState } from "react"

import GameWrapper from "./components/GameWrapper"
import ArrowButton from "./components/ArrowButton"

import StartPage from "./pages/StartPage"
import ConfigPage from "./pages/ConfigPage"
import ModePage from "./pages/ModePage"
import MinionTypePage from "./pages/MinionTypePage"
import SelectCharacterPage from "./pages/SelectCharacterPage"
import StrategySetupPage from "./pages/StrategySetupPage"
import SelectMinionHumanPage from "./pages/SelectMinionHumanPage"
import type { MinionData } from "./types/MinionData"
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
    | "preBattle"   // ✅ เพิ่มหน้าใหม่
  >("start")

  const [selectedMinion, setSelectedMinion] =
    useState<MinionData | null>(null)

  const [minionTypeCount, setMinionTypeCount] =
    useState<number>(0)

  const [createdCount, setCreatedCount] =
    useState<number>(0)

  // -------------------- MODE --------------------
  const handleModeConfirm = async (
    mode: "DUEL" | "SOLITAIRE" | "AUTO"
  ) => {
    try {
      await setMode(mode)
      setPage("minionType")
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to connect backend")
    }
  }

  // -------------------- BACK --------------------
  const handleBack = () => {
    switch (page) {
      case "config":
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
      case "preBattle":
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
      {page === "start" && (
        <StartPage
          onConfig={() => setPage("config")}
          onStart={() => setPage("mode")}
        />
      )}

      {page === "config" && (
        <ConfigPage
          onBack={handleBack}
          onConfirm={() => setPage("mode")}
        />
      )}

      {page === "mode" && (
        <ModePage
          onBack={handleBack}
          onConfirm={handleModeConfirm}
        />
      )}

      {page === "minionType" && (
        <MinionTypePage
          onBack={handleBack}
          onConfirm={(count: number) => {
            setMinionTypeCount(count)
            setCreatedCount(0)
            setSelectedMinion(null)
            setPage("selectUI")
          }}
        />
      )}

      {page === "selectUI" && (
        <SelectCharacterPage
          onBack={handleBack}
          onConfirm={() => setPage("minionSetup")}
        />
      )}

      {page === "minionSetup" && (
        <SelectMinionHumanPage
          minionTypeCount={minionTypeCount}
          createdCount={createdCount}
          onBack={handleBack}
          onNext={() => setPage("preBattle")}   // ✅ ส่งไปหน้า PreBattle
          onConfirm={(minion) => {
            setSelectedMinion(minion)
            setPage("strategy")
          }}
        />
      )}

      {page === "strategy" && selectedMinion && (
        <StrategySetupPage
          minion={selectedMinion}
          onBack={handleBack}
          onConfirm={() => {
            setCreatedCount(prev => {
              const newCount = prev + 1
              return newCount
            })

            setSelectedMinion(null)
            setPage("minionSetup") // กลับไปหน้า setup เสมอ
          }}
        />
      )}

      {/* ✅ หน้า Pre Battle เปล่า ๆ */}
      {page === "preBattle" && (
        <div className="w-full h-full flex items-center justify-center text-white text-4xl">
          PRE BATTLE PAGE
        </div>
      )}

    </GameWrapper>
  )
}

export default App