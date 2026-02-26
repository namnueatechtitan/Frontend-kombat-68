interface Props {
  onClick?: () => void
  disabled?: boolean
  children?: React.ReactNode
}

export default function BackButton({
  onClick,
  disabled,
  children = "Back",
}: Props) {
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
            : `
              bg-gradient-to-r 
              from-blue-500 
              to-blue-400
              hover:from-blue-600 
              hover:to-blue-500
              hover:scale-105
              shadow-md
              hover:shadow-xl
            `
        }
      `}
    >
      {children}
    </button>
  )
}

