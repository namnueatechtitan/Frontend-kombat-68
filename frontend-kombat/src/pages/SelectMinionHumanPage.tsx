import { useState } from "react"
import ConfirmButton from "../components/ConfirmButton"
import { addMinion } from "../api/gameApi"

import bg from "../assets/images/background-config.png"
import logo from "../assets/images/logo.png"
import boardSelectMinion from "../assets/images/boardselectminion.png"

import fighterImg from "../assets/images/minions/Human/fighterhuman.png"
import tankImg from "../assets/images/minions/Human/tankhuman.png"
import dpsImg from "../assets/images/minions/Human/dpshuman.png"
import assassinImg from "../assets/images/minions/Human/assassinhuman.png"
import supportImg from "../assets/images/minions/Human/supporthuman.png"

import fighterPreview from "../assets/images/minions/Human/human_fighter_preview.png"
import tankPreview from "../assets/images/minions/Human/human_tank_preview.png"
import dpsPreview from "../assets/images/minions/Human/human_dps_preview.png"
import assassinPreview from "../assets/images/minions/Human/human_assassin_preview.png"
import supportPreview from "../assets/images/minions/Human/human_support_preview.png"

/* =======================
   TYPE ที่จะส่งไปหน้า Strategy
======================= */
export interface MinionData {
  type: "FIGHTER" | "ASSASSIN" | "DPS" | "TANK" | "SUPPORT"
  name: string
  image: string
  preview: string
}

interface Props {
  onBack: () => void
  onConfirm: (minion: MinionData) => void
}

export default function SelectMinionHumanPage({
  onBack,
  onConfirm,
}: Props) {
  const [selectedMinion, setSelectedMinion] =
    useState<MinionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  /* =======================
     DATA MINION ทั้งหมด
  ======================= */
  const minions: MinionData[] = [
    {
      type: "FIGHTER",
      name: "Fighter",
      image: fighterImg,
      preview: fighterPreview,
    },
    {
      type: "ASSASSIN",
      name: "Assassin",
      image: assassinImg,
      preview: assassinPreview,
    },
    {
      type: "DPS",
      name: "DPS",
      image: dpsImg,
      preview: dpsPreview,
    },
    {
      type: "TANK",
      name: "Tank",
      image: tankImg,
      preview: tankPreview,
    },
    {
      type: "SUPPORT",
      name: "Support",
      image: supportImg,
      preview: supportPreview,
    },
  ]

  /* =======================
     Confirm Logic
  ======================= */
  async function handleConfirmClick() {
    if (!selectedMinion) return

    try {
      setLoading(true)
      setError("")

      // ยิง API ตาม type
      await addMinion(selectedMinion.type)

      // ส่ง object ทั้งก้อน ไปหน้า Strategy
      onConfirm(selectedMinion)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full min-h-screen">

      {/* ===== Background ===== */}
      <img
        src={bg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 w-full h-full">

        {/* ===== Header ===== */}
        <div className="pt-10 flex justify-center">
          <div className="flex items-center gap-6">
            <img src={logo} alt="logo" className="w-[90px]" draggable={false} />
            <h1 className="text-5xl font-extrabold tracking-wide bg-[linear-gradient(90deg,#FFD54F,#FF9800)] bg-clip-text text-transparent">
              Select Minion
            </h1>
          </div>
        </div>

        {/* ===== Board ===== */}
        <div className="flex justify-center mt-4">
          <div className="relative w-[80%] max-w-[1400px]">

            <img
              src={boardSelectMinion}
              alt="board"
              className="w-full h-auto select-none pointer-events-none"
              draggable={false}
            />

            <div className="absolute inset-0 flex flex-col">

              {/* Top Info Bar */}
              <div className="flex justify-between px-16 pt-8 text-white text-sm tracking-widest">
                <span>Step 0/5 - Choose Minion Appearance</span>
                <span>Created Minion Types: 0/5</span>
              </div>

              {/* ===== Minion Cards ===== */}
              <div className="flex justify-center gap-10 mt-8">
                {minions.map((minion) => {
                  const isSelected =
                    selectedMinion?.type === minion.type

                  return (
                    <div key={minion.type}>
                      <div
                        onClick={() => setSelectedMinion(minion)}
                        className={`
                          relative w-[230px] h-[350px] rounded-3xl overflow-hidden
                          transition-all duration-300 cursor-pointer
                          ${
                            isSelected
                              ? "scale-105 ring-4 ring-yellow-400"
                              : "hover:scale-105 hover:-translate-y-2"
                          }
                        `}
                      >
                        <img
                          src={minion.image}
                          alt={minion.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          draggable={false}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                        <div className="absolute top-6 left-6 flex flex-col items-start gap-3 z-10">
                          <h2 className="text-white text-xl tracking-[0.1em] font-semibold">
                            {minion.type}
                          </h2>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedMinion(minion)
                            }}
                            className={`
                              px-2 py-0.5 text-sm rounded-full text-white tracking-widest
                              transition-all duration-200
                              ${
                                isSelected
                                  ? "bg-yellow-500 shadow-lg scale-105"
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

              {/* ===== Preview Section ===== */}
              {selectedMinion && (
                <div className="mt-auto mb-8 flex justify-center">
                  <img
                    src={selectedMinion.preview}
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

      {/* ===== Footer Buttons ===== */}
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
            disabled={!selectedMinion || loading}
          />
        </div>
      </div>

      {/* ===== Error ===== */}
      {error && (
        <div className="fixed bottom-2 left-0 right-0 text-center text-red-500 font-semibold">
          {error}
        </div>
      )}
    </div>
  )
}