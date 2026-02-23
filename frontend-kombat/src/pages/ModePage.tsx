import { useState } from "react"
import ConfirmButton from "../components/ConfirmButton"
import ArrowButton from "../components/ArrowButton"
import bg from "../assets/images/background-config.png"
import logo from "../assets/images/logo.png"

import duelImg from "../assets/images/mode-duel.png"
import solitaireImg from "../assets/images/mode-solitaire.png"
import autoImg from "../assets/images/mode-auto.png"

interface Props {
  onBack: () => void
  onConfirm: (mode: ModeType) => void
}

type ModeType = "DUEL" | "SOLITAIRE" | "AUTO"

export default function ModePage({ onBack, onConfirm }: Props) {
  const [selectedMode, setSelectedMode] = useState<ModeType | null>(null)

  const modes = [
    { key: "DUEL" as ModeType, image: duelImg, label: "Player vs Player" },
    { key: "SOLITAIRE" as ModeType, image: solitaireImg, label: "Player vs AI" },
    { key: "AUTO" as ModeType, image: autoImg, label: "Bot vs Bot" },
  ]

  return (
    <div className="relative w-full h-full overflow-hidden">

      {/* Background */}
      <img
        src={bg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />

      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full h-full">

        {/* Logo */}
        <img
          src={logo}
          alt="logo"
          className="mt-[50px] w-[100px] md:w-[100px] select-none"
          draggable={false}
        />

        {/* Title */}
        <h1
          className="
            text-4xl md:text-5xl
            font-extrabold
            tracking-widest
            bg-[radial-gradient(circle,#FFFFFF_0%,#FFB300_60%,#FFB300_100%)]
            bg-clip-text
            text-transparent
            drop-shadow-[0_0_12px_rgba(255,179,0,0.6)]
            mt-6 mb-14
          "
        >
          SELECT MODE
        </h1>

        {/* Cards */}
        <div className="flex gap-12 flex-wrap justify-center max-w-6xl px-6">

          {modes.map((mode) => (
            <div key={mode.key} className="flex flex-col items-center">

              {/* Card */}
              <div
                className={`
                  relative
                  w-[100x] md:w-[300px] lg:w-[300px]
                  cursor-pointer
                  transition-all duration-300
                  ${
                    selectedMode === mode.key
                      ? "scale-105 ring-4 ring-orange-400 shadow-[0_0_30px_rgba(255,140,0,0.9)]"
                      : "hover:scale-105 hover:shadow-xl"
                  }
                `}
                onClick={() => setSelectedMode(mode.key)}
              >
                {/* Image */}
                <img
                  src={mode.image}
                  alt={mode.key}
                  className="w-full rounded-xl select-none"
                  draggable={false}
                />

                {/* Bottom Label inside frame */}
                <div className="absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur-sm text-white text-center py-3 rounded-b-xl text-sm tracking-wide">
                  {mode.label}
                </div>
              </div>

              {/* Select Button */}
              <button
                onClick={() => setSelectedMode(mode.key)}
                className={`
                  mt-6 px-8 py-2 rounded-full
                  text-white font-semibold
                  transition-all duration-200
                  ${
                    selectedMode === mode.key
                      ? "bg-gradient-to-r from-orange-500 to-yellow-400 shadow-lg"
                      : "bg-blue-500 hover:bg-blue-600"
                  }
                `}
              >
                {selectedMode === mode.key ? "Selected" : "Select"}
              </button>

            </div>
          ))}

        </div>

        {/* Confirm */}
        <div className="mt-16">
          <ConfirmButton
            onClick={() => {
              if (!selectedMode) {
                alert("Please select a mode first.")
                return
              }
              onConfirm(selectedMode)
            }}
          />
        </div>

      </div>

      {/* Arrow Buttons */}
      <ArrowButton
        direction="left"
        onClick={onBack}
        className="top-10 left-6"
      />

      <ArrowButton
        direction="right"
        onClick={() => {
          if (!selectedMode) {
            alert("Please select a mode first.")
            return
          }
          onConfirm(selectedMode)
        }}
        className="top-10 right-6"
      />

    </div>
  )
}