import { useState } from "react"
import ConfirmButton from "../components/ConfirmButton"

import bg from "../assets/images/background-config.png"
import logo from "../assets/images/logo.png"
import boardStrategy from "../assets/images/boardstrategy.png"

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
    <div className="relative w-full min-h-screen">

      {/* Background */}
      <img
        src={bg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 w-full h-full">

        {/* ===== HEADER แบบเดียวกับ SelectMinion ===== */}
        <div className="pt-10 flex justify-center">
          <div className="flex items-center gap-6">
            <img src={logo} alt="logo" className="w-[90px]" draggable={false} />
            <h1 className="text-5xl font-extrabold tracking-wide bg-[linear-gradient(90deg,#FFD54F,#FF9800)] bg-clip-text text-transparent">
              Editing Minion
            </h1>
          </div>
        </div>

        {/* ===== BOARD WRAPPER ===== */}
        <div className="flex justify-center mt-6">
          <div className="relative w-[80%] max-w-[1400px]">

            <img
              src={boardStrategy}
              alt="board"
              className="w-full h-auto select-none pointer-events-none"
              draggable={false}
            />

            {/* ===== CONTENT OVER BOARD ===== */}
            <div className="absolute inset-0 flex">

              {/* LEFT PANEL */}
              <div className="w-[28%] border-r border-yellow-700 flex flex-col items-center pt-16 text-white">

                <h2 className="text-lg tracking-widest mb-6">
                  Selected Minion
                </h2>

                <div className="w-[200px] h-[240px] bg-black/30 rounded-xl mb-6 shadow-inner" />

                <button
                  onClick={() =>
                    setDefenFactor((prev) =>
                      prev === 5 ? 1 : prev + 1
                    )
                  }
                  className="px-8 py-2 rounded-full bg-green-600 hover:bg-green-700 shadow-lg"
                >
                  Defense = {defenFactor}
                </button>
              </div>

              {/* CENTER PANEL */}
              <div className="w-[44%] border-r border-yellow-700 px-10 pt-16 flex flex-col">

                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Write your strategy here..."
                  className="
                    flex-1
                    bg-[#3a2417]
                    border-2 border-yellow-600
                    rounded-lg
                    p-6
                    text-white
                    resize-none
                    focus:outline-none
                  "
                />
              </div>

              {/* RIGHT PANEL */}
              <div className="w-[28%] pl-10 pt-16 text-white">

                <h2 className="text-lg tracking-widest text-center mb-8">
                  QUICK TEMPLATES
                </h2>

                {(["AGGRESSIVE", "DEFENSIVE", "RANDOM"] as TemplateType[]).map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => handleTemplateClick(type)}
                      className={`
                        flex justify-between items-center
                        w-full px-6 py-3
                        rounded-full mb-6 shadow-lg transition-all
                        ${
                          type === "AGGRESSIVE"
                            ? "bg-red-600"
                            : type === "DEFENSIVE"
                            ? "bg-blue-600"
                            : "bg-green-600"
                        }
                        ${
                          selectedTemplate === type
                            ? "ring-2 ring-yellow-400 scale-105"
                            : "hover:scale-105"
                        }
                      `}
                    >
                      <span>{type}</span>
                      <span className="bg-yellow-300 text-black w-8 h-8 flex items-center justify-center rounded-full">
                        ▶
                      </span>
                    </button>
                  )
                )}

                <div className="mt-4 text-sm opacity-80">
                  <p>- move &lt;direction&gt;</p>
                  <p>- shoot &lt;direction&gt; &lt;cost&gt;</p>
                  <p>- if / else</p>
                  <p>- while</p>
                  <p>- done</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ===== FOOTER BUTTONS (เหมือนหน้า SelectMinion) ===== */}
      <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center gap-16 pointer-events-none">
        <div className="flex gap-16 pointer-events-auto">
          <button
            type="button"
            onClick={onBack}
            className="px-16 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold tracking-wide"
          >
            Back
          </button>

          <ConfirmButton
            onClick={() => onConfirm(code, defenFactor)}
          />
        </div>
      </div>
    </div>
  )
}