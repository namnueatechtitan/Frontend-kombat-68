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
import GameplayPage from "./pages/GameplayPage"
import SelectMinionHumanPage from "./pages/SelectMinionHumanPage"
import SelectMinionDemonPage from "./pages/SelectMinionDemonPage"
import PreBattlePage from "./pages/PreBattleSummaryPage"
import { setMode, setupFull } from "./api/gameApi"

import type { MinionData, MinionType } from "./types/MinionData"

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

  const [setupPlayer, setSetupPlayer] = useState<1 | 2>(1)

  const [currentFaction, setCurrentFaction] =
    useState<"HUMAN" | "DEMON" | null>(null)

  const [selectedMinion, setSelectedMinion] =
    useState<ConfiguredMinion | null>(null)

  const [minionTypeCount, setMinionTypeCount] =
    useState<number>(0)

  const [minionsByPlayer, setMinionsByPlayer] =
    useState<Record<1 | 2, ConfiguredMinion[]>>({
      1: [],
      2: []
    })

  const currentMinions = minionsByPlayer[setupPlayer]

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
    setMinionsByPlayer(prev => ({
      ...prev,
      [setupPlayer]: prev[setupPlayer].filter(m => m.type !== type)
    }))
  }

  const handleFinalConfirm = async () => {

    if (currentMinions.length !== minionTypeCount) {
      alert("Please configure all minions first")
      return
    }

    const isPlayer1 = setupPlayer === 1

    try {

      await setupFull(
        setupPlayer,
        currentMinions.map(m => ({
          type: m.type,
          strategy: m.strategy,
          defenseFactor: m.defenseFactor,
        }))
      )

      if (isPlayer1) {
        setSetupPlayer(2)
        setCurrentFaction(null)
        setSelectedMinion(null)
        setPage("selectUI")
      } else {
        setCurrentFaction(null)
        setSelectedMinion(null)
        setPage("preBattle")
      }

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
        setPage("selectUI")
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
            setMinionsByPlayer({ 1: [], 2: [] })
            setPage("selectUI")
          }}
        />
      )}

      {page === "selectUI" && (
        <SelectCharacterPage
          setupPlayer={setupPlayer}
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
          minions={currentMinions}
          onBack={handleBack}
          onSelect={(minion) => {
            setSelectedMinion({
              ...minion,
              strategy: minion.strategy || "",
              defenseFactor: minion.defenseFactor || 1,
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
          minions={currentMinions}
          onBack={handleBack}
          onSelect={(minion) => {
            setSelectedMinion({
              ...minion,
              strategy: minion.strategy || "",
              defenseFactor: minion.defenseFactor || 1,
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
              setMinionsByPlayer(prev => ({
                ...prev,
                [setupPlayer]: [
                  ...prev[setupPlayer].filter(m => m.type !== selectedMinion.type),
                  { ...selectedMinion, strategy: code, defenseFactor }
                ]
              }))
              setSelectedMinion(null)
              setPage("minionSetupDemon")
            }}
          />
        ) : (
          <StrategySetupHumanPage
            minion={selectedMinion}
            onBack={handleBack}
            onConfirm={(code, defenseFactor) => {
              setMinionsByPlayer(prev => ({
                ...prev,
                [setupPlayer]: [
                  ...prev[setupPlayer].filter(m => m.type !== selectedMinion.type),
                  { ...selectedMinion, strategy: code, defenseFactor }
                ]
              }))
              setSelectedMinion(null)
              setPage("minionSetupHuman")
            }}
          />
        )
      )}

      {page === "preBattle" && (
        <PreBattlePage
          onBack={handleBack}
          onConfirm={() => {
            setPage("game")
          }}
        />
      )}

      {page === "game" && (
        <GameplayPage onRestart={() => setPage("mode")} />
      )}

    </GameWrapper>
  )
}

export default App
