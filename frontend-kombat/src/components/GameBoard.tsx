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

  const hexSize = 35
  const hexWidth = Math.sqrt(3) * hexSize
  const hexHeight = 2 * hexSize
  const verticalSpacing = hexSize * 1.5

  const spawnMap = useMemo(() => {
    const map: Record<string, number> = {}
    spawnableHexes.forEach((h) => {
      map[`${h.row}-${h.col}`] = h.ownerId
    })
    return map
  }, [spawnableHexes])

  const getHexPath = (x: number, y: number) => {
    const points = [
      [x + hexWidth / 2, y],
      [x + hexWidth, y + hexHeight / 4],
      [x + hexWidth, y + (3 * hexHeight) / 4],
      [x + hexWidth / 2, y + hexHeight],
      [x, y + (3 * hexHeight) / 4],
      [x, y + hexHeight / 4],
    ]

    return "M" + points.map((p) => p.join(",")).join(" L") + " Z"
  }

  const paths = useMemo(() => {
    const arr: {
      d: string
      row: number
      col: number
    }[] = []

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const xOffset = col * hexWidth + (row % 2 ? hexWidth / 2 : 0)
        const yOffset = row * verticalSpacing

        arr.push({
          d: getHexPath(xOffset, yOffset),
          row,
          col,
        })
      }
    }

    return arr
  }, [hexHeight, hexWidth, verticalSpacing])

  const buyableMap = useMemo(() => {
    const map: Record<string, number> = {}
    buyableHexes.forEach((h) => {
      map[`${h.row}-${h.col}`] = h.ownerId
    })
    return map
  }, [buyableHexes])

  const isBuyable = (row: number, col: number) => {
    if (phase !== "PLAYER_ACTION") return false

    const owner = buyableMap[`${row}-${col}`]
    return owner === currentPlayer
  }

  const getFillColor = (row: number, col: number) => {
    const key = `${row}-${col}`

    if (spawnMap[key]) {
      return playerColors[spawnMap[key]]
    }

    if (isBuyable(row, col)) {
      return GOLD
    }

    return "#1E1E1E"
  }

  return (
    <div className="flex justify-center">
      <svg width="700" height="700" viewBox="0 0 700 700" className="select-none">
        {paths.map(({ d, row, col }) => {
          const key = `${row}-${col}`

          return (
            <path
              key={key}
              d={d}
              fill={getFillColor(row, col)}
              stroke="#2A2A2A"
              strokeWidth={2}
              className="cursor-pointer transition duration-200 hover:brightness-110"
              onClick={(e) => onHexClick(row, col, e.clientX, e.clientY)}
            />
          )
        })}

        <SpawnedMinionsLayer
          minions={minions}
          hexWidth={hexWidth}
          hexHeight={hexHeight}
          verticalSpacing={verticalSpacing}
        />
      </svg>
    </div>
  )
}
