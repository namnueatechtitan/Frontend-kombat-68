import type { MinionData } from "../types/MinionData"

interface PlayerTheme {
  border: string
  glow: string
  heading: string
}

interface Props {
  open: boolean
  playerTheme: PlayerTheme
  currentPlayerCharacter: "HUMAN" | "DEMON"
  selectableMinions: MinionData[]
  onClose: () => void
  onSelectMinion: (type: string) => void
}

export default function SpawnMinionSelectionModal({
  open,
  playerTheme,
  currentPlayerCharacter,
  selectableMinions,
  onClose,
  onSelectMinion,
}: Props) {
  if (!open) return null

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-lg" />

      <div
        className={`relative z-10 w-full max-w-[1280px] rounded-[28px] border ${playerTheme.border} ${playerTheme.glow} p-6 lg:p-8`}
        style={{
          backgroundImage:
            "radial-gradient(circle at top left, rgba(255,255,255,0.14), transparent 45%), linear-gradient(135deg, rgba(12,18,33,0.97), rgba(6,8,16,0.98)), repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 4px)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-2xl font-black tracking-[0.12em] ${playerTheme.heading}`}>
            SELECT {currentPlayerCharacter} MINION
          </h3>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white transition"
          >
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
          {selectableMinions.map((minion) => (
            <button
              key={minion.type}
              onClick={() => onSelectMinion(minion.type)}
              className="group relative h-[360px] rounded-[30px] overflow-hidden border border-white/20 hover:border-white/50 transition text-left"
            >
              <img
                src={minion.preview}
                alt={minion.type}
                className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
              <div className="relative z-10 h-full flex flex-col justify-between p-4">
                <div>
                  <p className="text-2xl font-black tracking-[0.2em] text-white">
                    {minion.type}
                  </p>
                  <p className="text-xs tracking-[0.2em] text-white/70 mt-1">{minion.name}</p>
                </div>
                <div>
                  <span className="inline-flex px-5 py-2 rounded-full bg-blue-500/90 text-white font-bold tracking-[0.15em] text-sm">
                    Select
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
