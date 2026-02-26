import { useState } from "react"
import ConfirmButton from "../components/ConfirmButton"   // ✅ เพิ่ม

import bg from "../assets/images/Minion setup.png"
import logo from "../assets/images/logo.png"

interface Props {
  onBack: () => void
  onConfirm: (code: string, defenFactor: number) => void
}

type TemplateType = "AGGRESSIVE" | "DEFENSIVE" | "RANDOM"

export default function StrategySetupPage({
  onBack,
  onConfirm,
}: Props) {
  const [code, setCode] = useState("")
  const [defenFactor, setDefenFactor] = useState(1)
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType | null>(null)

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
          className="w-[110px] mb-4 drop-shadow-[0_0_20px_rgba(255,200,80,0.5)]"
          draggable={false}
        />

        <h1 className="
          text-5xl font-extrabold tracking-wide
          bg-gradient-to-r from-[#FFD54F] to-[#FF9800]
          bg-clip-text text-transparent
        ">
          Select Minion
        </h1>
      </div>

      {/* ================= GOLD FRAME ================= */}
      <div
        className="
        relative z-10
        mt-12
        w-[1200px]
        h-[600px]
        rounded-xl
        bg-gradient-to-b
        from-[#4b2a14]
        via-[#3a1f10]
        to-[#2a160b]
        border border-[#e0b15c]
        shadow-[0_0_80px_rgba(255,170,60,0.3)]
        overflow-hidden
        "
      >
        <div
          className="
          pointer-events-none
          absolute inset-0
          rounded-xl
          shadow-[inset_0_0_60px_rgba(255,180,80,0.25)]
        "
        />

        <div
          className="
          h-[50px]
          flex items-center justify-center
          text-[#ffe0a3]
          text-2xl tracking-[0.4em]
          border-b border-[#e0b15c]
          bg-gradient-to-r
          from-[#5a3219]
          via-[#6b3a1c]
          to-[#5a3219]
        "
        >
          EDITING FIGHTER (TYPE 1)
        </div>

        <div className="flex h-[calc(100%-90px)]">

          {/* LEFT */}
          <div className="w-[30%] relative p-10 text-[#ffe0a3]">

            <div className="absolute right-0 top-0 bottom-0 w-[2px]
              bg-gradient-to-b from-transparent via-[#e0b15c] to-transparent" />

            <div className="text-lg tracking-widest mb-6">
              SELECTED MINION
            </div>

            <div className="
              w-[240px]
              h-[260px]
              bg-[#2a160b]
              border border-[#e0b15c]
              rounded-lg
              shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]
              mb-8
            " />

            <button
              onClick={() =>
                setDefenFactor(prev => (prev === 5 ? 1 : prev + 1))
              }
              className="
                px-8 py-2 rounded-full
                bg-gradient-to-r
                from-[#0f766e]
                to-[#10b981]
                text-white
                shadow-[0_5px_20px_rgba(0,0,0,0.7)]
              "
            >
              Defense = {defenFactor}
            </button>
          </div>

          {/* CENTER */}
          <div className="w-[40%] relative p-10">

            <div className="absolute right-0 top-0 bottom-0 w-[2px]
              bg-gradient-to-b from-transparent via-[#e0b15c] to-transparent" />

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your strategy here..."
              className="
                w-full h-full
                bg-[#2b1a0f]
                border border-[#e0b15c]
                rounded-lg
                p-6
                text-[#ffe0a3]
                resize-none
                shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]
                focus:outline-none
              "
            />
          </div>

          {/* RIGHT */}
          <div className="w-[30%] p-10 text-[#ffe0a3] relative">

            <div className="text-lg tracking-widest mb-8">
              QUICK TEMPLATES
            </div>

            {(["AGGRESSIVE", "DEFENSIVE", "RANDOM"] as TemplateType[]).map(
              (type) => {
                const colorMap = {
                  AGGRESSIVE: "from-[#7a1414] to-[#b91c1c]",
                  DEFENSIVE: "from-[#1e3a8a] to-[#2563eb]",
                  RANDOM: "from-[#065f46] to-[#10b981]",
                }

                return (
                  <button
                    key={type}
                    onClick={() => handleTemplateClick(type)}
                    className={`
                      w-full mb-6 px-6 py-3
                      rounded-full text-white
                      flex justify-between items-center
                      bg-gradient-to-r ${colorMap[type]}
                      shadow-[0_6px_20px_rgba(0,0,0,0.8)]
                      transition
                      ${selectedTemplate === type ? "ring-2 ring-[#ffd27a]" : ""}
                    `}
                  >
                    <span>{type}</span>
                    <span className="
                      w-8 h-8 rounded-full
                      bg-[#ffe0a3]
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

      {/* FOOTER */}
      <div className="relative z-10 flex gap-20 mt-10 mb-16">

        <button
          onClick={onBack}
          className="
            px-16 py-3 rounded-full
            bg-gradient-to-r
            from-[#3b82f6]
            to-[#60a5fa]
            text-white
            shadow-[0_5px_20px_rgba(0,0,0,0.7)]
          "
        >
          Back
        </button>

        {/* ✅ ใช้ ConfirmButton component ตามที่สั่ง */}
        <ConfirmButton
          onClick={() => onConfirm(code, defenFactor)}
          disabled={!code.trim()}
        />

      </div>

    </div>
  )
}