import { useState } from "react"
import ConfirmButton from "../components/ConfirmButton"
import bg from "../assets/images/background-config.png"
import logo from "../assets/images/logo.png"
import boardSelectMinion from "../assets/images/boardselectminion.png"
import BackButton from "../components/BackButton"
import fighterImg from "../assets/images/minions/Human/fighterhuman.png"
import tankImg from "../assets/images/minions/Human/tankhuman.png"
import dpsImg from "../assets/images/minions/Human/dpshuman.png"
import assassinImg from "../assets/images/minions/Human/assassinhuman.png"
import supportImg from "../assets/images/minions/Human/supporthuman.png"
import finalOverlayImg from "../assets/images/finalOverlayBoard.png"
import { humanMinions } from "../data/humanMinions"
import fighterPreview from "../assets/images/minions/Human/human_fighter_preview.png"
import tankPreview from "../assets/images/minions/Human/human_tank_preview.png"
import dpsPreview from "../assets/images/minions/Human/human_dps_preview.png"
import assassinPreview from "../assets/images/minions/Human/human_assassin_preview.png"
import supportPreview from "../assets/images/minions/Human/human_support_preview.png"

import type { MinionData, MinionType } from "../types/MinionData"

interface ConfiguredMinion extends MinionData {
  strategy: string
  defenseFactor: number
}

interface Props {
  minionTypeCount: number
  minions: ConfiguredMinion[]
  onBack: () => void
  onSelect: (minion: ConfiguredMinion | MinionData) => void
  onRemove: (type: MinionType) => void
  onNext: () => void
}

export default function SelectMinionHumanPage({
  minionTypeCount,
  minions,
  onBack,
  onSelect,
  onRemove,
  onNext,
}: Props) {
  const [selectedMinion, setSelectedMinion] =
    useState<MinionType | null>(null)

  const [isFinalConfirmOpen, setIsFinalConfirmOpen] =
    useState(false)

  const createdCount = minions.length
  const isLimitReached =
    minionTypeCount > 0 && createdCount >= minionTypeCount

  const isConfigured = (type: MinionType) =>
    minions.some((m) => m.type === type)

  const minionList = [
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
  if (!selectedMinion) return

  const minionData = humanMinions.find(
    (m) => m.type === selectedMinion
  )

  if (!minionData) return

  onSelect(minionData)
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
              Select Minion Human Type
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
                  Step {createdCount}/{minionTypeCount}
                </span>
                <span>
                  Created Minion Types: {createdCount}/{minionTypeCount}
                </span>
              </div>

              <div className="flex justify-center gap-10 mt-8">
                {minionList.map((minion) => {
                  const configured = isConfigured(minion.key)
                  const isSelected = selectedMinion === minion.key
                  const selectedColor = colorMap[minion.key]

                  return (
                    <div key={minion.key}>
                      <div
                        onClick={() => {
                          if (!configured && !isLimitReached) {
                            setSelectedMinion(minion.key)
                          }
                        }}
                        style={
                          configured || isSelected
                            ? {
                                boxShadow: `0 0 40px ${selectedColor}`,
                                border: `3px solid ${selectedColor}`,
                              }
                            : {}
                        }
                        className={`relative w-[230px] h-[350px] rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer ${
                          configured || isSelected
                            ? "scale-105"
                            : "hover:scale-105 hover:-translate-y-2"
                        } ${
                          isLimitReached && !configured
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }`}
                      >
                        <img
                          src={minion.image}
                          alt={minion.key}
                          className="absolute inset-0 w-full h-full object-cover"
                          draggable={false}
                        />

                        <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
                          <h2 className="text-white text-xl font-semibold">
                            {minion.key}
                          </h2>
                          {!configured && (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation()
      if (!isLimitReached)
        setSelectedMinion(minion.key)
    }}
    style={{
      backgroundColor:
        isSelected ? colorMap[minion.key] : "#3B82F6",
      boxShadow: isSelected
        ? `0 0 12px ${colorMap[minion.key]}`
        : "none",
    }}
    className="
      w-28
      h-8
      flex
      items-center
      justify-center
      text-sm
      rounded-full
      text-white
      transition-all
      duration-300
    "
  >
    Select
  </button>
)}

                      
                          {configured && (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const existing = minions.find(
                                    (m) => m.type === minion.key
                                  )
                                  if (existing) onSelect(existing)
                                }}
                                className="px-2 py-1 text-sm rounded-full bg-blue-500 text-white"
                              >
                                Edit
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onRemove(minion.key)
                                }}
                                style={{
                                  backgroundColor: selectedColor,
                                }}
                                className="px-3 py-1 text-sm rounded-full text-white"
                              >
                                Remove
                              </button>
                            </div>
                          )}
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
                    alt="preview"
                    className="w-[650px] object-contain"
                    draggable={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center gap-16">
        <BackButton onClick={() => setSelectedMinion(null)} />

        {!isLimitReached ? (
          <ConfirmButton
            onClick={handleConfirmClick}
            disabled={!selectedMinion}
          />
        ) : (
          <button
            onClick={() => setIsFinalConfirmOpen(true)}
            className="px-10 py-3 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white"
          >
            Final Confirm
          </button>
        )}
      </div>

      {isFinalConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <div className="relative z-10">
            <img
              src={finalOverlayImg}
              alt="overlay"
              className="w-[900px] max-w-[95%]"
              draggable={false}
            />

            <div className="absolute bottom-[80px] w-full flex justify-center gap-20">
              <button
                onClick={() => setIsFinalConfirmOpen(false)}
                className="px-14 py-3 rounded-full bg-blue-500 text-white"
              >
                Edit
              </button>

              <button
                onClick={onNext}
                className="px-14 py-3 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white"
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