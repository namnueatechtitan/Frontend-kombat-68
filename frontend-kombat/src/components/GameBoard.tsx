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
  shakingMinionIds?: string[]
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
  shakingMinionIds = [],
  currentPlayer,
  phase,
  onHexClick,
}: Props) {

  const playerColors: Record<number, string> = {
    1: "#B1202B",
    2: "#6E3C82",
  }

  const GOLD = "#FFD700"

  const hexSize = 45
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

  const currentPlayerBuyableCount = useMemo(
    () => buyableHexes.filter((hex) => hex.ownerId === currentPlayer).length,
    [buyableHexes, currentPlayer],
  )
  const dimBuyableHighlight = currentPlayerBuyableCount >= 6

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
        strokeOpacity: dimBuyableHighlight ? 0.85 : 1,
        className: `cursor-pointer ${dimBuyableHighlight ? "buyable-pulse-dim" : "buyable-pulse"}`,
      }
    }

    // ปกติ
    return {
      stroke: "#2A2A2A",
      strokeWidth: 2,
      strokeOpacity: 1,
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

              @keyframes buyablePulseDim {
                0% { opacity: 0.85; }
                50% { opacity: 0.38; }
                100% { opacity: 0.85; }
              }

              .buyable-pulse-dim {
                animation: buyablePulseDim 1.2s infinite;
              }

              @keyframes minionShake {
                0%, 100% { transform: translate(0, 0); }
                20% { transform: translate(-2px, -1px); }
                40% { transform: translate(2px, 1px); }
                60% { transform: translate(-2px, 1px); }
                80% { transform: translate(2px, -1px); }
              }

              .minion-shake {
                animation: minionShake 0.35s ease-in-out 2;
                transform-box: fill-box;
                transform-origin: center;
              }

              @keyframes minionAuraPulse {
                0% { opacity: 0.28; transform: scale(0.94); }
                50% { opacity: 0.52; transform: scale(1.03); }
                100% { opacity: 0.28; transform: scale(0.94); }
              }

              @keyframes minionAuraSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }

              @keyframes minionAuraSpinReverse {
                0% { transform: rotate(360deg); }
                100% { transform: rotate(0deg); }
              }

              @keyframes hpRingBeat {
                0% { opacity: 0.78; }
                50% { opacity: 1; }
                100% { opacity: 0.78; }
              }

              .minion-aura-pulse {
                animation: minionAuraPulse 1.8s ease-in-out infinite;
                transform-box: fill-box;
                transform-origin: center;
              }

              .minion-aura-spin {
                animation: minionAuraSpin 7s linear infinite;
                transform-box: fill-box;
                transform-origin: center;
              }

              .minion-aura-spin-reverse {
                animation: minionAuraSpinReverse 9s linear infinite;
                transform-box: fill-box;
                transform-origin: center;
              }

              .minion-aura-spark {
                filter: drop-shadow(0 0 5px currentColor);
              }

              .minion-hp-ring {
                animation: hpRingBeat 1.2s ease-in-out infinite;
                transition: stroke-dashoffset 0.28s ease-out;
              }

              @keyframes minionHitFlash {
                0% { opacity: 0.78; transform: scale(0.75); }
                100% { opacity: 0; transform: scale(1.18); }
              }

              @keyframes minionHitSpark {
                0% { opacity: 1; transform: scale(0.4); }
                100% { opacity: 0; transform: scale(1.45); }
              }

              .minion-hit-flash {
                animation: minionHitFlash 0.24s ease-out forwards;
                transform-box: fill-box;
                transform-origin: center;
              }

              .minion-hit-spark {
                animation: minionHitSpark 0.28s ease-out forwards;
                transform-box: fill-box;
                transform-origin: center;
                filter: drop-shadow(0 0 5px rgba(253, 186, 116, 0.9));
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
              strokeOpacity={strokeConfig.strokeOpacity}
              className={strokeConfig.className}
              onClick={(e) => onHexClick(row, col, e.clientX, e.clientY)}
            />
          )
        })}

        <SpawnedMinionsLayer
          minions={minions}
          shakingMinionIds={shakingMinionIds}
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
