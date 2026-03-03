import budgetP1Icon from "../assets/images/panelplayer/Budgetp1.png"
import budgetP2Icon from "../assets/images/panelplayer/Budgetp2.png"
import spawnsP1Icon from "../assets/images/panelplayer/Spawnslefp1.png"
import spawnsP2Icon from "../assets/images/panelplayer/Spawnsleftp2 (1).png"
import interestP1Icon from "../assets/images/panelplayer/Interestp1.png"
import interestP2Icon from "../assets/images/panelplayer/Interestp2.png"

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
  const isPlayerOne = playerId === 1

  const iconSet = isPlayerOne
    ? {
        budget: budgetP1Icon,
        spawns: spawnsP1Icon,
        interest: interestP1Icon,
      }
    : {
        budget: budgetP2Icon,
        spawns: spawnsP2Icon,
        interest: interestP2Icon,
      }

  return (
    <div
      className={`w-48 sm:w-52 lg:w-56 rounded-xl p-4 lg:p-5 text-white shadow-lg border backdrop-blur-sm ${
        isPlayerOne
          ? "bg-[#B1202B]/90 border-[#E34A56]"
          : "bg-[#6E3C82]/90 border-[#9F71B3]"
      } ${isActive ? "ring-2 ring-yellow-300/80" : ""}`}
    >
      <h2 className="text-base lg:text-lg font-extrabold tracking-wide mb-3">
        PLAYER {playerId}
      </h2>

      <div className="space-y-2.5 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <img src={iconSet.budget} alt="Budget icon" className="w-5 h-5 object-contain" />
          <span className="font-medium">Budget:</span>
          <span>{budget ?? "-"}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <img src={iconSet.spawns} alt="Spawns icon" className="w-5 h-5 object-contain" />
          <span className="font-medium">Spawns Left:</span>
          <span>{spawnsLeft ?? "-"}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <img src={iconSet.interest} alt="Interest icon" className="w-5 h-5 object-contain" />
          <span className="font-medium">Interest:</span>
          <span>{lastInterest ?? "-"}</span>
        </div>

        <div className="pt-2 border-t border-white/25">
          <span className="font-medium">Phase:</span> {phase}
        </div>
      </div>
    </div>
  )
}
