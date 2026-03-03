import { useMemo } from "react"
import type { TurnPhase } from "../api/gameApi"
import SpawnedMinionsLayer, { type BoardMinion } from "./SpawnedMinionsLayer"

interface SpawnableHex {
  row: number
  col: number
  ownerId: number
}

interface Props {
  spawnableHexes: SpawnableHex[]
  buyableHexes: SpawnableHex[]
  minions: BoardMinion[]
  currentPlayer: number
  phase: TurnPhase
  onHexClick: (
    row: number,
    col: number,
    clientX: number,
    clientY: number
  ) => void
}

export default function GameBoard({
  spawnableHexes,
  buyableHexes,
  minions,
  currentPlayer,
  phase,
  onHexClick,
}: Props) {

  const playerColors: Record<number, string> = {
    1: "#B1202B",
    2: "#6E3C82",
  }

  const GOLD = "#FFD700"

  const hexSize = 50
  const hexGap = 6
  const hexWidth = Math.sqrt(3) * hexSize
  const hexHeight = 2 * hexSize
  const verticalSpacing = hexSize * 1.5
  const rows = 8
  const cols = 8
  const boardPadding = 12

  const boardWidth =
    (cols - 1) * (hexWidth + hexGap) +
    (hexWidth + hexGap) / 2 +
    hexWidth +
    boardPadding * 2
  const boardHeight =
    (rows - 1) * (verticalSpacing + hexGap) + hexHeight + boardPadding * 2

  const spawnMap = useMemo(() => {
    const map: Record<string, number> = {}
    spawnableHexes.forEach((h) => {
      map[`${h.row}-${h.col}`] = h.ownerId
    })
    return map
  }, [spawnableHexes])

  const buyableMap = useMemo(() => {
    const map: Record<string, number> = {}
    buyableHexes.forEach((h) => {
      map[`${h.row}-${h.col}`] = h.ownerId
    })
    return map
  }, [buyableHexes])

  const isBuyable = (row: number, col: number) => {
    if (phase !== "PLAYER_ACTION") return false
    return buyableMap[`${row}-${col}`] === currentPlayer
  }

  const paths = useMemo(() => {
    const arr: { d: string; row: number; col: number }[] = []

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const xOffset =
          col * (hexWidth + hexGap) +
          (row % 2 ? (hexWidth + hexGap) / 2 : 0) +
          boardPadding

        const yOffset = row * (verticalSpacing + hexGap) + boardPadding

        const points = [
          [xOffset + hexWidth / 2, yOffset],
          [xOffset + hexWidth, yOffset + hexHeight / 4],
          [xOffset + hexWidth, yOffset + (3 * hexHeight) / 4],
          [xOffset + hexWidth / 2, yOffset + hexHeight],
          [xOffset, yOffset + (3 * hexHeight) / 4],
          [xOffset, yOffset + hexHeight / 4],
        ]

        arr.push({
          d: "M" + points.map((p) => p.join(",")).join(" L") + " Z",
          row,
          col,
        })
      }
    }

    return arr
  }, [boardPadding, cols, hexGap, hexHeight, hexWidth, rows, verticalSpacing])

  // ✅ พื้นต้องคงที่
  const getFillColor = () => {
    return "#1E1E1E"
  }

  // ✅ เงื่อนไขกรอบใหม่
  const getStrokeConfig = (row: number, col: number) => {
    const key = `${row}-${col}`

    // Spawn = ขอบหนา สีตาม owner
    if (spawnMap[key]) {
      return {
        stroke: playerColors[spawnMap[key]],
        strokeWidth: 5,
        className: "cursor-pointer",
      }
    }

    // Buyable = ทอง + กระพริบ
    if (isBuyable(row, col)) {
      return {
        stroke: GOLD,
        strokeWidth: 4,
        className: "cursor-pointer buyable-pulse",
      }
    }

    // ปกติ
    return {
      stroke: "#2A2A2A",
      strokeWidth: 2,
      className: "cursor-pointer",
    }
  }

  return (
    <div className="flex justify-center w-full max-w-full overflow-x-auto">
      <svg
        width={boardWidth}
        height={boardHeight}
        viewBox={`0 0 ${boardWidth} ${boardHeight}`}
        className="select-none"
      >
        <defs>
          <style>
            {`
              @keyframes buyablePulse {
                0% { opacity: 1; }
                50% { opacity: 0.45; }
                100% { opacity: 1; }
              }

              .buyable-pulse {
                animation: buyablePulse 1.2s infinite;
              }
            `}
          </style>
        </defs>

        {paths.map(({ d, row, col }) => {
          const key = `${row}-${col}`
          const strokeConfig = getStrokeConfig(row, col)

          return (
            <path
              key={key}
              d={d}
              fill={getFillColor()}
              stroke={strokeConfig.stroke}
              strokeWidth={strokeConfig.strokeWidth}
              className={strokeConfig.className}
              onClick={(e) => onHexClick(row, col, e.clientX, e.clientY)}
            />
          )
        })}

        <SpawnedMinionsLayer
          minions={minions}
          hexWidth={hexWidth}
          hexHeight={hexHeight}
          verticalSpacing={verticalSpacing}
          hexGap={hexGap}
          boardPadding={boardPadding}
        />
      </svg>
    </div>
  )
}
