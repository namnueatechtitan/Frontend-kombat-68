import { useEffect, useRef, useState } from "react"

import GameWrapper from "./components/GameWrapper"
import ArrowButton from "./components/ArrowButton"

import StartPage from "./pages/StartPage"
import ConfigPage from "./pages/ConfigPage"
import ModePage from "./pages/ModePage"
import MinionTypePage from "./pages/MinionTypePage"
import SelectCharacterPage from "./pages/SelectCharacterPage"
import GameLobbyPage, { type RoomConfiguredMinion, type RoomState as LobbyRoomState } from "./pages/GameLobbyPage"

import StrategySetupHumanPage from "./pages/StrategySetupHumanPage"
import StrategySetupDemonPage from "./pages/StrategySetupDemonPage"
import GameplayPage from "./pages/GameplayPage"
import SelectMinionHumanPage from "./pages/SelectMinionHumanPage"
import SelectMinionDemonPage from "./pages/SelectMinionDemonPage"
import PreBattlePage from "./pages/PreBattleSummaryPage"
import { resetGame, setCharacter, setMode, setupFull } from "./api/gameApi"
import { stompWs } from "./ws/stompWs"
import gameStartBgm from "./Soubd_Audio/Game start.mp3"
import { demonMinions } from "./data/demonMinions"
import { humanMinions } from "./data/humanMinions"

import type { MinionData, MinionType } from "./types/MinionData"

type RoomSetupPhase = NonNullable<LobbyRoomState["setupPhase"]>

interface ConfiguredMinion extends MinionData {
  strategy: string
  defenseFactor: number
}

