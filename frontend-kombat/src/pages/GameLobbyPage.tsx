import { useMemo, useState } from "react"
import { stompWs } from "../ws/stompWs"

type ModeType = "DUEL" | "SOLITAIRE" | "AUTO"
type Character = "HUMAN" | "DEMON"
type RoomSetupPhase =
  | "LOBBY"
  | "MINION_TYPE_COUNT"
  | "CHARACTER_SELECT"
  | "MINION_SETUP"
  | "PRE_BATTLE"
  | "PLAYING"
  | "FINISHED"

export interface RoomConfiguredMinion {
  type: string
  name: string
  defenseFactor: number
  strategy: string
}

export interface RoomState {
  roomId: string
  mode: ModeType
  host: string
  players: string[]
  started: boolean
  error?: string
  setupPhase?: RoomSetupPhase
  player1MinionTypeCount?: number
  player2MinionTypeCount?: number
  effectiveMinionTypeCount?: number
  player1Character?: Character
  player2Character?: Character
  player1ConfiguredMinions?: RoomConfiguredMinion[]
  player2ConfiguredMinions?: RoomConfiguredMinion[]
}

interface Props {
  onBack: () => void
  onRoomConnected: (roomId: string, mode: ModeType, playerName: string, localPlayerId: number | null) => void
}

const randomRoomId = () => Math.random().toString(36).slice(2, 8).toUpperCase()

const resolvePlayerId = (room: RoomState | null, playerName: string): number | null => {
  const humans = (room?.players ?? []).filter(
    (name) => !["BOT", "BOT_A", "BOT_B"].includes(name.toUpperCase())
  )

  const index = humans.findIndex((name) => name === playerName)
  if (index === 0) return 1
  if (index === 1) return 2
  return null
}

export default function GameLobbyPage({ onBack, onRoomConnected }: Props) {
  const [playerName] = useState(() => `Player-${Math.floor(Math.random() * 1000)}`)
  const [mode, setMode] = useState<ModeType>("DUEL")
  const [roomCode, setRoomCode] = useState("")
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [connected, setConnected] = useState(false)

  const isHost = !!roomState && roomState.host === playerName
  const humanPlayers = (roomState?.players ?? []).filter(
    (name) => !["BOT", "BOT_A", "BOT_B"].includes(name.toUpperCase())
  )

  const ensureConnected = (onReady: () => void) => {
    if (stompWs.isConnected()) {
      setConnected(true)
      onReady()
      return
    }

    stompWs.connect(() => {
      setConnected(true)
      onReady()
    })
  }

  const subscribeRoom = (roomId: string) => {
    stompWs.subscribe(`/topic/room/${roomId}`, (payload) => {
      if (!payload) return
      const nextRoomState = payload as RoomState
      setRoomState(nextRoomState)
      onRoomConnected(
        nextRoomState.roomId,
        nextRoomState.mode,
        playerName,
        resolvePlayerId(nextRoomState, playerName),
      )
    })
  }

  const handleCreateRoom = () => {
    const roomId = randomRoomId()

    ensureConnected(() => {
      subscribeRoom(roomId)
      stompWs.send("/app/create-room", {
        roomId,
        playerName,
        mode,
      })
      setRoomCode(roomId)
    })
  }

  const handleJoinRoom = () => {
    if (!roomCode.trim()) return
    const roomId = roomCode.trim().toUpperCase()

    ensureConnected(() => {
      subscribeRoom(roomId)
      stompWs.send("/app/join-room", {
        roomId,
        playerName,
      })
    })
  }

  const modeLabel = useMemo(
    () =>
      ({
        DUEL: "Duel Mode",
        SOLITAIRE: "Solitaire Mode",
        AUTO: "Auto Mode",
      })[mode],
    [mode],
  )

  const phaseLabel = roomState?.setupPhase ?? "LOBBY"

  return (
    <div className="min-h-screen bg-[#0d0d10] text-[#fcebc6] flex items-center justify-center p-6">
      <div className="w-full max-w-[900px] rounded-2xl border border-amber-500/40 bg-black/65 p-6 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-4xl font-black tracking-[0.14em] text-yellow-300">KOMBAT</h1>
          <button onClick={onBack} className="px-4 py-2 rounded-lg bg-slate-700/70 hover:bg-slate-600/80">
            Back
          </button>
        </div>

        <p className="mt-2 text-sm text-white/70">Game Lobby ? {roomState?.mode ? `${roomState.mode} Mode` : modeLabel} ? {connected ? "Connected" : "Connecting..."}</p>
        <div className="mt-3 text-xs text-white/60">You are: {playerName}</div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-black/35 p-4 space-y-3">
            <label className="block text-sm text-white/70">Mode</label>
            <select
              value={roomState?.mode ?? mode}
              onChange={(e) => setMode(e.target.value as ModeType)}
              disabled={!!roomState}
              className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 disabled:opacity-60"
            >
              <option value="DUEL">Duel</option>
              <option value="SOLITAIRE">Solitaire</option>
              <option value="AUTO">Auto</option>
            </select>
            <button
              onClick={handleCreateRoom}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-orange-600 to-yellow-500 font-bold"
            >
              Create Room
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/35 p-4 space-y-3">
            <label className="block text-sm text-white/70">Room Code</label>
            <input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 tracking-[0.2em]"
              placeholder="ABC123"
            />
            <button
              onClick={handleJoinRoom}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-500 font-bold"
            >
              Join Room
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/35 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-yellow-200">Players In Room</h2>
            <span className="text-sm text-white/65">{roomState?.roomId ?? "-"}</span>
          </div>
          <ul className="mt-3 space-y-1 text-white/90">
            {(roomState?.players ?? []).map((player) => {
              const playerId = resolvePlayerId(roomState, player)
              return (
                <li key={player} className="px-3 py-1 rounded bg-white/5">
                  {player} {roomState?.host === player ? "(Host)" : ""}
                  {playerId ? ` (P${playerId})` : ""}
                </li>
              )
            })}
          </ul>
          {roomState?.error && (
            <div className="mt-3 text-red-300 text-sm">{roomState.error}</div>
          )}
          {!!roomState && !roomState.started && (
            <div className="mt-4 text-sm text-white/70 space-y-1">
              <div>Phase: {phaseLabel}</div>
              <div>
                {roomState.mode === "DUEL"
                  ? humanPlayers.length >= 2
                    ? "Room ready. Setup flow is driven by backend phase now."
                    : isHost
                      ? "Waiting for Player 2 to join."
                      : "Joined room. Waiting for room sync."
                  : "Room ready."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
