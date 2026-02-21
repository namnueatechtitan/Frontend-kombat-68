import ConfirmButton from "../components/ConfirmButton"
import ConfigBoard from "../components/ConfigBoard"
import bg from "../assets/images/background-config.png"

interface Props {
  onBack: () => void
}

export default function ConfigPage({ onBack }: Props) {
  return (
    <div className="relative w-full h-full overflow-hidden">

      {/* Background Image */}
      <img
        src={bg}
        alt="config background"
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-8 left-8 text-yellow-400 text-xl font-bold"
        >
          ← Back
        </button>

        {/* Title */}
        <h1 className="text-4xl font-bold text-yellow-400 tracking-widest mb-10">
          CONFIG
        </h1>

        {/* Board */}
        <ConfigBoard>
          <div className="text-yellow-400 text-xl space-y-2 font-medium">
            <p>spawn_cost = 100</p>
            <p>hex_purchase_cost = 1000</p>
            <p>init_budget = 10000</p>
            <p>init_hp = 100</p>
            <p>turn_budget = 90</p>
            <p>max_budget = 23456</p>
            <p>interest_pct = 5</p>
            <p>max_turns = 69</p>
            <p>max_spawns = 47</p>
          </div>
        </ConfigBoard>

        {/* Confirm Button */}
        <ConfirmButton />

      </div>
    </div>
  )
}
