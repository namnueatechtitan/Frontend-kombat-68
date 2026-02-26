import { useEffect, useState } from "react"
import bg from "../assets/images/start.png"
import logo from "../assets/images/logo.png"
import GameButton from "../components/GameButton"

interface Props {
  onConfig: () => void
  onStart: () => void
}

export default function StartPage({ onConfig, onStart }: Props) {

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
    fetch("/api/game/config")
      .then(async (res) => {
        if (!res.ok) throw new Error("Request failed")
        const text = await res.text()
        return text ? JSON.parse(text) : null
      })
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
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center">

        <img
          src={logo}
          alt="logo"
          className="mt-[100px] w-[500px] drop-shadow-[0_0_25px_rgba(0,0,0,0.8)]"
          draggable={false}
        />

        <div className="flex-1" />

        <div className="mb-[180px] flex flex-col gap-6 items-center">
          <GameButton
            label="Start"
            color="orange"
            onClick={onStart}
          />

          <GameButton
            label="Config"
            color="green"
            onClick={onConfig}
          />
        </div>

      </div>
    </div>
  )
}