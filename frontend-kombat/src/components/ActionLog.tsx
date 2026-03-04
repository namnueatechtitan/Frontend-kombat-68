import { useEffect, useRef } from "react"

interface Props {
  logs: string[]
}

export default function ActionLog({ logs }: Props) {

  const logRef = useRef<HTMLDivElement>(null)

  // 🔥 Auto scroll ลงล่างสุดเมื่อ logs เปลี่ยน
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="w-full h-40 bg-black/70 border-t border-gray-700 p-4">

      <h3 className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
        <span className="action-log-pulse-dot" />
        Action Log
      </h3>

      <div
        ref={logRef}
        className="h-24 overflow-y-auto pr-2 text-sm space-y-1 scrollbar-thumb-gray-600"
      >
        {logs.length === 0 && (
          <div className="text-gray-500">
            No actions yet...
          </div>
        )}

        {logs.map((log, index) => {
          const isLatest = index === logs.length - 1
          return (
            <div
              key={`${index}-${log}`}
              className={`action-log-line ${isLatest ? "action-log-line-latest" : ""}`}
            >
              {log}
            </div>
          )
        })}
      </div>
    </div>
  )
}
