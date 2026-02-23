interface Props {
  onClick?: () => void
  disabled?: boolean   
}

export default function ConfirmButton({ onClick, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}   
      className={`
        mt-1
        w-[220px]
        h-[55px]
        rounded-full
        text-white
        font-semibold
        text-lg
        transition-all
        duration-300
        ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-[#FF3D00] to-[#ECDB46] hover:from-green-500 hover:to-green-500"
        }
      `}
    >
      Confirm
    </button>
  )
}