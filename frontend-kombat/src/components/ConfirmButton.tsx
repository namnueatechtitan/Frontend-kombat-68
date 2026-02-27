interface Props {
  onClick?: () => void
  disabled?: boolean
  label?: string   // 👈 เพิ่มบรรทัดนี้
}

export default function ConfirmButton({
  onClick,
  disabled,
  label = "Confirm",   // 👈 เพิ่ม default ตรงนี้
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
        transform
        ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : `
              bg-gradient-to-r
              from-[#FF3D00]
              to-[#ECDB46]
              hover:scale-105
              hover:shadow-xl
              shadow-md
              hover:shadow-[0_0_25px_rgba(255,120,0,0.7)]
            `
        }
      `}
    >
      {label}   {/* 👈 เปลี่ยนจาก Confirm เป็น label */}
    </button>
  )
}