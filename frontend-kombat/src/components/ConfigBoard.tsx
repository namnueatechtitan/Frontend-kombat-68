import board from "../assets/images/board-config.png"

interface Props {
  children: React.ReactNode
}

export default function ConfigBoard({ children }: Props) {
  return (
    <div className="relative w-full flex justify-center">

      {/* Board Image */}
      <img
        src={board}
        alt="config board"
        className="absolute inset-0 w-full h-full object-fill select-none pointer-events-none"
        draggable={false}
      />

      {/* Content */}
      <div
        className="
          relative z-10
          w-[80%]
          text-center
          px-6 md:px-10
          py-10 md:py-14
          text-sm md:text-lg
        "
      >
        {children}
      </div>

    </div>
  )
}