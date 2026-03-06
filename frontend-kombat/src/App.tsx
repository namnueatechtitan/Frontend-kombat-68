import { useEffect, useRef, useState } from "react"

import GameWrapper from "./components/GameWrapper"
import ArrowButton from "./components/ArrowButton"

import StartPage from "./pages/StartPage"
import ConfigPage from "./pages/ConfigPage"
import ModePage from "./pages/ModePage"
import MinionTypePage from "./pages/MinionTypePage"
import SelectCharacterPage from "./pages/SelectCharacterPage"
import GameLobbyPage from "./pages/GameLobbyPage"

import StrategySetupHumanPage from "./pages/StrategySetupHumanPage"
import StrategySetupDemonPage from "./pages/StrategySetupDemonPage"
import GameplayPage from "./pages/GameplayPage"
import SelectMinionHumanPage from "./pages/SelectMinionHumanPage"
import SelectMinionDemonPage from "./pages/SelectMinionDemonPage"
import PreBattlePage from "./pages/PreBattleSummaryPage"
import { resetGame, setCharacter, setMode, setupFull } from "./api/gameApi"
import gameStartBgm from "./Soubd_Audio/Game start.mp3"
import { demonMinions } from "./data/demonMinions"
import { humanMinions } from "./data/humanMinions"

import type { MinionData, MinionType } from "./types/MinionData"

interface ConfiguredMinion extends MinionData {
  strategy: string
  defenseFactor: number
}

