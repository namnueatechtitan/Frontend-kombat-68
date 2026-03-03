import { useEffect, useRef, useState } from "react"
import GameBoard from "../components/GameBoard"
import PlayerPanel from "../components/PlayerPanel"
import ActionLog from "../components/ActionLog"
import demonSetupBg from "../assets/images/demonsetup.png"
import logoImage from "../assets/images/logo.png"
import {
  buyHex,
  endTurn,
  getGameStatus,
  spawnMinion,
  type GameStatus,
} from "../api/gameApi"

interface ToastState {
  type: "error" | "success"
  message: string
}

export default function GameplayPage() {
  const [game, setGame] = useState<GameStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [timelineLogs, setTimelineLogs] = useState<string[]>([])
  const [toast, setToast] = useState<ToastState | null>(null)
  const lastBackendLogSignatureRef = useRef("")
  const [popup, setPopup] = useState<{
    row: number
    col: number
    x: number
    y: number
  } | null>(null)

  const [selectingType, setSelectingType] = useState(false)
  const [isGameFinished, setIsGameFinished] = useState(false)

  const showToast = (message: string) => {
    setToast({ type: "error", message })
  }

  const syncGameFinishedState = ({
    gameOver,
    phase,
  }: {
    gameOver: boolean
    phase?: string
  }) => {
    const finished = Boolean(gameOver || phase === "FINISHED")

    setIsGameFinished(finished)

    if (finished) {
      setPopup(null)
      setSelectingType(false)
    }
  }

  const loadGame = async () => {
    try {
      const data = await getGameStatus()

      const backendLogs = data.actionLogs ?? []
      const backendLogSignature = JSON.stringify(backendLogs)

      if (
        backendLogs.length > 0 &&
        backendLogSignature !== lastBackendLogSignatureRef.current
      ) {
        setTimelineLogs((prev) => [...prev, ...backendLogs])
      }

      lastBackendLogSignatureRef.current = backendLogSignature
      setGame(data)
      syncGameFinishedState({
        gameOver: data.gameOver,
        phase: data.phase,
      })
    } catch (err) {
      console.error(err)
      showToast("ไม่สามารถโหลดสถานะเกมได้ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGame()
  }, [])

  useEffect(() => {
    if (!toast) return

    const timer = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const appendTimelineLog = (text: string) => {
    setTimelineLogs((prev) => [...prev, text])
  }

  const isGameplayDisabled = isGameFinished || game?.gameOver || game?.phase === "FINISHED"

  const handleSpawn = async (type: string) => {
    if (!popup || !game || isGameplayDisabled) return

    try {
      await spawnMinion(type, popup.row, popup.col)

      appendTimelineLog(
        game.gameState.phase === "FREE_SPAWN"
          ? `Player ${game.currentPlayer} spawned ${type} free at (${popup.row}, ${popup.col})`
          : `Player ${game.currentPlayer} bought ${type} at (${popup.row}, ${popup.col})`
      )

      setSelectingType(false)
      setPopup(null)

      await loadGame()
    } catch {
      showToast("สั่ง Spawn ไม่สำเร็จ กรุณาลองใหม่")
    }
  }

  const handleBuyHex = async () => {
    if (!popup || !game || isGameplayDisabled) return

    try {
      await buyHex(popup.row, popup.col)

      appendTimelineLog(
        `Player ${game.currentPlayer} bought hex (${popup.row}, ${popup.col})`
      )

      setPopup(null)
      await loadGame()
    } catch {
      showToast("ซื้อ Hex ไม่สำเร็จ กรุณาลองใหม่")
    }
  }

  const handleEndTurn = async () => {
    if (!game || isGameplayDisabled) return

    try {
      const response = await endTurn()

      if (response.actionLogs?.length) {
        setTimelineLogs((prev) => [...prev, ...response.actionLogs])
      }

      syncGameFinishedState({ gameOver: response.gameOver, phase: response.phase })
      await loadGame()
    } catch {
      showToast("จบเทิร์นไม่สำเร็จ กรุณาตรวจสอบเครือข่ายแล้วลองอีกครั้ง")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#111] text-white">
        Loading...
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#111] text-red-500">
        Failed to load game
      </div>
    )
  }

  const { phase, turnNumber, budget, spawnsLeft } = game.gameState
  const p1Economy = game.playerEconomy?.["1"]
  const p2Economy = game.playerEconomy?.["2"]

  return (
    <div
      className="min-h-screen w-full text-white bg-[#111] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${demonSetupBg})` }}
    >
      <div className="min-h-screen bg-black/45">
        <div className="min-h-screen max-w-[1400px] mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 flex flex-col justify-center gap-4 lg:gap-6">
          <div className="w-full rounded-xl border border-orange-400/40 bg-black/55 backdrop-blur-sm px-4 lg:px-6 py-3 lg:py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4 min-w-0">
                <img src={logoImage} alt="Game logo" className="w-12 h-12 lg:w-14 lg:h-14 object-contain" />
                <div className="text-sm sm:text-base lg:text-lg font-bold tracking-wide text-yellow-300">
                  TURN {turnNumber} · PLAYER {game.currentPlayer}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm lg:text-base text-white/90">
                <div>Phase: {phase}</div>
                <div>Spawns Left: {spawnsLeft}</div>
                <div>
                  Last Interest: {game.playerEconomy?.[String(game.currentPlayer)]?.lastInterest ?? 0}
                </div>
              </div>

              <button
                onClick={handleEndTurn}
                disabled={isGameplayDisabled}
                className="px-5 sm:px-7 py-2 rounded-full font-bold tracking-[0.2em] text-sm bg-gradient-to-r from-orange-400 to-yellow-300 text-black hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ENDTURN
              </button>
            </div>
          </div>

          <div className="w-full flex items-center justify-center">
            <div className="w-full grid grid-cols-1 lg:grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 lg:gap-6">
              <div className="order-2 lg:order-1 flex justify-center lg:justify-end">
                <PlayerPanel
                  playerId={1}
                  currentPlayer={game.currentPlayer}
                  budget={p1Economy?.budget ?? budget}
                  spawnsLeft={p1Economy?.spawnsLeft ?? spawnsLeft}
                  lastInterest={p1Economy?.lastInterest}
                  phase={phase}
                />
              </div>

              <div className="order-1 lg:order-2 flex items-center justify-center min-w-0">
                <GameBoard
                  spawnableHexes={isGameplayDisabled ? [] : game.spawnableHexes}
                  buyableHexes={isGameplayDisabled ? [] : game.buyableHexes ?? []}
                  minions={game.gameState.minions ?? []}
                  phase={phase}
                  currentPlayer={game.currentPlayer}
                  onHexClick={(row, col, x, y) => {
                    if (isGameplayDisabled) return
                    setSelectingType(false)
                    setPopup({ row, col, x, y })
                  }}
                />
              </div>

              <div className="order-3 flex justify-center lg:justify-start">
                <PlayerPanel
                  playerId={2}
                  currentPlayer={game.currentPlayer}
                  budget={p2Economy?.budget}
                  spawnsLeft={p2Economy?.spawnsLeft}
                  lastInterest={p2Economy?.lastInterest}
                  phase={phase}
                />
              </div>
            </div>
          </div>

          <div className="w-full rounded-xl border border-yellow-500/30 bg-black/55 backdrop-blur-sm shadow-xl p-3 sm:p-4 min-h-[180px]">
            <ActionLog logs={timelineLogs} />
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[70] rounded-lg border border-red-300/30 bg-red-950/90 px-4 py-2 text-sm text-red-100 shadow-lg">
          {toast.message}
        </div>
      )}

      {popup && !isGameplayDisabled && (
        <div
          className="fixed bg-gray-900 border border-gray-600 p-4 rounded shadow-xl z-50"
          style={{ left: popup.x, top: popup.y }}
        >
          <div className="mb-2 font-bold">
            Selected {popup.row} {popup.col}
          </div>

          {phase === "FREE_SPAWN" &&
            (game.availableTypes ?? []).map((type) => (
              <button
                key={type}
                onClick={() => handleSpawn(type)}
                className="block w-full mb-2 px-3 py-1 bg-green-600 rounded hover:bg-green-700"
              >
                Spawn {type}
              </button>
            ))}

          {phase === "PLAYER_ACTION" && !selectingType && (
            <>
              <button
                onClick={handleBuyHex}
                className="block w-full mb-2 px-3 py-1 bg-yellow-500 rounded hover:bg-yellow-600"
              >
                Buy Hex
              </button>

              <button
                onClick={() => setSelectingType(true)}
                className="block w-full mb-2 px-3 py-1 bg-purple-600 rounded hover:bg-purple-700"
              >
                Buy Minion
              </button>
            </>
          )}

          {phase === "PLAYER_ACTION" && selectingType &&
            (game.availableTypes ?? []).map((type) => (
              <button
                key={type}
                onClick={() => handleSpawn(type)}
                className="block w-full mb-2 px-3 py-1 bg-green-600 rounded hover:bg-green-700"
              >
                {type}
              </button>
            ))}

          <button
            onClick={() => {
              setSelectingType(false)
              setPopup(null)
            }}
            className="block w-full px-3 py-1 bg-red-600 rounded hover:bg-red-700"
          >
            Cancel
          </button>
        </div>
      )}

    </div>
  )
}
