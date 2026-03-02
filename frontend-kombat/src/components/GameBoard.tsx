import { useMemo } from "react"

interface SpawnableHex {
  row: number
  col: number
  ownerId: number
}

interface Props {
  spawnableHexes: SpawnableHex[]
  currentPlayer: number
  phase: string
  onHexClick: (
    row: number,
    col: number,
    clientX: number,
    clientY: number
  ) => void
}

export default function GameBoard({
  spawnableHexes,
  currentPlayer,
  phase,
  onHexClick,
}: Props) {

  // ==========================================
  // PLAYER COLORS
  // ==========================================

  const playerColors: Record<number, string> = {
    1: "#B1202B",
    2: "#6E3C82",
  }

  const GOLD = "#FFD700"

  // ==========================================
  // HEX CONFIG
  // ==========================================

  const hexSize = 35
  const hexWidth = Math.sqrt(3) * hexSize
  const hexHeight = 2 * hexSize
  const verticalSpacing = hexSize * 1.5

  // ==========================================
  // SPAWN MAP
  // ==========================================

  const spawnMap = useMemo(() => {
    const map: Record<string, number> = {}
    spawnableHexes.forEach((h) => {
      map[`${h.row}-${h.col}`] = h.ownerId
    })
    return map
  }, [spawnableHexes])

  // ==========================================
  // HEX PATH GENERATOR
  // ==========================================

  const getHexPath = (x: number, y: number) => {
    const points = [
      [x + hexWidth / 2, y],
      [x + hexWidth, y + hexHeight / 4],
      [x + hexWidth, y + (3 * hexHeight) / 4],
      [x + hexWidth / 2, y + hexHeight],
      [x, y + (3 * hexHeight) / 4],
      [x, y + hexHeight / 4],
    ]

    return (
      "M" +
      points.map((p) => p.join(",")).join(" L") +
      " Z"
    )
  }

  // ==========================================
  // GENERATE BOARD
  // ==========================================

  const paths = useMemo(() => {
    const arr: {
      d: string
      row: number
      col: number
    }[] = []

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const xOffset =
          col * hexWidth +
          (row % 2 ? hexWidth / 2 : 0)

        const yOffset = row * verticalSpacing

        arr.push({
          d: getHexPath(xOffset, yOffset),
          row,
          col,
        })
      }
    }

    return arr
  }, [])

  // ==========================================
  // NEIGHBOR CALC (HEX GRID)
  // ==========================================

  const getNeighbors = (row: number, col: number) => {
    const isOddRow = row % 2 === 1

    const directions = isOddRow
      ? [
          [0, -1], [0, 1],
          [-1, 0], [-1, 1],
          [1, 0], [1, 1],
        ]
      : [
          [0, -1], [0, 1],
          [-1, -1], [-1, 0],
          [1, -1], [1, 0],
        ]

    return directions
      .map(([dr, dc]) => [row + dr, col + dc])
      .filter(
        ([r, c]) => r >= 0 && r < 8 && c >= 0 && c < 8
      )
  }

  // ==========================================
  // CHECK BUYABLE
  // ==========================================

  const isBuyable = (row: number, col: number) => {
    if (phase !== "BUY_HEX") return false

    const key = `${row}-${col}`

    // already spawn
    if (spawnMap[key]) return false

    // must touch spawn of current player
    const neighbors = getNeighbors(row, col)

    return neighbors.some(([r, c]) => {
      return spawnMap[`${r}-${c}`] === currentPlayer
    })
  }

  // ==========================================
  // COLOR LOGIC
  // ==========================================

  const getFillColor = (row: number, col: number) => {
    const key = `${row}-${col}`

    // spawn zone
    if (spawnMap[key]) {
      return playerColors[spawnMap[key]]
    }

    // buyable highlight
    if (isBuyable(row, col)) {
      return GOLD
    }

    return "#1E1E1E"
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="flex justify-center">
      <svg
        width="700"
        height="700"
        viewBox="0 0 700 700"
        className="select-none"
      >
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
              onClick={(e) =>
                onHexClick(
                  row,
                  col,
                  e.clientX,
                  e.clientY
                )
              }
            />
          )
        })}
      </svg>
    </div>
  )
}