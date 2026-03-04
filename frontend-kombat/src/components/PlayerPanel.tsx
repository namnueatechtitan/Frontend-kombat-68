import budgetP1Icon from "../assets/images/panelplayer/Budgetp1.png"
import budgetP2Icon from "../assets/images/panelplayer/Budgetp2.png"
import spawnsP1Icon from "../assets/images/panelplayer/Spawnslefp1.png"
import spawnsP2Icon from "../assets/images/panelplayer/Spawnsleftp2 (1).png"
import interestP1Icon from "../assets/images/panelplayer/Interestp1.png"
import interestP2Icon from "../assets/images/panelplayer/Interestp2.png"
import fighterDemonImg from "../assets/images/minions/Demon/fighterdemon.png"
import tankDemonImg from "../assets/images/minions/Demon/tankdemon.png"
import dpsDemonImg from "../assets/images/minions/Demon/dpsdemon.png"
import assassinDemonImg from "../assets/images/minions/Demon/assassindemon.png"
import supportDemonImg from "../assets/images/minions/Demon/supportdemon.png"
import fighterHumanImg from "../assets/images/minions/Human/fighterhuman.png"
import tankHumanImg from "../assets/images/minions/Human/tankhuman.png"
import dpsHumanImg from "../assets/images/minions/Human/dpshuman.png"
import assassinHumanImg from "../assets/images/minions/Human/assassinhuman.png"
import supportHumanImg from "../assets/images/minions/Human/supporthuman.png"
import type { MinionType } from "../types/MinionData"

interface PanelMinion {
  type: string
  hp?: number
}

interface Props {
  playerId: number
  currentPlayer: number
  budget?: number
  spawnsLeft?: number
  lastInterest?: number
  phase: string
  character?: "HUMAN" | "DEMON"
  minions?: PanelMinion[]
}

const demonImageMap: Record<MinionType, string> = {
  FIGHTER: fighterDemonImg,
  ASSASSIN: assassinDemonImg,
  DPS: dpsDemonImg,
  TANK: tankDemonImg,
  SUPPORT: supportDemonImg,
}

const humanImageMap: Record<MinionType, string> = {
  FIGHTER: fighterHumanImg,
  ASSASSIN: assassinHumanImg,
  DPS: dpsHumanImg,
  TANK: tankHumanImg,
  SUPPORT: supportHumanImg,
}

const rowTintByType: Record<MinionType, string> = {
  FIGHTER: "from-emerald-700/25 to-emerald-500/10",
  ASSASSIN: "from-fuchsia-700/25 to-rose-500/10",
  DPS: "from-blue-700/25 to-sky-500/10",
  TANK: "from-red-700/25 to-orange-500/10",
  SUPPORT: "from-amber-700/25 to-yellow-500/10",
}

const demonBorderColorMap: Record<MinionType, string> = {
  FIGHTER: "#310500",
  ASSASSIN: "#720066",
  DPS: "#001311",
  TANK: "#D42828",
  SUPPORT: "#372026",
}

const humanBorderColorMap: Record<MinionType, string> = {
  FIGHTER: "#195A45",
  ASSASSIN: "#6A2834",
  DPS: "#031A54",
  TANK: "#D42828",
  SUPPORT: "#745531",
}

const normalizeMinionType = (type: string): MinionType => {
  const normalized = type.toUpperCase().replace(/[_\s-]/g, "")

  if (normalized.includes("FIGHT")) return "FIGHTER"
  if (normalized.includes("ASSASS")) return "ASSASSIN"
  if (normalized.includes("DPS")) return "DPS"
  if (normalized.includes("TANK")) return "TANK"

  return "SUPPORT"
}

