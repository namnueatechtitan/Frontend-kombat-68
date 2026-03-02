import { useEffect, useState } from "react"
import GameBoard from "../components/GameBoard"
import PlayerPanel from "../components/PlayerPanel"
import ActionLog from "../components/ActionLog"
import {
  buyHex,
  endTurn,
  getGameStatus,
  spawnMinion,
  type GameStatus,
} from "../api/gameApi"

export default function GameplayPage() {

  const [game, setGame] = useState<GameStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [clientLogs, setClientLogs] = useState<string[]>([])
  const [popup, setPopup] = useState<{
    row: number
    col: number
    x: number
    y: number
  } | null>(null)

  // ==========================
  // LOAD GAME
  // ==========================

  const loadGame = async () => {
    try {
      const data = await getGameStatus()
      setGame(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGame()
  }, [])

  const addClientLog = (text: string) => {
    setClientLogs((prev) => [...prev, text])
  }

  // ==========================
  // SPAWN
  // ==========================
const handleSpawn = async () => {
  if (!popup || !game) return

  try {
    await spawnMinion("FIGHTER", popup.row, popup.col)

    addClientLog(
      game.gameState.phase === "FREE_SPAWN"
        ? `Player ${game.currentPlayer} spawned free at (${popup.row}, ${popup.col})`
        : `Player ${game.currentPlayer} bought minion at (${popup.row}, ${popup.col})`
    )

    setPopup(null)
    await loadGame()
  } catch {
    alert("Spawn failed")
  }
}
 
  // ==========================
  // BUY HEX (เรียก backend จริง)
  // ==========================

  const handleBuyHex = async () => {
    if (!popup || !game) return

    try {
      await buyHex(popup.row, popup.col)

      addClientLog(`Player ${game.currentPlayer} bought hex (${popup.row}, ${popup.col})`)

      setPopup(null)
      await loadGame()   // reload state จาก backend
    } catch {
      alert("Buy hex failed")
    }
  }

  const handleEndTurn = async () => {
    if (!game) return

    try {
      await endTurn()

      addClientLog(`Player ${game.currentPlayer} ended turn`)

      await loadGame()
    } catch {
      alert("End turn failed")
    }
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        Loading...
      </div>
    )
  }

  if (!game) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500">
        Failed to load game
      </div>
    )
  }

  const { phase, turnNumber, budget, spawnsLeft } = game.gameState

  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-br from-black to-gray-900 text-white">

      {/* TOP BAR */}
      <div className="flex justify-between items-center mt-4 mb-10 px-8 py-5 border-b border-gray-900">
        <div className="flex gap-8">
          <div>Turn: {turnNumber}</div>
          <div>Current Player: {game.currentPlayer}</div>
          <div>Phase: {phase}</div>
          <div>Spawns Left: {spawnsLeft}</div>
        </div>

        <button
          onClick={handleEndTurn}
          className="px-6 py-2 bg-orange-500 rounded hover:bg-orange-600 transition"
        >
          ENDTURN
        </button>
      </div>

      {/* MAIN */}
      <div className="relative flex-1 px-8 py-6">

        {/* BOARD */}
        <div className="absolute inset-0 flex items-center justify-center">
          <GameBoard
            spawnableHexes={game.spawnableHexes}
            buyableHexes={game.buyableHexes ?? []}
            phase={phase}
            currentPlayer={game.currentPlayer}
            onHexClick={(row, col, x, y) =>
              setPopup({ row, col, x, y })
            }
          />
        </div>

        {/* LEFT PANEL */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2">
          <PlayerPanel
            playerId={1}
            currentPlayer={game.currentPlayer}
            budget={budget}
            spawnsLeft={spawnsLeft}
            phase={phase}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2">
          <PlayerPanel
            playerId={2}
            currentPlayer={game.currentPlayer}
            budget={budget}
            spawnsLeft={spawnsLeft}
            phase={phase}
          />
        </div>
      </div>

     <div className="mt-8 mb-10">
  <div className="w-full 
                  rounded-2xl 
                  border border-yellow-500/30 
                  bg-black/60 
                  backdrop-blur 
                  shadow-xl 
                  p-4">
    <ActionLog logs={[...(game.actionLogs ?? []), ...clientLogs]} />
  </div>
</div>

      {/* POPUP */}
      {popup && (
        <div
          className="fixed bg-gray-900 border border-gray-600 p-4 rounded shadow-xl z-50"
          style={{
            left: popup.x,
            top: popup.y,
          }}
        >
          <div className="mb-2 font-bold">
            Selected {popup.row} {popup.col}
          </div>

          {phase === "FREE_SPAWN" && (
            <button
              onClick={handleSpawn}
              className="block w-full mb-2 px-3 py-1 bg-green-600 rounded hover:bg-green-700"
            >
              Spawn Free
            </button>
          )}

          {phase === "PLAYER_ACTION" && (
            <button
              onClick={handleBuyHex}
              className="block w-full mb-2 px-3 py-1 bg-yellow-500 rounded hover:bg-yellow-600"
            >
              Buy Hex
            </button>
          )}

          {phase === "PLAYER_ACTION" && (
            <button
              onClick={handleSpawn}
              className="block w-full mb-2 px-3 py-1 bg-purple-600 rounded hover:bg-purple-700"
            >
              Buy Minion
            </button>
          )}

          <button
            onClick={() => setPopup(null)}
            className="block w-full px-3 py-1 bg-red-600 rounded hover:bg-red-700"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}