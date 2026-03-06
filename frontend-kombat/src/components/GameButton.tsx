import { playClickSfx } from "../utils/sfx"

interface Props {
  label: string
  color: "orange" | "green" | "blue"
  onClick?: () => void
  enableClickSfx?: boolean
  enableHoverSfx?: boolean
}

export default function GameButton({
  label,
  color,
  onClick,
  enableClickSfx = false,
  enableHoverSfx = false,
}: Props) {
  const borderColor =
    color === "orange"
      ? "#FF3D00"
      : color === "green"
        ? "#00590D"
        : "#1D4ED8"

  function handleClick() {
    if (enableClickSfx) {
      playClickSfx()
    }
    console.log("GameButton clicked:", label)
    if (onClick) onClick()
  }

  return (
    <button
      onClick={handleClick}
      className="
        w-[340px]
        h-[80px]
        rounded-full
        border-4
        text-3xl
        font-bold
        tracking-widest
        transition-all
        duration-200
      "
      style={{
        borderColor,
        color: "#ffffff",
        backgroundColor: "transparent",
      }}
      onMouseEnter={(e) => {
        if (enableHoverSfx) {
          playClickSfx(0.35)
        }
        e.currentTarget.style.backgroundColor = borderColor
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent"
      }}
    >
      {label}
    </button>
  )
}