function HpSegmentBar({ hp = 0 }: { hp?: number }) {
  const totalSegments = 10
  const clampedHp = Math.max(0, Math.min(totalSegments, hp))

  return (
    <div className="flex gap-1 w-full">
      {Array.from({ length: totalSegments }).map((_, i) => {
        const filled = i < clampedHp
        return (
          <span
            key={i}
            className={`h-3 flex-1 rounded-sm border border-emerald-200/45 ${
              filled
                ? "bg-gradient-to-b from-emerald-200 to-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                : "bg-black/35"
            }`}
          />
        )
      })}
    </div>
  )
}

export default function PlayerPanel({
  playerId,
  currentPlayer,
  budget,
  spawnsLeft,
  lastInterest,
  phase,
  character = "HUMAN",
  minions = [],
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

  const imageMap = character === "HUMAN" ? humanImageMap : demonImageMap
  const borderColorMap = character === "HUMAN" ? humanBorderColorMap : demonBorderColorMap

  return (
    <div
      className={`w-[320px] xl:w-[350px] rounded-2xl p-3 text-[#FCEBC6] shadow-2xl border backdrop-blur-md ${
        isPlayerOne
          ? "bg-[linear-gradient(180deg,rgba(65,7,10,0.92),rgba(35,5,7,0.95))] border-[#F15A54]/60"
          : "bg-[linear-gradient(180deg,rgba(45,12,64,0.92),rgba(24,6,32,0.95))] border-[#C084FC]/60"
      } ${isActive ? "ring-2 ring-yellow-300/70" : ""}`}
    >
      <div className="rounded-xl border border-white/15 overflow-hidden">
        <h2 className="text-2xl font-extrabold tracking-[0.18em] py-3 text-center bg-black/25 border-b border-white/15">
          PLAYER {playerId}
        </h2>

        <div className="px-3 py-2 bg-black/20 space-y-1 text-sm">
          <div className="flex items-center gap-2 py-2 border-b border-white/10">
            <img src={iconSet.budget} alt="Budget icon" className="w-6 h-6 object-contain" />
            <span className="tracking-wide">Budget ;</span>
            <span className="font-semibold">{budget ?? "-"}</span>
          </div>

          <div className="flex items-center gap-2 py-2 border-b border-white/10">
            <img src={iconSet.interest} alt="Interest icon" className="w-6 h-6 object-contain" />
            <span className="tracking-wide">Interest ;</span>
            <span className="font-semibold">{lastInterest ?? "-"}</span>
          </div>

          <div className="flex items-center gap-2 py-2">
            <img src={iconSet.spawns} alt="Spawns icon" className="w-6 h-6 object-contain" />
            <span className="tracking-wide">Spawns left ;</span>
            <span className="font-semibold">{spawnsLeft ?? "-"}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-white/15 overflow-hidden">
        <h3 className="text-2xl tracking-[0.12em] py-2 text-center bg-black/25 border-b border-white/10">Minion</h3>

        <div className="p-2 space-y-2 max-h-[176px] overflow-y-auto pr-1">
          {minions.length === 0 && (
            <div className="text-center text-sm text-white/70 py-4">No minion deployed</div>
          )}

          {minions.map((minion, index) => {
            const type = normalizeMinionType(minion.type)
            const imageSrc = imageMap[type]
            return (
              <div
                key={`${minion.type}-${index}`}
                className={`relative rounded-[22px] border border-white/20 bg-gradient-to-r ${rowTintByType[type]} overflow-hidden`}
                style={{ borderColor: borderColorMap[type] }}
              >
                <div className="flex items-center gap-3 p-2">
                  <div
                    className="w-[94px] h-[66px] rounded-[16px] bg-black/30 overflow-hidden shrink-0 border"
                    style={{ borderColor: borderColorMap[type] }}
                  >
                    <img
                      src={imageSrc}
                      alt={type}
                      className="w-full h-full object-cover object-[center_28%] scale-[1.05]"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xl font-bold tracking-[0.2em] leading-none">{type}</p>
                    <div className="mt-2">
                      <HpSegmentBar hp={minion.hp ?? 10} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-2 text-[11px] text-white/70 tracking-wide px-1">
        Phase: {phase}
      </div>
    </div>
  )
}
