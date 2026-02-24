import { useState } from "react"

import { setMinionTypeCount } from "../api/gameApi"

// Components
import ConfirmButton from "../components/ConfirmButton"
import ArrowButton from "../components/ArrowButton"

// Assets
import bg from "../assets/images/background-config.png"
import logo from "../assets/images/logo.png"

import type1 from "../assets/images/minion-type-1.png"
import type2 from "../assets/images/minion-type-2.png"
import type3 from "../assets/images/minion-type-3.png"
import type4 from "../assets/images/minion-type-4.png"
import type5 from "../assets/images/minion-type-5.png"

interface Props {
  onBack: () => void
  onConfirm: (minionType: number) => void
}

export default function MinionTypePage({ onConfirm }: Props) {
  const minionTypes = [type1, type2, type3, type4, type5]

  const [currentIndex, setCurrentIndex] = useState(0)
    useState<"left" | "right" | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [shake, setShake] = useState(false)

  const triggerChange = (newIndex: number) => {
    setIsAnimating(true)
    setShake(true)
    setCurrentIndex(newIndex)

    setTimeout(() => {
      setIsAnimating(false)
      setShake(false)
    }, 300)
  }

  const handleNext = () => {
    if (isAnimating) return
    const next = (currentIndex + 1) % minionTypes.length
    triggerChange(next)
  }

  const handlePrev = () => {
    if (isAnimating) return
    const prev =
      (currentIndex - 1 + minionTypes.length) % minionTypes.length
    triggerChange(prev)
  }

  // ✅ ยิง backend ก่อน confirm
  const handleConfirm = async () => {
    try {
      const selectedType = currentIndex + 1

      await setMinionTypeCount(selectedType)

      // ถ้าสำเร็จ ค่อยไปหน้าถัดไป
      onConfirm(selectedType)
    } catch (error) {
      console.error("Failed to set minion type count", error)
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
            25%  { transform: translate(-1px, 1px); }
            50%  { transform: translate(1px, -1px); }
            75%  { transform: translate(-1px, 0px); }
            100% { transform: translate(0px, 0px); }
          }

          .animate-shake {
            animation: shake-soft 0.2s ease-in-out;
          }
        `}
      </style>

      {/* Background */}
      <img
        src={bg}
        alt="background"
        draggable={false}
        className="
          absolute inset-0
          w-full h-full
          object-cover
          select-none
          pointer-events-none
        "
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
            mt-6 mb-5
          "
        >
          SELECT MINION TYPE
        </h1>

        {/* Selector */}
        <div className="relative flex items-center justify-center">
          {/* Left Arrow */}
          <ArrowButton
            direction="left"
            onClick={handlePrev}
            className="
              absolute -left-28 md:-left-36
              transition-all duration-150
              hover:scale-105
            "
          />

          {/* Minion Image */}
          <img
            key={currentIndex}
            src={minionTypes[currentIndex]}
            alt={`minion-type-${currentIndex + 1}`}
            draggable={false}
            className={`
              w-[380px] md:w-[500px] lg:w-[500px]
              rounded-xl select-none
              transition-all duration-300
              ${
                isAnimating
                  ? "scale-110 opacity-0 blur-sm"
                  : "scale-100 opacity-100 blur-0"
              }
            `}
          />

          {/* Flash Effect */}
          {isAnimating && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="
                  w-[60%] aspect-square rounded-full animate-ping
                  bg-[radial-gradient(circle,_rgba(255,0,0,0.6)_0%,_rgba(255,0,0,0.3)_40%,_transparent_70%)]
                "
              />
            </div>
          )}

          {/* Right Arrow */}
          <ArrowButton
            direction="right"
            onClick={handleNext}
            className="
              absolute -right-28 md:-right-36
              transition-all duration-150
              hover:scale-105
            "
          />
        </div>

        {/* Counter */}
        <div className="mt-6 text-white text-lg tracking-wide">
          Minion Type {currentIndex + 1} / {minionTypes.length}
        </div>

        {/* Confirm */}
        <div className="mt-8">
          <ConfirmButton onClick={handleConfirm} />
        </div>
      </div>
    </div>
  )
}