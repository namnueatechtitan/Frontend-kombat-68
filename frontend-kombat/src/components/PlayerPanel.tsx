interface Props {
  playerId: number
  currentPlayer: number
  budget?: number
  spawnsLeft?: number
  lastInterest?: number
  phase: string
}

export default function PlayerPanel({
  playerId,
  currentPlayer,
  budget,
  spawnsLeft,
  lastInterest,
  phase,
}: Props) {
  const isActive = currentPlayer === playerId

  return (
    <div
      className={`w-64 h-[500px] rounded-xl p-4 border ${
        isActive
          ? "border-yellow-400 shadow-lg shadow-yellow-500/30"
          : "border-gray-600"
      } bg-gray-900`}
    >
      <h2 className="text-xl font-bold mb-4">
        PLAYER {playerId}
      </h2>

      <div className="space-y-3 text-sm">
        <div>
          <span className="text-gray-400">Budget:</span>{" "}
          {budget ?? "-"}
        </div>

        <div>
          <span className="text-gray-400">Phase:</span>{" "}
          {phase}
        </div>

        <div>
          <span className="text-gray-400">
            Spawns Left:
          </span>{" "}
          {spawnsLeft ?? "-"}
        </div>

        <div>
          <span className="text-gray-400">Last Interest:</span>{" "}
          {lastInterest ?? "-"}
        </div>
      </div>
    </div>
  )
}