function App() {
  const demonNameByType = new Map(
    demonMinions.map((minion) => [minion.type, minion.name])
  )
  const humanNameByType = new Map(
    humanMinions.map((minion) => [minion.type, minion.name])
  )

  const [page, setPage] = useState<
    | "start"
    | "config"
    | "mode"
    | "lobby"
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
  const [selectedMode, setSelectedMode] =
    useState<"DUEL" | "SOLITAIRE" | "AUTO" | null>(null)
  const [wsRoomId, setWsRoomId] = useState<string | null>(null)
  const [wsPlayerName, setWsPlayerName] = useState<string | null>(null)
  const [wsPlayerId, setWsPlayerId] = useState<number | null>(null)

  const [minionsByPlayer, setMinionsByPlayer] =
    useState<Record<1 | 2, ConfiguredMinion[]>>({
      1: [],
      2: []
    })
  const bgmRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const bgm = new Audio(gameStartBgm)
    bgm.loop = true
    bgm.volume = 0.35
    bgmRef.current = bgm

    const tryPlay = () => {
      void bgm.play().catch(() => {})
    }

    tryPlay()
    const unlockAudio = () => tryPlay()
    window.addEventListener("pointerdown", unlockAudio, { once: true })
    window.addEventListener("keydown", unlockAudio, { once: true })

    return () => {
      window.removeEventListener("pointerdown", unlockAudio)
      window.removeEventListener("keydown", unlockAudio)
      bgm.pause()
      bgm.currentTime = 0
      bgmRef.current = null
    }
  }, [])

  useEffect(() => {
    const bgm = bgmRef.current
    if (!bgm) return

    if (page === "game") {
      bgm.pause()
      bgm.currentTime = 0
      return
    }

    void bgm.play().catch(() => {})
  }, [page])

  const currentMinions = minionsByPlayer[setupPlayer]

  const handleModeConfirm = async (
    mode: "DUEL" | "SOLITAIRE" | "AUTO"
  ) => {
    try {
      await setMode(mode)
      setSelectedMode(mode)
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
      const setupPayload = currentMinions.map(m => ({
        type: m.type,
        name: m.name,
        strategy: m.strategy,
        defenseFactor: m.defenseFactor,
      }))

      await setupFull(setupPlayer, setupPayload)

      if ((selectedMode === "SOLITAIRE" || selectedMode === "AUTO") && isPlayer1) {
        const mirroredPayload = (() => {
          const aiFaction: "HUMAN" | "DEMON" =
            currentFaction === "DEMON" ? "HUMAN" : "DEMON"
          const aiNameMap = aiFaction === "DEMON" ? demonNameByType : humanNameByType
          return setupPayload.map((minion) => ({
            ...minion,
            name: aiNameMap.get(minion.type as MinionType) ?? minion.name,
          }))
        })()

        await setupFull(2, mirroredPayload)
        setCurrentFaction(null)
        setSelectedMinion(null)
        setPage("preBattle")
        return
      }

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
      case "lobby":
        setPage("start")
        break
      case "minionType":
        setPage("mode")
        break
      case "selectUI":
        setPage("minionType")
        break
      case "minionSetupHuman":
        if (selectedMode === "SOLITAIRE" || selectedMode === "AUTO") {
          setPage("minionType")
        } else {
          setPage("selectUI")
        }
        break
      case "minionSetupDemon":
        if (selectedMode === "SOLITAIRE" || selectedMode === "AUTO") {
          setPage("minionType")
        } else {
          setPage("selectUI")
        }
        break
      case "strategy":
        if (currentFaction === "DEMON") {
          setPage("minionSetupDemon")
        } else {
          setPage("minionSetupHuman")
        }
        break
      case "preBattle":
        if (selectedMode === "SOLITAIRE" || selectedMode === "AUTO") {
          setPage(currentFaction === "DEMON" ? "minionSetupDemon" : "minionSetupHuman")
        } else {
          setPage("selectUI")
        }
        break
      case "game":
        setPage("preBattle")
        break
    }
  }

  const handlePlayAgain = () => {
    setSetupPlayer(1)
    setCurrentFaction(null)
    setSelectedMinion(null)
    setSelectedMode(null)
    setWsRoomId(null)
    setWsPlayerName(null)
    setWsPlayerId(null)
    setMinionTypeCount(0)
    setMinionsByPlayer({ 1: [], 2: [] })
    setPage("start")

    void resetGame().catch((error) => {
      console.error("Reset game failed:", error)
      alert("Failed to reset backend")
    })
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
          onLobby={() => setPage("lobby")}
        />
      )}

      {page === "lobby" && (
        <GameLobbyPage
          onBack={handleBack}
          onGameStarted={(roomId, playerName, playerId) => {
            setWsRoomId(roomId)
            setWsPlayerName(playerName)
            setWsPlayerId(playerId)
            setPage("game")
          }}
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
          onConfirm={async (count) => {
            setMinionTypeCount(count)
            setMinionsByPlayer({ 1: [], 2: [] })
            setSetupPlayer(1)
            setCurrentFaction(null)
            setSelectedMinion(null)

            if (selectedMode === "SOLITAIRE" || selectedMode === "AUTO") {
              setPage("selectUI")
              return
            }

            setPage("selectUI")
          }}
        />
      )}

      {page === "selectUI" && (
        <SelectCharacterPage
          setupPlayer={setupPlayer}
          onBack={handleBack}
          onConfirm={async (uiType) => {
            try {
              if ((selectedMode === "SOLITAIRE" || selectedMode === "AUTO") && setupPlayer === 1) {
                const aiType: "HUMAN" | "DEMON" = uiType === "HUMAN" ? "DEMON" : "HUMAN"
                await setCharacter(2, aiType)
              }
              setCurrentFaction(uiType)
              setPage(
                uiType === "DEMON"
                  ? "minionSetupDemon"
                  : "minionSetupHuman"
              )
            } catch (error) {
              console.error("Failed to set AI character:", error)
              alert("Failed to save AI character")
            }
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
            onConfirm={(name, code, defenseFactor) => {
              setMinionsByPlayer(prev => ({
                ...prev,
                [setupPlayer]: [
                  ...prev[setupPlayer].filter(m => m.type !== selectedMinion.type),
                  { ...selectedMinion, name, strategy: code, defenseFactor }
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
            onConfirm={(name, code, defenseFactor) => {
              setMinionsByPlayer(prev => ({
                ...prev,
                [setupPlayer]: [
                  ...prev[setupPlayer].filter(m => m.type !== selectedMinion.type),
                  { ...selectedMinion, name, strategy: code, defenseFactor }
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
        <GameplayPage
          onPlayAgain={handlePlayAgain}
          wsRoomId={wsRoomId}
          localPlayerName={wsPlayerName}
          localPlayerId={wsPlayerId}
        />
      )}
    </GameWrapper>
  )
}

export default App

