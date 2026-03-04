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

interface Props {
  onPlayAgain: () => void
}

interface SetupSummaryData {
  config?: {
    hexPurchaseCost?: number
  }
  players?: {
    player1?: { character?: Character }
    player2?: { character?: Character }
  }
}

interface RuntimeMinion {
  ownerId: number
  type: string
  hp?: number
  hpPercent?: number
  x: number
  y: number
  runtimeId: string
}

const toRuntimeMinions = (
  minions: Array<{ ownerId: number; type: string; hp?: number; x: number; y: number }>,
): RuntimeMinion[] => {
  const seen = new Map<string, number>()

  return minions.map((minion) => {
    const baseKey = `${minion.ownerId}|${minion.type.toUpperCase()}|${minion.x}|${minion.y}`
    const index = seen.get(baseKey) ?? 0
    seen.set(baseKey, index + 1)

    return {
      ...minion,
      runtimeId: `${baseKey}|${index}`,
    }
  })
}

export default function GameplayPage({ onPlayAgain }: Props) {
  const [game, setGame] = useState<GameStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [timelineLogs, setTimelineLogs] = useState<string[]>([])
  const [lastBoughtHexTurnKey, setLastBoughtHexTurnKey] = useState<string | null>(null)
  const [shakingMinionIds, setShakingMinionIds] = useState<string[]>([])
  const [isScreenShaking, setIsScreenShaking] = useState(false)
  const lastBackendLogSignatureRef = useRef("")
  const hpByRuntimeIdRef = useRef<Record<string, number>>({})
  const maxHpByOwnerTypeRef = useRef<Record<string, number>>({})
  const shakeClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const screenShakeClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [popup, setPopup] = useState<{
    row: number
    col: number
    x: number
    y: number
  } | null>(null)
  const [bgOffset, setBgOffset] = useState({ x: 0, y: 0 })

  const [selectingType, setSelectingType] = useState(false)
  const [setupSummary, setSetupSummary] = useState<SetupSummaryData | null>(null)
  const pollIntervalMs = game?.gameState.phase === "EXECUTION" ? 250 : 1000

  const ownerTypeKey = (ownerId: number, type: string) =>
    `${ownerId}|${type.toUpperCase()}`

  const resolveHpPercent = (minion: RuntimeMinion) => {
    if (typeof minion.hp !== "number") return 100
    const key = ownerTypeKey(minion.ownerId, minion.type)
    const knownMax = maxHpByOwnerTypeRef.current[key]

    if (typeof knownMax === "number" && knownMax > 0) {
      return (minion.hp / knownMax) * 100
    }

    return minion.hp <= 100 ? minion.hp : 100
  }

  const loadGame = async () => {
    try {
      const data = await getGameStatus()
      const runtimeMinions = toRuntimeMinions(data.gameState.minions ?? [])

      const backendLogs = data.actionLogs ?? []
      const backendLogSignature = JSON.stringify(backendLogs)

      if (
        backendLogs.length > 0 &&
        backendLogSignature !== lastBackendLogSignatureRef.current
      ) {
        setTimelineLogs((prev) => [...prev, ...backendLogs])
      }

      lastBackendLogSignatureRef.current = backendLogSignature

      const currentHpByRuntimeId: Record<string, number> = {}
      const damagedMinionIds: string[] = []

      runtimeMinions.forEach((minion) => {
        if (typeof minion.hp !== "number") return

        const key = ownerTypeKey(minion.ownerId, minion.type)
        const prevMax = maxHpByOwnerTypeRef.current[key] ?? 0
        if (minion.hp > prevMax) {
          maxHpByOwnerTypeRef.current[key] = minion.hp
        }

        currentHpByRuntimeId[minion.runtimeId] = minion.hp

        const prevHp = hpByRuntimeIdRef.current[minion.runtimeId]
        if (typeof prevHp === "number" && minion.hp < prevHp) {
          damagedMinionIds.push(minion.runtimeId)
        }
      })

      hpByRuntimeIdRef.current = currentHpByRuntimeId

      if (damagedMinionIds.length > 0) {
        setShakingMinionIds(Array.from(new Set(damagedMinionIds)))
        setIsScreenShaking(true)

        if (shakeClearTimerRef.current) {
          clearTimeout(shakeClearTimerRef.current)
        }
        if (screenShakeClearTimerRef.current) {
          clearTimeout(screenShakeClearTimerRef.current)
        }

        shakeClearTimerRef.current = setTimeout(() => {
          setShakingMinionIds([])
        }, 500)

        screenShakeClearTimerRef.current = setTimeout(() => {
          setIsScreenShaking(false)
        }, 280)
      }

      setGame(data)
      if (data.gameOver) {
        setPopup(null)
        setSelectingType(false)
      }
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

  useEffect(() => {
    const timer = setInterval(() => {
      void loadGame()
    }, pollIntervalMs)

    return () => {
      clearInterval(timer)
      if (shakeClearTimerRef.current) {
        clearTimeout(shakeClearTimerRef.current)
      }
      if (screenShakeClearTimerRef.current) {
        clearTimeout(screenShakeClearTimerRef.current)
      }
    }
  }, [pollIntervalMs])

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 16
      const y = (e.clientY / window.innerHeight - 0.5) * 16
      setBgOffset({ x, y })
    }

    window.addEventListener("mousemove", handleMove)
    return () => window.removeEventListener("mousemove", handleMove)
  }, [])

  const appendTimelineLog = (text: string) => {
    setTimelineLogs((prev) => [...prev, text])
  }

  const handleSpawn = async (type: string) => {
    if (!popup || !game || game.gameOver) return

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
    if (!popup || !game || game.gameOver) return

    try {
      await buyHex(popup.row, popup.col)
      setLastBoughtHexTurnKey(`${game.gameState.turnNumber}-${game.currentPlayer}`)

      appendTimelineLog(
        `Player ${game.currentPlayer} bought hex (${popup.row}, ${popup.col})`
      )

      await loadGame()
    } catch {
      alert("Buy hex failed")
    }
  }

  const handleEndTurn = async () => {
    if (!game || game.gameOver) return
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
  const currentTurnKey = `${turnNumber}-${game.currentPlayer}`
  const hasBoughtHexThisTurn = lastBoughtHexTurnKey === currentTurnKey
  const currentPlayerBudget =
    game.playerEconomy?.[String(game.currentPlayer)]?.budget ?? budget
  const isGameOver = game.gameOver
  const boardMinions = toRuntimeMinions(game.gameState.minions ?? []).map((minion) => ({
    ...minion,
    hpPercent: resolveHpPercent(minion),
  }))
  const visibleBuyableHexes = hasBoughtHexThisTurn
    ? []
    : (game.buyableHexes ?? [])

  const selectedHexOwnedByCurrentPlayer = popup
    ? game.spawnableHexes.some(
        (hex) =>
          hex.ownerId === game.currentPlayer &&
          hex.row === popup.row &&
          hex.col === popup.col
      )
    : false

  const selectedHexBuyableByCurrentPlayer = popup
    ? visibleBuyableHexes.some(
        (hex) =>
          hex.ownerId === game.currentPlayer &&
          hex.row === popup.row &&
          hex.col === popup.col
      )
    : false

  const selectedHexOccupied = popup
    ? boardMinions.some(
        (minion) => minion.x === popup.row && minion.y === popup.col
      )
    : false

  const hexPurchaseCost = setupSummary?.config?.hexPurchaseCost ?? 0
  const canAffordHex = currentPlayerBudget >= hexPurchaseCost
  const canShowBuyHexButton =
    !isGameOver &&
    phase === "PLAYER_ACTION" &&
    !hasBoughtHexThisTurn &&
    !selectedHexOwnedByCurrentPlayer &&
    selectedHexBuyableByCurrentPlayer

  const canShowSpawnMinionButton =
    !isGameOver &&
    !selectedHexOccupied &&
    ((phase === "PLAYER_ACTION" && selectedHexOwnedByCurrentPlayer) ||
      phase === "FREE_SPAWN")

  const p1Character: Character = setupSummary?.players?.player1?.character ?? "HUMAN"
  const p2Character: Character = setupSummary?.players?.player2?.character ?? "DEMON"

  const p1Minions = boardMinions.filter((minion) => minion.ownerId === 1)
  const p2Minions = boardMinions.filter((minion) => minion.ownerId === 2)

  const currentPlayerCharacter: Character =
    game.currentPlayer === 1 ? p1Character : p2Character

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
  const winnerLabel =
    game.winner === "P1"
      ? "Player 1"
      : game.winner === "P2"
        ? "Player 2"
        : game.winner === "TIE"
          ? "Tie"
          : game.winner
  const winnerTheme =
    game.winner === "P1"
      ? {
          glow: "rgba(239,68,68,0.6)",
          accent: "from-red-500 via-orange-400 to-amber-300",
          ring: "border-red-300/60",
          chip: "bg-red-500/20 text-red-200 border-red-300/45",
        }
      : game.winner === "P2"
        ? {
            glow: "rgba(168,85,247,0.6)",
            accent: "from-fuchsia-500 via-purple-400 to-violet-300",
            ring: "border-violet-300/60",
            chip: "bg-violet-500/20 text-violet-200 border-violet-300/45",
          }
        : {
            glow: "rgba(250,204,21,0.6)",
            accent: "from-yellow-400 via-amber-300 to-orange-300",
            ring: "border-amber-300/60",
            chip: "bg-amber-500/20 text-amber-100 border-amber-300/45",
          }

  const handleExit = () => {
    window.open("", "_self")
    window.close()
  }

  return (
    <div
      className={`relative min-h-screen w-full text-white bg-[#111] overflow-hidden ${
        isScreenShaking ? "animate-shake" : ""
      }`}
    >
      <div
        className="absolute inset-0 animate-drift will-change-transform"
        style={{ transform: `translate(${bgOffset.x}px, ${bgOffset.y}px)` }}
      >
        <img
          src={demonSetupBg}
          alt="Gameplay background"
          className="w-full h-full object-cover animate-cinematic"
          draggable={false}
        />
      </div>

      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 min-h-screen">
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
                disabled={isGameOver}
                className="px-5 sm:px-7 py-2 rounded-full text-white font-semibold text-sm tracking-[0.2em] transition-all duration-300 transform bg-gradient-to-r from-[#FF3D00] to-[#ECDB46] hover:scale-105 hover:shadow-xl shadow-md hover:shadow-[0_0_25px_rgba(255,120,0,0.7)]"
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
                  character={p1Character}
                  minions={p1Minions}
                />
              </div>

              <div className="order-1 lg:order-2 flex items-center justify-center min-w-0">
                <GameBoard
                  spawnableHexes={game.spawnableHexes}
                  buyableHexes={visibleBuyableHexes}
                  minions={boardMinions}
                  shakingMinionIds={shakingMinionIds}
                  phase={phase}
                  currentPlayer={game.currentPlayer}
                  onHexClick={(row, col, x, y) => {
                    if (isGameOver) return
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
                  character={p2Character}
                  minions={p2Minions}
                />
              </div>
            </div>
          </div>

          <div className="w-full rounded-xl border border-yellow-500/30 bg-black/55 backdrop-blur-sm shadow-xl p-3 sm:p-4 min-h-[180px]">
            <ActionLog logs={timelineLogs} />
          </div>
        </div>
      </div>

      {popup && !isGameOver && (
        <>
          <div
            className={`fixed z-[60] w-[250px] rounded-2xl border ${playerTheme.border} ${playerTheme.glow} overflow-hidden`}
            style={{
              left: `min(calc(100vw - 270px), ${popup.x + 16}px)`,
              top: `min(calc(100vh - 230px), ${popup.y - 8}px)`,
              backgroundImage:
                "linear-gradient(145deg, rgba(10,20,35,0.95), rgba(7,10,20,0.95))",
            }}
          >
            <div className="p-3 space-y-2">
              <div className={`text-sm font-extrabold tracking-wide ${playerTheme.heading}`}>
                Hex ({popup.row}, {popup.col})
              </div>

              {canShowBuyHexButton && (
                <button
                  onClick={handleBuyHex}
                  disabled={!canAffordHex}
                  className="w-full py-2 rounded-lg text-sm font-bold tracking-wide text-white bg-gradient-to-r from-amber-500 to-yellow-400 enabled:hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed transition"
                >
                  Buy Hex {hexPurchaseCost > 0 ? `(${hexPurchaseCost})` : ""}
                </button>
              )}

              {canShowSpawnMinionButton && !selectingType && (
                <button
                  onClick={() => setSelectingType(true)}
                  className={`w-full py-2 rounded-lg text-sm font-bold tracking-wide text-white bg-gradient-to-r ${playerTheme.action} hover:brightness-110 transition`}
                >
                  Spawn Minion
                </button>
              )}

              <button
                onClick={() => {
                  setSelectingType(false)
                  setPopup(null)
                }}
                className="w-full py-2 rounded-lg text-sm font-bold tracking-wide text-white bg-gradient-to-r from-red-600 to-rose-700 hover:brightness-110 transition"
              >
                Cancel
              </button>
            </div>
          </div>

          <SpawnMinionSelectionModal
            open={selectingType}
            anchorX={popup.x}
            anchorY={popup.y}
            playerTheme={playerTheme}
            currentPlayerCharacter={currentPlayerCharacter}
            selectableMinions={selectableMinions}
            onClose={() => setSelectingType(false)}
            onSelectMinion={handleSpawn}
          />
        </>
      )}

      {isGameOver && (
        <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-[620px]">
            <div
              className="pointer-events-none absolute -inset-8 rounded-[40px] blur-3xl opacity-90 animate-game-end-pulse"
              style={{
                background: `radial-gradient(circle at center, ${winnerTheme.glow}, rgba(0,0,0,0))`,
              }}
            />
            <div className={`relative rounded-3xl border ${winnerTheme.ring} bg-[linear-gradient(180deg,rgba(35,8,4,0.96),rgba(20,4,3,0.98))] shadow-[0_0_65px_rgba(255,120,0,0.35)] overflow-hidden`}>
              <div className="pointer-events-none absolute inset-0 opacity-30 animate-game-end-sheen bg-[radial-gradient(circle_at_15%_20%,rgba(255,220,160,0.3),transparent_38%),radial-gradient(circle_at_80%_75%,rgba(255,180,90,0.22),transparent_40%)]" />

              <div className="relative px-6 py-5 border-b border-yellow-400/25 bg-black/25">
                <div className="absolute top-2 left-4 text-yellow-200/65 text-xs tracking-[0.22em]">
                  FINAL RESULT
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-[0.2em] text-center text-[#FFE9B5] drop-shadow-[0_0_16px_rgba(255,210,120,0.5)]">
                  GAME END
                </h2>
                <div className={`mx-auto mt-3 h-[3px] w-48 rounded-full bg-gradient-to-r ${winnerTheme.accent} shadow-[0_0_18px_rgba(255,190,100,0.55)]`} />
              </div>

              <div className="relative px-6 py-8 text-center">
                <p className="text-sm tracking-[0.22em] text-yellow-200/75">WINNER</p>
                <p className="mt-2 text-4xl sm:text-6xl font-black tracking-[0.08em] text-white drop-shadow-[0_0_24px_rgba(255,180,80,0.5)]">
                  {winnerLabel}
                </p>
                <div className={`mx-auto mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs tracking-[0.16em] ${winnerTheme.chip}`}>
                  <span className="inline-block h-2 w-2 rounded-full bg-current animate-pulse" />
                  BATTLE CONCLUDED
                </div>
              </div>

              <div className="relative px-6 pb-7 pt-1 flex flex-col sm:flex-row gap-3 sm:justify-center">
                <button
                  type="button"
                  onClick={onPlayAgain}
                  className="w-full sm:w-[220px] h-[55px] rounded-full text-white font-semibold text-lg transition-all duration-300 transform bg-gradient-to-r from-[#FF3D00] to-[#ECDB46] hover:scale-105 hover:shadow-xl shadow-md hover:shadow-[0_0_25px_rgba(255,120,0,0.7)]"
                >
                  Play Again
                </button>

                <button
                  type="button"
                  onClick={handleExit}
                  className="w-full sm:w-[220px] h-[55px] rounded-full text-white font-semibold text-lg transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 hover:scale-105 shadow-md hover:shadow-xl"
                >
                  Exit
                </button>
              </div>

              <div className="pointer-events-none absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 border-yellow-200/45 rounded-tl-md" />
              <div className="pointer-events-none absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 border-yellow-200/45 rounded-tr-md" />
              <div className="pointer-events-none absolute left-4 bottom-4 h-6 w-6 border-l-2 border-b-2 border-yellow-200/45 rounded-bl-md" />
              <div className="pointer-events-none absolute right-4 bottom-4 h-6 w-6 border-r-2 border-b-2 border-yellow-200/45 rounded-br-md" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
