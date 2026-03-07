import { useEffect, useState } from "react"
import bg from "../assets/images/Start.png"
import logo from "../assets/images/logo.png"
import GameButton from "../components/GameButton"
import { getConfig } from "../api/gameApi"

interface Props {
  onConfig: () => void
  onStart: () => void
  onLobby: () => void
}

export default function StartPage({ onConfig, onStart, onLobby }: Props) {

  // ---------------- Mouse Parallax ----------------
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      setOffset({ x, y })
    }

    window.addEventListener("mousemove", handleMove)
    return () => window.removeEventListener("mousemove", handleMove)
  }, [])

  // ---------------- Config preload ----------------
  useEffect(() => {
    getConfig()
      .then((data) => {
        console.log("CONFIG:", data)
      })
      .catch(() => {
        console.warn("Config not available yet")
      })
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden">

      {/* Background Layer (Drift + Parallax) */}
      <div
        className="absolute inset-0 animate-drift will-change-transform"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`
        }}
      >
        <img
          src={bg}
          alt="background"
          className="w-full h-full object-cover animate-cinematic"
          draggable={false}
        />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.34),rgba(0,0,0,0.62))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_58%,rgba(255,145,0,0.18),transparent_22%),radial-gradient(circle_at_50%_78%,rgba(255,110,0,0.12),transparent_26%),radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.04),transparent_18%)]" />
      <div className="pointer-events-none absolute inset-x-[24%] bottom-[145px] h-[240px] bg-[radial-gradient(circle,rgba(255,132,0,0.24),rgba(255,132,0,0.08)_36%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-[31%] bottom-[126px] h-[120px] bg-[linear-gradient(90deg,transparent,rgba(255,214,130,0.16),transparent)] blur-2xl" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { left: "28%", bottom: "182px", delay: "0s", duration: "3.8s" },
          { left: "36%", bottom: "136px", delay: "0.9s", duration: "4.2s" },
          { left: "49%", bottom: "172px", delay: "1.8s", duration: "3.4s" },
          { left: "59%", bottom: "150px", delay: "0.5s", duration: "4.1s" },
          { left: "68%", bottom: "184px", delay: "1.4s", duration: "3.6s" },
          { left: "63%", bottom: "112px", delay: "2.1s", duration: "4.4s" },
        ].map((spark, index) => (
          <span
            key={index}
            className="animate-menu-spark absolute h-2 w-2 rounded-full bg-[#ffb347] shadow-[0_0_12px_rgba(255,166,71,0.75)]"
            style={{
              left: spark.left,
              bottom: spark.bottom,
              animationDelay: spark.delay,
              animationDuration: spark.duration,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col items-center">

        <img
          src={logo}
          alt="logo"
          className="mt-[88px] w-[500px] drop-shadow-[0_0_25px_rgba(0,0,0,0.8)]"
          draggable={false}
        />

        <div className="mt-5 text-center">
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.52em]"
            style={{ color: "#ffffff", textShadow: "0 1px 6px rgba(0,0,0,0.35)" }}
          >
            Select Combat Interface
          </div>
          <div className="mt-3 h-px w-[280px] bg-[linear-gradient(90deg,transparent,rgba(255,194,92,0.8),transparent)]" />
        </div>

        <div className="flex-1" />

        <div className="mb-[150px] flex flex-col items-center gap-5">
          <GameButton
            label="Start"
            color="orange"
            onClick={onStart}
            enableClickSfx
            enableHoverSfx
          />

          <GameButton
            label="Lobby"
            color="blue"
            onClick={onLobby}
            enableClickSfx
            enableHoverSfx
          />

          <GameButton
            label="Config"
            color="green"
            onClick={onConfig}
            enableClickSfx
            enableHoverSfx
          />
        </div>

      </div>
    </div>
  )
}
