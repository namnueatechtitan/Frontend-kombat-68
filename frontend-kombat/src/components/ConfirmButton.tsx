interface Props {
  onClick?: () => void
}

export default function ConfirmButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="
        mt-10
        w-[220px]
        h-[55px]
        rounded-full
        text-black
        font-semibold
        text-lg
        bg-yellow-400
        hover:scale-105
        transition-all
        duration-200
      "
    >
      Confirm
    </button>
  )
}
