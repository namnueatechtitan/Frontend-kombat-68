import { useEffect } from "react"
import bg from "../assets/images/start.png"
import logo from "../assets/images/logo.png"
import GameButton from "../components/GameButton"

interface Props {
  onConfig: () => void
  onStart: () => void
}

export default function StartPage({ onConfig, onStart }: Props) {

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
    .catch((err) => {
      console.warn("Config not available yet")
      console.warn(err)
    })
}, [])
  return (
    <div className="relative w-full h-full overflow-hidden">

      <img
        src={bg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 w-full h-full flex flex-col items-center">

        <img
          src={logo}
          alt="logo"
          className="mt-[120px] w-[500px]"
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