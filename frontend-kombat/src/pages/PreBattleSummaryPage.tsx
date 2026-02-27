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
      if (!res.ok) throw new Error(await res.text())
      onConfirm()
    } catch {
      alert("Failed to start game")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white text-2xl bg-black">
        Loading...
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 text-xl bg-black">
        {error}
      </div>
    )
  }

  const { mode, config, players } = data
  const player1 = players?.player1
  const player2 = players?.player2

  return (
    <div className="relative w-full min-h-screen flex flex-col">

      {/* Background */}
      <img
        src={bg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center pt-6 px-4 pb-28 flex-1 overflow-y-auto">

        {/* Logo */}
        <img
          src={logo}
          alt="logo"
          className="w-[120px] md:w-[160px]"
          draggable={false}
        />

        {/* Title */}
        <h1
          className="text-4xl md:text-5xl font-extrabold tracking-widest
                     bg-[radial-gradient(circle,#FFFFFF_0%,#FFB300_60%,#FFB300_100%)]
                     bg-clip-text text-transparent
                     drop-shadow-[0_0_12px_rgba(255,179,0,0.6)]
                     mt-4 mb-8"
        >
          PRE-BATTLE
        </h1>

        {/* Board */}
        <div className="w-full max-w-[1100px]">
          <ConfigBoard>
            <div className="text-base md:text-lg font-medium space-y-10">

              {/* Game Mode */}
              <div className="text-center">
                <h2 className="text-white text-xl font-semibold mb-2">
                  Game Mode
                </h2>
                <p className="text-yellow-400">Mode: {mode}</p>
              </div>

              {/* Players */}
              <div className="grid md:grid-cols-2 gap-10">

                {/* PLAYER 1 */}
                <div>
                  <h2 className="text-white text-xl font-semibold mb-4 text-center">
                    PLAYER 1 ({player1?.character})
                  </h2>

                  <div className="custom-scroll h-[100px] overflow-y-auto snap-y snap-mandatory scroll-smooth">
                    {player1?.definedMinions?.map((m: any, i: number) => (
                      <div
                        key={i}
                        className="snap-start h-[100px] flex flex-col justify-center items-center
                                   bg-black/40 border border-yellow-500/30 rounded-xl"
                      >
                        <p className="text-yellow-300 text-lg font-bold">
                          {m.kindName}
                        </p>
                        <p className="text-white">DEF {m.defenseFactor}</p>
                        <p className="text-white">
                          Strategy Length: {m.rawStrategy?.length}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PLAYER 2 */}
                <div>
                  <h2 className="text-white text-xl font-semibold mb-4 text-center">
                    PLAYER 2 ({player2?.character})
                  </h2>

                  <div className="custom-scroll h-[100px] overflow-y-auto snap-y snap-mandatory scroll-smooth">
                    {player2?.definedMinions?.map((m: any, i: number) => (
                      <div
                        key={i}
                        className="snap-start h-[100px] flex flex-col justify-center items-center
                                   bg-black/40 border border-yellow-500/30 rounded-xl"
                      >
                        <p className="text-yellow-300 text-lg font-bold">
                          {m.kindName}
                        </p>
                        <p className="text-white">DEF {m.defenseFactor}</p>
                        <p className="text-white">
                          Strategy Length: {m.rawStrategy?.length}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Economy Rules */}
              <div>
                <h2 className="text-white text-xl font-semibold mb-6 text-center">
                  Economy Rules
                </h2>

                <div className="max-w-[800px] mx-auto grid grid-cols-2 gap-x-32 text-xl">

                  <div className="space-y-3">
                    <p className="text-white">
                      Initial Budget:{" "}
                      <span className="text-yellow-400 font-mono">
                        {config.initBudget}
                      </span>
                    </p>

                    <p className="text-white">
                      Turn Budget:{" "}
                      <span className="text-yellow-400 font-mono">
                        {config.turnBudget}
                      </span>
                    </p>

                    <p className="text-white">
                      Spawn Cost:{" "}
                      <span className="text-yellow-400 font-mono">
                        {config.spawnCost}
                      </span>
                    </p>

                    <p className="text-white">
                      Hex Cost:{" "}
                      <span className="text-yellow-400 font-mono">
                        {config.hexPurchaseCost}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-white">
                      Max Budget:{" "}
                      <span className="text-yellow-400 font-mono">
                        {config.maxBudget}
                      </span>
                    </p>

                    <p className="text-white">
                      Max Turns:{" "}
                      <span className="text-yellow-400 font-mono">
                        {config.maxTurns}
                      </span>
                    </p>

                    <p className="text-white">
                      Max Spawns:{" "}
                      <span className="text-yellow-400 font-mono">
                        {config.maxSpawns}
                      </span>
                    </p>

                    <p className="text-white">
                      Interest:{" "}
                      <span className="text-yellow-400 font-mono">
                        {config.interestPct}%
                      </span>
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </ConfigBoard>
        </div>

      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-10 left-0 right-0 z-20 py-6 flex justify-center gap-10 backdrop-blur-md">
        <BackButton onClick={onBack} />
        <ConfirmButton onClick={handleConfirm} />
      </div>

    </div>
  )
}