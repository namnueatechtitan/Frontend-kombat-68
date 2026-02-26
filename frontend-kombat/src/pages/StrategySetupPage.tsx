import { useState } from "react"
import ConfirmButton from "../components/ConfirmButton"
import type { MinionData, MinionType } from "../types/MinionData"

import bg from "../assets/images/Minion setup.png"
import logo from "../assets/images/logo.png"

// ✅ เพิ่มรูปของ StrategySetupPage เอง
import assassinPortrait from "../assets/images/minions/Human/human_assassin_preview_portrait.png"
import fighterPortrait from "../assets/images/minions/Human/human_fighter_preview_portrait.png"
import dpsPortrait from "../assets/images/minions/Human/human_dps_preview_portrait.png"
import tankPortrait from "../assets/images/minions/Human/human_tank_preview_portrait.png"
import supportPortrait from "../assets/images/minions/Human/human_support_preview_portrait.png"

interface Props {
  minion: MinionData
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

  const templates: Record<TemplateType, string> = {
    AGGRESSIVE: `if (nearby up) then {
  shoot up 1
} else {
  move up
}
done`,
    DEFENSIVE: `if (hp < 50) then {
  move down
} else {
  shoot up 1
}
done`,
    RANDOM: `move up
shoot right 1
done`,
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

      const res = await fetch("http://localhost:8080/api/game/minion/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: minion.type,
          defenseFactor: defenFactor,
          strategy: code,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Failed to create minion")
      }

      onConfirm(code, defenFactor)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start">

      <img
        src={bg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 mt-10 flex flex-col items-center">
        <img
          src={logo}
          alt="logo"
          className="w-[110px] mb-4"
          draggable={false}
        />

        <h1 className="
          text-5xl font-extrabold tracking-wide
          bg-gradient-to-r from-[#f6d27a] to-[#c6932f]
          bg-clip-text text-transparent
        ">
          Select Minion
        </h1>
      </div>

      <div
        className="
        relative z-10
        mt-12
        w-[1200px]
        h-[600px]
        rounded-xl
        bg-gradient-to-b
        from-[#4a2c18]
        via-[#2e1a0f]
        to-[#160c06]
        border border-[#c6932f]
        overflow-hidden
        "
      >
        <div
          className="
          h-[50px]
          flex items-center justify-center
          text-[#f6d27a]
          text-2xl tracking-[0.4em]
          border-b border-[#c6932f]
          bg-gradient-to-r
          from-[#6a3f1f]
          via-[#8b5a2b]
          to-[#6a3f1f]
        "
        >
          EDITING {minion.name.toUpperCase()}
        </div>

        <div className="flex h-[calc(100%-50px)]">

          <div className="w-[30%] relative p-10 text-[#f1d8a5]">
            <div className="absolute right-0 top-0 bottom-0 w-[2px]
              bg-gradient-to-b from-transparent via-[#c6932f] to-transparent" />

            <div className="text-lg tracking-widest mb-8 text-[#e6c27a]">
              SELECTED MINION
            </div>

            <img
              src={portraitMap[minion.type]}
              alt={minion.name}
              className="
                w-[300px]
                h-[300px]
                object-contain
                rounded-lg
                mb-1
              "
              draggable={false}
            />

            <div
              className="
                flex items-center justify-between
                w-[240px] px-6 py-3
                rounded-full
                bg-[#29795F]
                text-white
                text-lg tracking-[0.15em]
              "
            >
              <span>
                Defense =
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={defenFactor}
                  onChange={(e) =>
                    setDefenFactor(
                      Math.max(1, Math.min(1000, Number(e.target.value) || 1))
                    )
                  }
                  className="
                    w-10 ml-3
                    bg-transparent
                    outline-none
                    text-white
                    text-center
                  "
                />
              </span>
            </div>
          </div>

          <div className="w-[40%] relative p-10">
            <div className="absolute right-0 top-0 bottom-0 w-[2px]
              bg-gradient-to-b from-transparent via-[#c6932f] to-transparent" />

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your strategy here..."
              className="
                w-full h-full
                bg-[#2a170d]
                border border-[#c6932f]
                rounded-lg
                p-6
                text-[#f6e6c4]
                font-mono
                leading-7
                resize-none
                focus:outline-none
                caret-[#c6932f]
              "
            />
          </div>

          <div className="w-[30%] p-10 text-[#f1d8a5] relative">
            <div className="text-lg tracking-widest mb-8 text-[#e6c27a]">
              QUICK TEMPLATES
            </div>

            {(["AGGRESSIVE", "DEFENSIVE", "RANDOM"] as TemplateType[]).map(
              (type) => {
                const colorMap = {
                  AGGRESSIVE: "from-[#5a0f0f] to-[#a31515]",
                  DEFENSIVE: "from-[#0f2a5a] to-[#1e40af]",
                  RANDOM: "from-[#043d2c] to-[#0f9f6e]",
                }

                return (
                  <button
                    key={type}
                    onClick={() => handleTemplateClick(type)}
                    className={`
                      w-full mb-6 px-6 py-3
                      rounded-full text-[#f6e6c4]
                      flex justify-between items-center
                      bg-gradient-to-r ${colorMap[type]}
                      ${selectedTemplate === type ? "ring-2 ring-[#c6932f]" : ""}
                    `}
                  >
                    <span>{type}</span>
                    <span className="
                      w-8 h-8 rounded-full
                      bg-[#d4a846]
                      text-black flex items-center justify-center
                    ">
                      ▶
                    </span>
                  </button>
                )
              }
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex gap-20 mt-10 mb-16">
        <button
          onClick={onBack}
          className="
            px-16 py-3
            rounded-full
            bg-gradient-to-r
            from-[#1e3a8a]
            to-[#2563eb]
            text-white
          "
        >
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