const waitingPhases: RoomSetupPhase[] = [
  "MINION_TYPE_COUNT",
  "CHARACTER_SELECT",
  "MINION_SETUP",
]

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
  const [minionTypeCount, setMinionTypeCount] = useState<number>(0)
  const [selectedMode, setSelectedMode] =
    useState<"DUEL" | "SOLITAIRE" | "AUTO" | null>(null)
  const [wsRoomId, setWsRoomId] = useState<string | null>(null)
  const [wsPlayerName, setWsPlayerName] = useState<string | null>(null)
  const [wsPlayerId, setWsPlayerId] = useState<number | null>(null)
  const [wsRoomState, setWsRoomState] = useState<LobbyRoomState | null>(null)
  const [roomStatusText, setRoomStatusText] = useState<string | null>(null)

  const [minionsByPlayer, setMinionsByPlayer] =
    useState<Record<1 | 2, ConfiguredMinion[]>>({
      1: [],
      2: []
    })
  const bgmRef = useRef<HTMLAudioElement | null>(null)

  const activeSetupPlayer = (wsRoomId && wsPlayerId ? wsPlayerId : setupPlayer) as 1 | 2
  const currentMinions = minionsByPlayer[activeSetupPlayer]
  const effectiveRoomMinionTypeCount = wsRoomState?.effectiveMinionTypeCount ?? minionTypeCount
  const roomPhase = wsRoomState?.setupPhase
  const isRoomMinionCountTurn = !!wsRoomId && roomPhase === "MINION_TYPE_COUNT"
  const isRoomCharacterTurn = !!wsRoomId && roomPhase === "CHARACTER_SELECT"
  const isRoomMinionSetupTurn = !!wsRoomId && roomPhase === "MINION_SETUP"

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

  useEffect(() => {
    if (!wsRoomId) {
      setWsRoomState(null)
      return
    }

    const destination = `/topic/room/${wsRoomId}`
    const handler = (payload: unknown) => {
      if (!payload) return
      setWsRoomState(payload as LobbyRoomState)
    }

    stompWs.connect(() => {
      stompWs.subscribe(destination, handler)
    })

    return () => {
      stompWs.unsubscribe(destination, handler)
    }
  }, [wsRoomId])

  useEffect(() => {
    if (!wsRoomState) {
      return
    }

    if (!selectedMode || selectedMode !== wsRoomState.mode) {
      setSelectedMode(wsRoomState.mode)
    }

    if (wsRoomState.error) {
      setRoomStatusText(wsRoomState.error)
    }

    if (wsRoomState.started || wsRoomState.setupPhase === "PLAYING") {
      setPage("game")
      setRoomStatusText(null)
      return
    }

    if (!wsRoomState.setupPhase) {
      return
    }

    switch (wsRoomState.setupPhase) {
      case "LOBBY":
        setPage("lobby")
        break
      case "MINION_TYPE_COUNT":
        setPage("minionType")
        setRoomStatusText("Both players can choose minion type count now")
        break
      case "CHARACTER_SELECT":
        setPage("selectUI")
        setRoomStatusText("Both players can choose character now")
        break
      case "MINION_SETUP": {
        const localCharacter = wsPlayerId === 1 ? wsRoomState.player1Character : wsRoomState.player2Character
        setCurrentFaction(localCharacter ?? null)
        if (page !== "strategy") {
          setPage(localCharacter === "DEMON" ? "minionSetupDemon" : "minionSetupHuman")
        }
        setRoomStatusText("Both players can configure minions and strategies now")
        break
      }
      case "PRE_BATTLE":
        setPage("preBattle")
        setRoomStatusText("Room setup complete. Start game from pre-battle.")
        break
      case "FINISHED":
        break
    }
  }, [page, selectedMode, wsPlayerId, wsRoomState])

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
      [activeSetupPlayer]: prev[activeSetupPlayer].filter(m => m.type !== type)
    }))
  }

  const handleFinalConfirm = async () => {
    const requiredCount = wsRoomId ? effectiveRoomMinionTypeCount : minionTypeCount
    if (currentMinions.length !== requiredCount) {
      alert("Please configure all minions first")
      return
    }

    try {
      const setupPayload = currentMinions.map<RoomConfiguredMinion>(m => ({
        type: m.type,
        name: m.name,
        strategy: m.strategy,
        defenseFactor: m.defenseFactor,
      }))

      if (wsRoomId) {
        if (!isRoomMinionSetupTurn) {
          alert("Not your setup turn yet")
          return
        }
        stompWs.send("/app/submit-room-minion-setup", {
          roomId: wsRoomId,
          minions: setupPayload,
        })
        return
      }

      const isPlayer1 = activeSetupPlayer === 1
      await setupFull(activeSetupPlayer, setupPayload)

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
        setPage(selectedMode && wsRoomId ? "lobby" : "mode")
        break
      case "selectUI":
        setPage("minionType")
        break
      case "minionSetupHuman":
      case "minionSetupDemon":
        if (selectedMode === "SOLITAIRE" || selectedMode === "AUTO" || wsRoomId) {
          setPage("selectUI")
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
        setPage("selectUI")
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
    setWsRoomState(null)
    setRoomStatusText(null)
    setMinionTypeCount(0)
    setMinionsByPlayer({ 1: [], 2: [] })
    setPage("start")

    void resetGame().catch((error) => {
      console.error("Reset game failed:", error)
      alert("Failed to reset backend")
    })
  }

  const renderRoomStatus = () => {
    if (!wsRoomId || !roomStatusText || !waitingPhases.includes(roomPhase as RoomSetupPhase)) {
      return null
    }

    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[160] px-4 py-2 rounded-full bg-black/80 text-white text-sm border border-amber-400/40">
        {roomStatusText}
      </div>
    )
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
      {renderRoomStatus()}

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
          onRoomConnected={(roomId, mode, playerName, playerId) => {
            setWsRoomId(roomId)
            setWsPlayerName(playerName)
            setWsPlayerId(playerId)
            setSelectedMode(mode)
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
            if (wsRoomId) {
              if (!isRoomMinionCountTurn) {
                alert("Not your turn to choose minion type count")
                return
              }
              setMinionTypeCount(count)
              stompWs.send("/app/submit-minion-type-count", {
                roomId: wsRoomId,
                count,
              })
              return
            }

            setMinionTypeCount(count)
            setMinionsByPlayer({ 1: [], 2: [] })
            setSetupPlayer(1)
            setCurrentFaction(null)
            setSelectedMinion(null)
            setPage("selectUI")
          }}
        />
      )}

      {page === "selectUI" && (
        <SelectCharacterPage
          setupPlayer={activeSetupPlayer}
          onBack={handleBack}
          onConfirm={async (uiType) => {
            try {
              if (wsRoomId) {
                if (!isRoomCharacterTurn) {
                  alert("Not your turn to choose character")
                  return
                }
                setCurrentFaction(uiType)
                stompWs.send("/app/select-room-character", {
                  roomId: wsRoomId,
                  character: uiType,
                })
                return
              }

              if ((selectedMode === "SOLITAIRE" || selectedMode === "AUTO") && activeSetupPlayer === 1) {
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
              alert("Failed to save character")
            }
          }}
        />
      )}

      {page === "minionSetupHuman" && (
        <SelectMinionHumanPage
          minionTypeCount={effectiveRoomMinionTypeCount}
          minions={currentMinions}
          onBack={handleBack}
          onSelect={(minion) => {
            if (wsRoomId && !isRoomMinionSetupTurn) {
              alert("Waiting for your minion setup turn")
              return
            }
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
          minionTypeCount={effectiveRoomMinionTypeCount}
          minions={currentMinions}
          onBack={handleBack}
          onSelect={(minion) => {
            if (wsRoomId && !isRoomMinionSetupTurn) {
              alert("Waiting for your minion setup turn")
              return
            }
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
                [activeSetupPlayer]: [
                  ...prev[activeSetupPlayer].filter(m => m.type !== selectedMinion.type),
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
                [activeSetupPlayer]: [
                  ...prev[activeSetupPlayer].filter(m => m.type !== selectedMinion.type),
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
          wsRoomState={wsRoomState}
          isRoomMode={!!wsRoomId}
          onConfirm={() => {
            if (wsRoomId) {
              stompWs.connect(() => {
                stompWs.send("/app/start-game", { roomId: wsRoomId })
              })
              return
            }
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
