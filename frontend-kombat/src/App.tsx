import { useState } from "react"

import GameWrapper from "./components/GameWrapper"
import ArrowButton from "./components/ArrowButton"

import StartPage from "./pages/StartPage"
import ConfigPage from "./pages/ConfigPage"
import ModePage from "./pages/ModePage"
import MinionTypePage from "./pages/MinionTypePage"
import SelectCharacterPage from "./pages/SelectCharacterPage"

import StrategySetupHumanPage from "./pages/StrategySetupHumanPage"
import StrategySetupDemonPage from "./pages/StrategySetupDemonPage"

import SelectMinionHumanPage from "./pages/SelectMinionHumanPage"
import SelectMinionDemonPage from "./pages/SelectMinionDemonPage"
import PreBattlePage from "./pages/PreBattleSummaryPage"

import type { MinionData, MinionType } from "./types/MinionData"
import { setMode } from "./api/gameApi"

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
    | "minionSetupHuman"
    | "minionSetupDemon"
    | "strategy"
    | "preBattle"
    | "game"
  >("start")

  const [currentFaction, setCurrentFaction] =
    useState<"HUMAN" | "DEMON" | null>(null)

  const [selectedMinion, setSelectedMinion] =
    useState<ConfiguredMinion | null>(null)

  const [minionTypeCount, setMinionTypeCount] =
    useState<number>(0)

  const [minions, setMinions] = useState<ConfiguredMinion[]>([])

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

  const handleRemove = (type: MinionType) => {
    setMinions(prev => prev.filter(m => m.type !== type))
  }

  const handleFinalConfirm = async () => {
    try {
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

      setPage("preBattle")
    } catch (err) {
      console.error(err)
      alert("Failed to complete setup")
    }
  }

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
      case "minionSetupHuman":
      case "minionSetupDemon":
        setPage("selectUI")
        break
      case "strategy":
        if (currentFaction === "DEMON") {
          setPage("minionSetupDemon")
        } else {
          setPage("minionSetupHuman")
        }
        break
      case "preBattle":
        if (currentFaction === "DEMON") {
          setPage("minionSetupDemon")
        } else {
          setPage("minionSetupHuman")
        }
        break
      case "game":
        setPage("preBattle")
        break
    }
  }

  return (
    <GameWrapper
      overlay={
        page !== "start" && page !== "game" && (
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
          onConfirm={(count) => {
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
          onConfirm={(uiType) => {
            setCurrentFaction(uiType)
            setPage(
              uiType === "DEMON"
                ? "minionSetupDemon"
                : "minionSetupHuman"
            )
          }}
        />
      )}

      {page === "minionSetupHuman" && (
        <SelectMinionHumanPage
          minionTypeCount={minionTypeCount}
          minions={minions}
          onBack={handleBack}
          onSelect={(minion) => {
            setSelectedMinion({
              ...minion,
              strategy: "",
              defenseFactor: 1,
            })
            setPage("strategy")
          }}
          onRemove={handleRemove}
          onNext={handleFinalConfirm}
        />
      )}

      {page === "minionSetupDemon" && (
        <SelectMinionDemonPage
          minionTypeCount={minionTypeCount}
          minions={minions}
          onBack={handleBack}
          onSelect={(minion) => {
            setSelectedMinion({
              ...minion,
              strategy: "",
              defenseFactor: 1,
            })
            setPage("strategy")
          }}
          onRemove={handleRemove}
          onNext={handleFinalConfirm}
        />
      )}

      {page === "strategy" && selectedMinion && (
        currentFaction === "DEMON" ? (
          <StrategySetupDemonPage
            minion={selectedMinion}
            onBack={handleBack}
            onConfirm={(code, defenseFactor) => {
              setMinions(prev => [
                ...prev.filter(m => m.type !== selectedMinion.type),
                { ...selectedMinion, strategy: code, defenseFactor }
              ])
              setSelectedMinion(null)
              setPage("minionSetupDemon")
            }}
          />
        ) : (
          <StrategySetupHumanPage
            minion={selectedMinion}
            onBack={handleBack}
            onConfirm={(code, defenseFactor) => {
              setMinions(prev => [
                ...prev.filter(m => m.type !== selectedMinion.type),
                { ...selectedMinion, strategy: code, defenseFactor }
              ])
              setSelectedMinion(null)
              setPage("minionSetupHuman")
            }}
          />
        )
      )}

      {page === "preBattle" && (
        <PreBattlePage
          onBack={handleBack}
          onConfirm={() => setPage("game")}
        />
      )}

      {page === "game" && (
        <div className="w-full h-full flex items-center justify-center text-white text-4xl">
          GAME PAGE (next step)
        </div>
      )}
    </GameWrapper>
  )
}

export default App