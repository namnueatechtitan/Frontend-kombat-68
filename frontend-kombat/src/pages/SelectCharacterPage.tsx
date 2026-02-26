import { useState } from "react"

// Components
import ConfirmButton from "../components/ConfirmButton"

// API
import { setCharacter } from "../api/gameApi.ts"

// Assets
import bg from "../assets/images/background-config.png"
import logo from "../assets/images/logo.png"
import humanImg from "../assets/images/ui-human.png"
import demonImg from "../assets/images/ui-demon.png"

interface Props {
  onBack: () => void
  onConfirm: (uiType: "HUMAN" | "DEMON") => void
}

export default function SelectCharacterPage({ onConfirm }: Props) {
  const [selected, setSelected] = useState<"HUMAN" | "DEMON" | null>(null)
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)

  const triggerSelect = (type: "HUMAN" | "DEMON") => {
    setSelected(type)
    setShake(true)

    setTimeout(() => {
      setShake(false)
    }, 200)
  }

  const handleConfirm = async () => {
  if (!selected || loading) return

  try {
    setLoading(true)

    // ยิง backend แต่ถ้าพังไม่ให้บล็อคหน้า
    try {
      await setCharacter(selected)
    } catch (apiError) {
      console.warn("Backend error but continue UI:", apiError)
    }

    // 🔥 ไปหน้าถัดไปเสมอ
    onConfirm(selected)

  } catch (err) {
    console.error(err)
  } finally {
    setLoading(false)
  }
}

  return (
    <div
      className={`
        relative w-full h-full overflow-hidden
        ${shake ? "animate-shake" : ""}
      `}
    >
      {/* Shake Animation */}
      <style>
        {`
          @keyframes shake-soft {
            0%   { transform: translate(0px, 0px); }
            25%  { transform: translate(-0.5px, 0.5px); }
            50%  { transform: translate(0.5px, -0.5px); }
            75%  { transform: translate(-0.5px, 0px); }
            100% { transform: translate(0px, 0px); }
          }

          .animate-shake {
            animation: shake-soft 0.2s ease-out;
          }
        `}
      </style>

      {/* Background */}
      <img
        src={bg}
        alt="background"
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
      />

      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full h-full">
        {/* Logo */}
        <img
          src={logo}
          alt="logo"
          draggable={false}
          className="mt-[50px] w-[100px] select-none"
        />

        {/* Title */}
        <h1
          className="
            text-4xl md:text-5xl
            font-extrabold tracking-widest
            bg-[radial-gradient(circle,_#FFFFFF_0%,_#FFB300_60%,_#FFB300_100%)]
            bg-clip-text text-transparent
            drop-shadow-[0_0_12px_rgba(255,179,0,0.6)]
            mt-6 mb-10
          "
        >
          SELECT UI
        </h1>

        {/* Options */}
        <div className="flex gap-16 items-center justify-center">

          {/* HUMAN */}
          <div className="flex flex-col items-center">
            <div
              onClick={() => triggerSelect("HUMAN")}
              className={`
                w-[350px] md:w-[400px]
                rounded-full p-2 cursor-pointer
                transition-all duration-300
                ${
                  selected === "HUMAN"
                    ? "scale-110 ring-4 ring-red-500 shadow-[0_0_50px_rgba(255,0,0,0.8)]"
                    : "hover:scale-105"
                }
              `}
            >
              <img
                src={humanImg}
                alt="human-ui"
                draggable={false}
                className="rounded-full select-none"
              />
            </div>

            <button
              onClick={() => triggerSelect("HUMAN")}
              className={`
                mt-6 px-10 py-2 rounded-full
                font-semibold tracking-wide
                transition-all duration-200
                ${
                  selected === "HUMAN"
                    ? "bg-gradient-to-r from-red-500 to-orange-400 text-white scale-105"
                    : "bg-blue-400 text-white hover:scale-105"
                }
              `}
            >
              {selected === "HUMAN" ? "Selected" : "Select"}
            </button>
          </div>

          {/* DEMON */}
          <div className="flex flex-col items-center">
            <div
              onClick={() => triggerSelect("DEMON")}
              className={`
                w-[350px] md:w-[400px]
                rounded-full p-2 cursor-pointer
                transition-all duration-300
                ${
                  selected === "DEMON"
                    ? "scale-110 ring-4 ring-purple-500 shadow-[0_0_50px_rgba(180,0,255,0.8)]"
                    : "hover:scale-105"
                }
              `}
            >
              <img
                src={demonImg}
                alt="demon-ui"
                draggable={false}
                className="rounded-full select-none"
              />
            </div>

            <button
              onClick={() => triggerSelect("DEMON")}
              className={`
                mt-6 px-10 py-2 rounded-full
                font-semibold tracking-wide
                transition-all duration-200
                ${
                  selected === "DEMON"
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white scale-105"
                    : "bg-blue-400 text-white hover:scale-105"
                }
              `}
            >
              {selected === "DEMON" ? "Selected" : "Select"}
            </button>
          </div>

        </div>

        {/* Confirm */}
        <div className="mt-12">
          <ConfirmButton
            onClick={handleConfirm}
            disabled={!selected || loading}
          />
        </div>
      </div>
    </div>
  )
}