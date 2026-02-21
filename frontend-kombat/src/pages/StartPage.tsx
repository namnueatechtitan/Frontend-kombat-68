import bg from "../assets/images/start.png"
import logo from "../assets/images/logo.png"
import GameButton from "../components/GameButton"

interface Props {
  onConfig: () => void
}

export default function StartPage({ onConfig }: Props) {
  return (
    <div className="relative w-full h-full overflow-hidden">

      <img
        src={bg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />

      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      <div className="relative z-10 w-full h-full flex flex-col items-center">

        <img
          src={logo}
          alt="logo"
          className="mt-[120px] w-[500px] select-none"
          draggable={false}
        />

        <div className="flex-1" />

        <div className="mb-[180px] flex flex-col gap-6 items-center">
          <GameButton label="Start" color="orange" />
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
