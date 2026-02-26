import { useState, useEffect } from "react"
import ConfirmButton from "../components/ConfirmButton"
import type { MinionData, MinionType } from "../types/MinionData"

import bg from "../assets/images/Minion setup.png"
import logo from "../assets/images/logo.png"

import assassinPortrait from "../assets/images/minions/Human/human_assassin_preview_portrait.png"
import fighterPortrait from "../assets/images/minions/Human/human_fighter_preview_portrait.png"
import dpsPortrait from "../assets/images/minions/Human/human_dps_preview_portrait.png"
import tankPortrait from "../assets/images/minions/Human/human_tank_preview_portrait.png"
import supportPortrait from "../assets/images/minions/Human/human_support_preview_portrait.png"

interface Props {
  minion: MinionData & {
    strategy?: string
    defenseFactor?: number
  }
  onBack: () => void
  onConfirm: (code: string, defenFactor: number) => void
}

type TemplateType = "AGGRESSIVE" | "DEFENSIVE" | "RANDOM"

const portraitMap: Record<MinionType, string> = {
  ASSASSIN: assassinPortrait,
  FIGHTER: fighterPortrait,
  DPS: dpsPortrait,
  TANK: tankPortrait,
  SUPPORT: supportPortrait,
}

export default function StrategySetupPage({
  minion,
  onBack,
  onConfirm,
}: Props) {

  const [code, setCode] = useState("")
  const [defenFactor, setDefenFactor] = useState(1)
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setCode(minion.strategy ?? "")
    setDefenFactor(minion.defenseFactor ?? 1)
  }, [minion])

  const templates: Record<TemplateType, string> = {
    AGGRESSIVE: `if (nearby up) then {
  shoot up 1;
} else {
  move up;
}
done;`,

    DEFENSIVE: `if (hp < 50) then {
  move down;
} else {
  shoot up 1;
}
done;`,

    RANDOM: `move up;
shoot right 1;
done;`,
  }

  function handleTemplateClick(type: TemplateType) {
    setSelectedTemplate(type)
    setCode(templates[type])
  }

  async function handleConfirm() {
    if (!code.trim() || loading) return

    try {
      setLoading(true)
      setError("")
      onConfirm(code, defenFactor)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start">

      <img src={bg} alt="background"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 mt-10 flex flex-col items-center">
        <img src={logo} alt="logo" className="w-[110px] mb-4" draggable={false} />
        <h1 className="text-5xl font-extrabold tracking-wide
          bg-gradient-to-r from-[#f6d27a] to-[#c6932f]
          bg-clip-text text-transparent">
          Minion Strategy Setup
        </h1>
      </div>

      <div className="relative z-10 mt-10 w-[1200px] h-[600px]
        rounded-xl
        bg-gradient-to-b from-[#4a2c18] via-[#2e1a0f] to-[#160c06]
        border border-[#c6932f]
        overflow-hidden">

        <div className="h-[50px]
          flex items-center justify-center
          text-[#f6d27a]
          text-2xl font-bold tracking-[0.4em]
          border-b border-[#c6932f]
          bg-gradient-to-r from-[#6a3f1f] via-[#8b5a2b] to-[#6a3f1f]">
          EDITING {minion.name.toUpperCase()}
        </div>

        <div className="flex h-[calc(100%-50px)]">

          {/* LEFT PANEL */}
          <div className="w-[30%] relative p-10 text-[#f1d8a5]">
            <div className="absolute right-0 top-0 bottom-0 w-[2px]
              bg-gradient-to-b from-transparent via-[#c6932f] to-transparent" />

            <div className="mb-10 text-center">
              <div className="text-2xl font-bold tracking-[0.3em]
                text-[#f6d27a]
                drop-shadow-[0_0_15px_rgba(246,210,122,0.4)]">
                {minion.name.toUpperCase()}
              </div>
              <div className="flex justify-center mt-4">
                <div className="w-48 h-[2px]
                  bg-gradient-to-r from-transparent via-[#c6932f] to-transparent" />
              </div>
            </div>

            <img
              src={portraitMap[minion.type]}
              alt={minion.name}
              className="w-[300px] h-[300px] object-contain rounded-lg mb-2"
              draggable={false}
            />

            {/* 🛡 DEFENSE */}
            <div className="mt-3 flex justify-center">
              <div className="flex items-center gap-4 px-6 py-2
                rounded-full
                bg-[#3b1f0f]
                border border-[#c6932f]
                text-[#f6d27a]">

                <svg viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-[#c6932f]">
                  <path d="M12 2L4 5v6c0 5.25 3.438 10.125 8 11
                  4.563-.875 8-5.75 8-11V5l-8-3z" />
                </svg>

                <button
                  type="button"
                  onClick={() => setDefenFactor(p => Math.max(1, p - 1))}
                  className="w-7 h-7 rounded-full
                    bg-[#8b5a2b] text-[#f6d27a]
                    flex items-center justify-center
                    hover:scale-110 transition">
                  −
                </button>

                <span className="w-12 text-center font-bold text-lg">
                  {defenFactor}
                </span>

                <button
                  type="button"
                  onClick={() => setDefenFactor(p => Math.min(1000, p + 1))}
                  className="w-7 h-7 rounded-full
                    bg-[#c6932f] text-[#2e1a0f]
                    flex items-center justify-center
                    hover:scale-110 transition">
                  +
                </button>

                <span className="ml-2 font-semibold tracking-[0.2em]">
                  DEF
                </span>
              </div>
            </div>
          </div>

          {/* MIDDLE */}
          <div className="w-[40%] relative p-10">
            <div className="absolute right-0 top-0 bottom-0 w-[2px]
              bg-gradient-to-b from-transparent via-[#c6932f] to-transparent" />

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full
                bg-[#2a170d]
                border border-[#c6932f]
                rounded-lg p-6
                text-[#f6e6c4]
                font-mono resize-none"
            />
          </div>

          {/* RIGHT PANEL (VECTOR คืนครบ) */}
          <div className="w-[30%] p-10 text-[#f1d8a5]">
            <div className="text-lg tracking-[0.2em] mb-8 text-[#e6c27a]">
              QUICK TEMPLATES
            </div>

            {(["AGGRESSIVE","DEFENSIVE","RANDOM"] as TemplateType[]).map(type => {

              const bgColorMap = {
                AGGRESSIVE: "bg-[#59151A]",
                DEFENSIVE: "bg-[#0D204B]",
                RANDOM: "bg-[#1A312C]",
              }

              return (
                <button
                  key={type}
                  onClick={() => handleTemplateClick(type)}
                  className={`
                    w-full h-[60px]
                    mb-10 px-12
                    rounded-full
                    text-[#EDEDED]
                    tracking-[0.2em]
                    flex items-center justify-between
                    ${bgColorMap[type]}
                    hover:scale-[1.02] transition
                    ${selectedTemplate === type ? "ring-2 ring-white" : ""}
                  `}
                >
                  <span className="uppercase">{type}</span>

                  {/* VECTOR */}
                  <div
                    className="w-[20px] h-[20px]
                      rounded-full
                      flex items-center justify-center
                      shadow-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, #FF3D00 0%, #ECDB46 100%)",
                    }}
                  >
                    <svg
                      width="24"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2B1A10"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </div>

                </button>
              )
            })}
          </div>

        </div>
      </div>

      <div className="relative z-10 flex gap-20 mt-10 mb-16">
        <button
          onClick={onBack}
          className="px-16 py-3 rounded-full
            bg-gradient-to-r from-[#1e3a8a] to-[#2563eb]
            text-white">
          Back
        </button>

        <ConfirmButton
          onClick={handleConfirm}
          disabled={!code.trim() || loading}
        />
      </div>

      {error && (
        <div className="fixed bottom-4 left-0 right-0 text-center text-red-500 font-semibold z-50">
          {error}
        </div>
      )}
    </div>
  )
}