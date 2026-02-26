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

import type { MinionData, MinionType } from "./types/MinionData"
import { setMode, startGame } from "./api/gameApi"

interface ConfiguredMinion extends MinionData {
  strategy: string
  defenseFactor: number
}

function App() {
  const [page, setPage] = useState<
    | "start"
    | "config"
    | "mode"
    | "minionType"
    | "selectUI"
    | "minionSetup"
    | "strategy"
    | "preBattle"
  >("start")

  const [selectedMinion, setSelectedMinion] =
    useState<ConfiguredMinion | null>(null)

  const [minionTypeCount, setMinionTypeCount] =
    useState<number>(0)

  const [minions, setMinions] = useState<ConfiguredMinion[]>([])

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

  // -------------------- REMOVE --------------------
  const handleRemove = (type: MinionType) => {
    setMinions(prev => prev.filter(m => m.type !== type))
  }

  // -------------------- FINAL CONFIRM --------------------
  const handleFinalConfirm = async () => {
    try {

      // 🔥 ป้องกันกด confirm ทั้งที่ยังไม่ครบ
      if (minions.length !== minionTypeCount) {
        alert("Please configure all minions first")
        return
      }

      const res = await fetch("http://localhost:8080/api/game/setup/full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          minions.map(m => ({
            type: m.type,
            strategy: m.strategy,
            defenseFactor: m.defenseFactor,
          }))
        ),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Setup failed")
      }

      await startGame()
      setPage("preBattle")

    } catch (err) {
      console.error(err)
      alert("Failed to start game")
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
            setMinions([])
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
          minions={minions}
          onBack={handleBack}
          onSelect={(minion) => {
            const existing = minions.find(m => m.type === minion.type)

            if (existing) {
              setSelectedMinion(existing)
            } else {
              setSelectedMinion({
                ...minion,
                strategy: "",
                defenseFactor: 1,
              })
            }

            setPage("strategy")
          }}
          onRemove={handleRemove}
          onNext={handleFinalConfirm}
        />
      )}

      {page === "strategy" && selectedMinion && (
        <StrategySetupPage
          minion={selectedMinion}
          onBack={handleBack}
          onConfirm={(code, defenseFactor) => {
            setMinions(prev => {
              const exists = prev.find(m => m.type === selectedMinion.type)

              if (exists) {
                return prev.map(m =>
                  m.type === selectedMinion.type
                    ? { ...m, strategy: code, defenseFactor }
                    : m
                )
              }

              return [
                ...prev,
                { ...selectedMinion, strategy: code, defenseFactor },
              ]
            })

            setSelectedMinion(null)
            setPage("minionSetup")
          }}
        />
      )}

      {page === "preBattle" && (
        <div className="w-full h-full flex items-center justify-center text-white text-4xl">
          PRE BATTLE PAGE
        </div>
      )}
    </GameWrapper>
  )
}

export default App