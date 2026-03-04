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
  getSetupSummary,
  spawnMinion,
  type GameStatus,
} from "../api/gameApi"
import { humanMinions } from "../data/humanMinions"
import { demonMinions } from "../data/demonMinions"
import SpawnMinionSelectionModal from "../components/SpawnMinionSelectionModal"

type Character = "HUMAN" | "DEMON"

interface SetupSummaryData {
  config?: {
    hexPurchaseCost?: number
  }
  players?: {
    player1?: { character?: Character }
    player2?: { character?: Character }
  }
}

export default function GameplayPage() {
  const [game, setGame] = useState<GameStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [timelineLogs, setTimelineLogs] = useState<string[]>([])
  const lastBackendLogSignatureRef = useRef("")
  const [popup, setPopup] = useState<{
    row: number
    col: number
    x: number
    y: number
  } | null>(null)

  const [selectingType, setSelectingType] = useState(false)
  const [setupSummary, setSetupSummary] = useState<SetupSummaryData | null>(null)

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
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGame()
    getSetupSummary()
      .then(setSetupSummary)
      .catch((err) => console.error("Failed to load setup summary", err))
  }, [])

  const appendTimelineLog = (text: string) => {
    setTimelineLogs((prev) => [...prev, text])
  }

  const handleSpawn = async (type: string) => {
    if (!popup || !game) return

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
      alert("Spawn failed")
    }
  }

  const handleBuyHex = async () => {
    if (!popup || !game) return

    try {
      await buyHex(popup.row, popup.col)

      appendTimelineLog(
        `Player ${game.currentPlayer} bought hex (${popup.row}, ${popup.col})`
      )

      await loadGame()
    } catch {
      alert("Buy hex failed")
    }
  }

  const handleEndTurn = async () => {
    if (!game) return
    try {
      await endTurn()
      await loadGame()
    } catch {
      alert("End turn failed")
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
  const currentPlayerBudget =
    game.playerEconomy?.[String(game.currentPlayer)]?.budget ?? budget

  const selectedHexOwnedByCurrentPlayer = popup
    ? game.spawnableHexes.some(
        (hex) =>
          hex.ownerId === game.currentPlayer &&
          hex.row === popup.row &&
          hex.col === popup.col
      )
    : false

  const selectedHexBuyableByCurrentPlayer = popup
    ? game.buyableHexes.some(
        (hex) =>
          hex.ownerId === game.currentPlayer &&
          hex.row === popup.row &&
          hex.col === popup.col
      )
    : false

  const selectedHexOccupied = popup
    ? game.gameState.minions.some(
        (minion) => minion.x === popup.row && minion.y === popup.col
      )
    : false

  const hexPurchaseCost = setupSummary?.config?.hexPurchaseCost ?? 0
  const canAffordHex = currentPlayerBudget >= hexPurchaseCost
  const canShowBuyHexButton =
    phase === "PLAYER_ACTION" &&
    !selectedHexOwnedByCurrentPlayer &&
    selectedHexBuyableByCurrentPlayer

  const canShowSpawnMinionButton =
    !selectedHexOccupied &&
    ((phase === "PLAYER_ACTION" && selectedHexOwnedByCurrentPlayer) ||
      phase === "FREE_SPAWN")

  const currentPlayerCharacter: Character =
    game.currentPlayer === 1
      ? setupSummary?.players?.player1?.character ?? "HUMAN"
      : setupSummary?.players?.player2?.character ?? "DEMON"

  const playerTheme =
    game.currentPlayer === 1
      ? {
          border: "border-red-400/75",
          glow: "shadow-[0_0_40px_rgba(248,113,113,0.45)]",
          action: "from-red-600 to-rose-700",
          heading: "text-red-200",
        }
      : {
          border: "border-purple-400/75",
          glow: "shadow-[0_0_40px_rgba(192,132,252,0.45)]",
          action: "from-purple-600 to-fuchsia-700",
          heading: "text-purple-200",
        }

  const factionPool = currentPlayerCharacter === "HUMAN" ? humanMinions : demonMinions
  const availableTypeSet = new Set((game.availableTypes ?? []).map((type) => type.toUpperCase()))
  const selectableMinions = factionPool.filter((minion) =>
    availableTypeSet.has(minion.type.toUpperCase())
  )

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
                className="px-5 sm:px-7 py-2 rounded-full font-bold tracking-[0.2em] text-sm bg-gradient-to-r from-orange-400 to-yellow-300 text-black hover:brightness-110 transition"
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
                  spawnableHexes={game.spawnableHexes}
                  buyableHexes={game.buyableHexes ?? []}
                  minions={game.gameState.minions ?? []}
                  phase={phase}
                  currentPlayer={game.currentPlayer}
                  onHexClick={(row, col, x, y) => {
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

      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <div
            className={`relative w-full max-w-[420px] rounded-2xl border ${playerTheme.border} ${playerTheme.glow} overflow-hidden`}
            style={{
              backgroundImage:
                "radial-gradient(circle at top right, rgba(255,255,255,0.12), transparent 55%), linear-gradient(145deg, rgba(10,20,35,0.96), rgba(7,10,20,0.96)), repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)",
            }}
          >
            <div className="p-5 space-y-3">
              <div className={`text-lg font-extrabold tracking-wide ${playerTheme.heading}`}>
                Hex ({popup.row}, {popup.col})
              </div>

              {canShowBuyHexButton && (
                <button
                  onClick={handleBuyHex}
                  disabled={!canAffordHex}
                  className="w-full py-3 rounded-xl font-bold tracking-wide text-white bg-gradient-to-r from-amber-500 to-yellow-400 enabled:hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed transition"
                >
                  Buy Hex {hexPurchaseCost > 0 ? `(${hexPurchaseCost})` : ""}
                </button>
              )}

              {canShowSpawnMinionButton && !selectingType && (
                <button
                  onClick={() => setSelectingType(true)}
                  className={`w-full py-3 rounded-xl font-bold tracking-wide text-white bg-gradient-to-r ${playerTheme.action} hover:brightness-110 transition`}
                >
                  Spawn Minion
                </button>
              )}

              <button
                onClick={() => {
                  setSelectingType(false)
                  setPopup(null)
                }}
                className="w-full py-3 rounded-xl font-bold tracking-wide text-white bg-gradient-to-r from-red-600 to-rose-700 hover:brightness-110 transition"
              >
                Cancel
              </button>
            </div>
          </div>

          <SpawnMinionSelectionModal
            open={selectingType}
            playerTheme={playerTheme}
            currentPlayerCharacter={currentPlayerCharacter}
            selectableMinions={selectableMinions}
            onClose={() => setSelectingType(false)}
            onSelectMinion={handleSpawn}
          />
        </div>
      )}
    </div>
  )
}
