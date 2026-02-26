import { useState } from "react"
import ConfirmButton from "../components/ConfirmButton"

import bg from "../assets/images/background-config.png"
import logo from "../assets/images/logo.png"
import boardSelectMinion from "../assets/images/boardselectminion.png"

import fighterImg from "../assets/images/minions/Human/fighterhuman.png"
import tankImg from "../assets/images/minions/Human/tankhuman.png"
import dpsImg from "../assets/images/minions/Human/dpshuman.png"
import assassinImg from "../assets/images/minions/Human/assassinhuman.png"
import supportImg from "../assets/images/minions/Human/supporthuman.png"
import finalOverlayImg from "../assets/images/finalOverlayBoard.png"
import fighterPreview from "../assets/images/minions/Human/human_fighter_preview.png"
import tankPreview from "../assets/images/minions/Human/human_tank_preview.png"
import dpsPreview from "../assets/images/minions/Human/human_dps_preview.png"
import assassinPreview from "../assets/images/minions/Human/human_assassin_preview.png"
import supportPreview from "../assets/images/minions/Human/human_support_preview.png"

import type { MinionData, MinionType } from "../types/MinionData"

interface Props {
  minionTypeCount: number
  createdCount: number
  onBack: () => void
  onConfirm: (minion: MinionData) => void
  onNext: () => void 
}

export default function SelectMinionHumanPage({
  minionTypeCount,
  createdCount,
  onBack,
  onConfirm,
  onNext,
}: Props) {

  const [selectedMinion, setSelectedMinion] =
    useState<MinionType | null>(null)

  const isLimitReached = createdCount >= minionTypeCount
  const showFinalPanel =
    createdCount >= minionTypeCount && minionTypeCount > 0

  const minions = [
    { key: "FIGHTER" as MinionType, image: fighterImg },
    { key: "ASSASSIN" as MinionType, image: assassinImg },
    { key: "DPS" as MinionType, image: dpsImg },
    { key: "TANK" as MinionType, image: tankImg },
    { key: "SUPPORT" as MinionType, image: supportImg },
  ]

  const colorMap: Record<MinionType, string> = {
    FIGHTER: "#195A45",
    ASSASSIN: "#6A2834",
    DPS: "#031A54",
    TANK: "#D42828",
    SUPPORT: "#745531",
  }

  const previewMap: Record<MinionType, string> = {
    FIGHTER: fighterPreview,
    ASSASSIN: assassinPreview,
    DPS: dpsPreview,
    TANK: tankPreview,
    SUPPORT: supportPreview,
  }

  function handleConfirmClick() {
    if (!selectedMinion || isLimitReached) return

    const minionData: MinionData = {
      type: selectedMinion,
      name: selectedMinion,
      image: minions.find(m => m.key === selectedMinion)!.image,
      preview: previewMap[selectedMinion],
    }

    onConfirm(minionData)
    setSelectedMinion(null)
  }

  return (
    <div className="relative w-full min-h-screen">

      <img
        src={bg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 w-full h-full">

        <div className="pt-10 flex justify-center">
          <div className="flex items-center gap-6">
            <img src={logo} alt="logo" className="w-[90px]" draggable={false} />
            <h1 className="text-5xl font-extrabold tracking-wide bg-[linear-gradient(90deg,#FFD54F,#FF9800)] bg-clip-text text-transparent">
              Select Minion
            </h1>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <div className="relative w-[80%] max-w-[1400px]">

            <img
              src={boardSelectMinion}
              alt="board"
              className="w-full h-auto select-none pointer-events-none"
              draggable={false}
            />

            <div className="absolute inset-0 flex flex-col">

              <div className="flex justify-between px-16 pt-8 text-white text-sm tracking-widest">
                <span>
                  Step {createdCount}/{minionTypeCount} - Choose Minion Appearance
                </span>
                <span>
                  Created Minion Types: {createdCount}/{minionTypeCount}
                </span>
              </div>

              <div className="flex justify-center gap-10 mt-8">
                {minions.map((minion) => {
                  const isSelected = selectedMinion === minion.key
                  const selectedColor = colorMap[minion.key]

                  return (
                    <div key={minion.key}>
                      <div
                        onClick={() =>
                          !isLimitReached &&
                          setSelectedMinion(minion.key)
                        }
                        style={
                          isSelected
                            ? {
                                boxShadow: `0 0 40px ${selectedColor}`,
                                border: `3px solid ${selectedColor}`,
                              }
                            : {}
                        }
                        className={`
                          relative w-[230px] h-[350px] rounded-3xl overflow-hidden
                          transition-all duration-300 cursor-pointer
                          ${
                            isSelected
                              ? "scale-105"
                              : "hover:scale-105 hover:-translate-y-2"
                          }
                          ${isLimitReached ? "opacity-50 pointer-events-none" : ""}
                        `}
                      >
                        <img
                          src={minion.image}
                          alt={minion.key}
                          className="absolute inset-0 w-full h-full object-cover"
                          draggable={false}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                        <div className="absolute top-6 left-6 flex flex-col items-start gap-3 z-10">
                          <h2 className="text-white text-xl tracking-[0.1em] font-semibold">
                            {minion.key}
                          </h2>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!isLimitReached)
                                setSelectedMinion(minion.key)
                            }}
                            style={{
                              backgroundColor: isSelected
                                ? selectedColor
                                : undefined,
                            }}
                            className={`
                              px-2 py-0.5 text-sm rounded-full text-white tracking-widest
                              transition-all duration-200
                              ${
                                isSelected
                                  ? "shadow-lg scale-105"
                                  : "bg-blue-500 hover:bg-blue-600"
                              }
                            `}
                          >
                            {isSelected ? "Selected" : "Select"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {selectedMinion && !isLimitReached && (
                <div className="mt-auto mb-8 flex justify-center">
                  <img
                    src={previewMap[selectedMinion]}
                    alt="selected-preview"
                    className="w-[650px] h-auto object-contain transition-all duration-300"
                    draggable={false}
                  />
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* Bottom Buttons */}
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
            onClick={handleConfirmClick}
            disabled={!selectedMinion || isLimitReached}
          />
        </div>
      </div>{/* Final Overlay */}
{showFinalPanel && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    
    {/* Dark Background */}
    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

    {/* Image Container */}
    <div className="relative z-10 flex items-center justify-center">

      <img
        src={finalOverlayImg}
        alt="final-overlay"
        className="w-[900px] max-w-[95%] h-auto select-none pointer-events-none"
        draggable={false}
      />

      {/* Buttons positioned on image */}
      <div className="absolute bottom-[80px] w-full flex justify-center gap-20">

        <button
          onClick={onBack}
          className="px-14 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold tracking-wide transition-all"
        >
          Edit
        </button>

        <button
          onClick={onNext}
          className="px-14 py-3 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-semibold tracking-wide hover:scale-105 transition-all"
        >
          Confirm
        </button>

      </div>
    </div>
  </div>
)}

    </div>
  )
}