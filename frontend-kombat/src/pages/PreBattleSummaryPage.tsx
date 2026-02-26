import { useEffect, useState } from "react"
import ConfirmButton from "../components/ConfirmButton"
import BackButton from "../components/BackButton"
import ConfigBoard from "../components/ConfigBoard"

import bg from "../assets/images/background-config.png"
import logo from "../assets/images/logo.png"

interface Props {
  onBack: () => void
  onConfirm: () => void
}

export default function PreBattlePage({ onBack, onConfirm }: Props) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("http://localhost:8080/api/game/setup")
      .then(res => res.json())
      .then(setData)
      .catch(() => setError("Failed to load setup"))
      .finally(() => setLoading(false))
  }, [])

  async function handleConfirm() {
    try {
      const res = await fetch("http://localhost:8080/api/game/start", {
        method: "POST"
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      onConfirm()
    } catch {
      alert("Failed to start game")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-2xl">
        Loading...
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-xl">
        {error}
      </div>
    )
  }

  const { mode, character, config, definedMinions } = data

  return (
    <div className="relative w-full h-full overflow-hidden">

      {/* Background */}
      <img
        src={bg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />

      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      <div className="relative z-10 w-full h-full flex flex-col items-center">

        {/* Logo */}
        <img
          src={logo}
          alt="logo"
          className="mt-[10px] w-[120px] md:w-[160px] select-none"
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
            mt-5 mb-4
          "
        >
          PRE-BATTLE
        </h1>

        {/* Summary Board */}
        <div className="w-[95%] max-w-[750px]">
          <ConfigBoard>
            <div className="text-yellow-400 text-base md:text-xl space-y-6 font-medium text-center">

              {/* Game Mode */}
              <div>
                <h2 className="text-white text-xl font-semibold mb-2 drop-shadow-[0_0_6px_rgba(255,180,0,0.8)]">
                  Game Mode
                </h2>
                <p>Mode: {mode}</p>
                <p>Character: {character}</p>
              </div>

              {/* Minion Kinds */}
              <div>
                <h2 className="text-white text-xl font-semibold mb-2 drop-shadow-[0_0_6px_rgba(255,180,0,0.8)]">
                  Minion Kinds
                </h2>
                {definedMinions.map((m: any, i: number) => (
                  <p key={i}>
                    {m.kindName} | DEF {m.defenseFactor} | Strategy Length: {m.rawStrategy.length}
                  </p>
                ))}
              </div>

              {/* Economy */}
              <div>
                <h2 className="text-white text-xl font-semibold mb-3 drop-shadow-[0_0_6px_rgba(255,180,0,0.8)]">
                  Economy Rules
                </h2>

                <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-left">
                  <p>Initial Budget: {config.initBudget}</p>
                  <p>Turn Budget: {config.turnBudget}</p>
                  <p>Spawn Cost: {config.spawnCost}</p>
                  <p>Hex Cost: {config.hexPurchaseCost}</p>
                  <p>Max Budget: {config.maxBudget}</p>
                  <p>Max Turns: {config.maxTurns}</p>
                  <p>Max Spawns: {config.maxSpawns}</p>
                  <p>Interest %: {config.interestPct}</p>
                </div>
              </div>

            </div>
          </ConfigBoard>
        </div>

        {/* Buttons */}
        <div className="mt-6 mb-10 flex gap-10">
          <BackButton onClick={onBack} />
          <ConfirmButton onClick={handleConfirm} />
        </div>

      </div>
    </div>
  )
}