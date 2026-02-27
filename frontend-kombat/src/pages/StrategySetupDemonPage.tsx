import { useState, useEffect } from "react"
import ConfirmButton from "../components/ConfirmButton"
import type { MinionData, MinionType } from "../types/MinionData"

import bg from "../assets/images/Minion setup.png"
import logo from "../assets/images/logo.png"

// ----- DEMON portrait -----
import assassinPortrait from "../assets/images/minions/Demon/demon_assassin_preview_portrait.png"
import fighterPortrait from "../assets/images/minions/Demon/demon_fighter_preview_portrait.png"
import dpsPortrait from "../assets/images/minions/Demon/demon_dps_preview_portrait.png"
import tankPortrait from "../assets/images/minions/Demon/demon_tank_preview_portrait.png"
import supportPortrait from "../assets/images/minions/Demon/demon_support_preview_portrait.png"

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

export default function StrategySetupDemonPage({
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
               className="w-[400px] h-[300px] object-contain rounded-lg mb-2 drop-shadow-[0_0_25px_rgba(246,210,122,0.5)]"
              draggable={false}
            />
          {/* DEFENSE - DEMON PURPLE */}
<div className="mt-1 flex justify-center">
  <div className="relative flex items-center justify-center group">

    {/* 🟣 Outer rotating purple ring */}
    <div className="
      absolute w-[100px] h-[100px]
      rounded-full
      border border-[#a855f7]/40
      shadow-[0_0_50px_rgba(168,85,247,0.8)]
      animate-spin
      [animation-duration:18s]
    " />

    {/* 🟣 Inner reverse ring */}
    <div className="
      absolute w-[70px] h-[70px]
      rounded-full
      border border-[#c084fc]/40
      animate-spin
      [animation-duration:12s]
      [animation-direction:reverse]
    " />

    {/* 🟣 Floating purple particles */}
    <div className="absolute w-[160px] h-[160px] pointer-events-none">
      <div className="absolute top-3 left-1/2 w-2 h-2 bg-[#a855f7] rounded-full animate-ping opacity-80" />
      <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-[#c084fc] rounded-full animate-pulse opacity-70" />
      <div className="absolute top-10 right-4 w-1.5 h-1.5 bg-[#9333ea] rounded-full animate-ping opacity-60" />
      <div className="absolute bottom-8 right-8 w-2 h-2 bg-[#d8b4fe] rounded-full animate-pulse opacity-70" />
    </div>

    {/* 🟣 Core DEF Badge */}
    <div
      className="
        relative
        flex items-center gap-3 px-6 py-2
        rounded-full
        bg-gradient-to-r from-[#1a002b] via-[#4c1d95] to-[#1a002b]
        border border-[#c084fc]
        text-[#e9d5ff]
        shadow-[0_0_35px_rgba(168,85,247,0.8)]
        transition duration-500
        group-hover:shadow-[0_0_65px_rgba(147,51,234,1)]
        z-10
      "
    >
      {/* Shield */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6 text-[#c084fc]"
      >
        <path d="M12 2L4 5v6c0 5.25 3.438 10.125 8 11
        4.563-.875 8-5.75 8-11V5l-8-3z" />
      </svg>

      {/* Minus */}
      <button
        type="button"
        onClick={() => setDefenFactor(p => Math.max(1, p - 1))}
        className="
          w-7 h-7 rounded-full
          bg-gradient-to-b from-[#c084fc] to-[#7e22ce]
          text-[#1a002b] font-bold text-lg
          flex items-center justify-center
          hover:scale-110
          hover:shadow-[0_0_15px_rgba(168,85,247,0.9)]
          transition duration-300
        "
      >
        −
      </button>

      {/* Value */}
      <span className="text-2xl font-bold tracking-widest text-[#f3e8ff]">
        {defenFactor}
      </span>

      {/* Plus */}
      <button
        type="button"
        onClick={() => setDefenFactor(p => Math.min(1000, p + 1))}
        className="
          w-7 h-7 rounded-full
          bg-gradient-to-b from-[#c084fc] to-[#7e22ce]
          text-[#1a002b] font-bold text-lg
          flex items-center justify-center
          hover:scale-110
          hover:shadow-[0_0_15px_rgba(168,85,247,0.9)]
          transition duration-300
        "
      >
        +
      </button>

      <span className="text-sm tracking-[0.3em] text-[#e9d5ff]">
        DEF
      </span>
    </div>

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

          {/* RIGHT PANEL */}
<div className="w-[30%] p-10 text-[#e6dcff]">

  {/* TITLE */}
  <div className="mb-8">

    <div
      className="
        text-lg font-bold tracking-[0.3em]
        bg-gradient-to-r from-[#f6d27a] to-[#c6932f]
        bg-clip-text text-transparent
        drop-shadow-[0_0_6px_rgba(246,210,122,0.6)]
      "
    >
      QUICK TEMPLATES
    </div>

    <div className="mt-4 flex justify-center">
      <div
        className="
          w-[80%] h-[2px]
          bg-gradient-to-r
          from-transparent
          via-[#4b1d6b]/70
          to-transparent
          shadow-[0_0_8px_rgba(75,29,107,0.5)]
          rounded-full
        "
      />
    </div>
  </div>

  {(["AGGRESSIVE", "DEFENSIVE", "RANDOM"] as TemplateType[]).map(type => {

    const iconMap = {
      AGGRESSIVE: (
        <svg width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 4l6 6-8 8-6-6z" />
          <path d="M10 14l-6 6" />
        </svg>
      ),
      DEFENSIVE: (
        <svg width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L4 5v6c0 5.25 3.438 10.125 8 11
            4.563-.875 8-5.75 8-11V5l-8-3z" />
        </svg>
      ),
      RANDOM: (
        <svg width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 7h.01" />
          <path d="M15 17h.01" />
        </svg>
      )
    }

    return (
      <button
        key={type}
        onClick={() => handleTemplateClick(type)}
        className={`
          group relative
          w-full h-[60px]
          mb-10 px-12
          rounded-full
          tracking-[0.25em]
          flex items-center justify-between
          overflow-hidden
          transition duration-300
          bg-gradient-to-r from-[#1a0026] via-[#4b1d6b] to-[#1a0026]
          border border-[#6a0dad]/40
          text-[#e6dcff]
          shadow-[0_0_25px_rgba(106,13,173,0.35)]
          hover:shadow-[0_0_40px_rgba(106,13,173,0.55)]
          hover:scale-[1.02]
          ${selectedTemplate === type
            ? "ring-1 ring-[#8b5cf6] shadow-[0_0_50px_rgba(139,92,246,0.6)]"
            : ""}
        `}
      >

        <div className="flex items-center gap-4 z-10">
          <div className="
            w-8 h-8 rounded-full
            flex items-center justify-center
            bg-black/40
            shadow-[0_0_12px_rgba(106,13,173,0.5)]
          ">
            {iconMap[type]}
          </div>

          <span className="uppercase font-semibold">
            {type}
          </span>
        </div>

        <div className="
          w-[22px] h-[22px]
          rounded-full
          flex items-center justify-center
          bg-gradient-to-b from-[#b58cff] to-[#6a0dad]
          shadow-[0_0_12px_rgba(139,92,246,0.5)]
          shrink-0
          z-10
        ">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#14001f"
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