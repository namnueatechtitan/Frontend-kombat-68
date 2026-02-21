import board from "../assets/images/board-config.png"

interface Props {
  children: React.ReactNode
}

export default function ConfigBoard({ children }: Props) {
  return (
    <div className="relative w-[750px] h-[500px] flex items-center justify-center mb-8">

      {/* Board Image */}
      <img
        src={board}
        alt="config board"
        className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
        draggable={false}
      />

      {/* Content */}
      <div className="relative z-10 px-12 text-center">
        {children}
      </div>

    </div>
  )
}
