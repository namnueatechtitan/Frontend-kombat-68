import { useMemo } from "react"

export interface BoardMinion {
  ownerId: number
  type: string
  row?: number
  col?: number
  x?: number
  y?: number
}

interface Props {
  minions: BoardMinion[]
  hexWidth: number
  hexHeight: number
  verticalSpacing: number
}

interface PositionedMinion {
  key: string
  type: string
  x: number
  y: number
  stackIndex: number
  stackSize: number
}

export default function SpawnedMinionsLayer({
  minions,
  hexWidth,
  hexHeight,
  verticalSpacing,
}: Props) {
  const minionImages = useMemo(() => {
    const files = import.meta.glob(
      "../assets/images/Minion_gameplay/**/*.{png,PNG}",
      {
        eager: true,
        import: "default",
      }
    ) as Record<string, string>

    const map: Record<string, string> = {}

    Object.entries(files).forEach(([path, src]) => {
      const filename = path.split("/").pop()?.split(".")[0]?.toLowerCase()
      if (filename) {
        map[filename] = src
      }
    })

    return map
  }, [])

  const positionedMinions = useMemo(() => {
    const minionsByHex: Record<string, BoardMinion[]> = {}

    minions.forEach((minion) => {
      const row = minion.row ?? minion.y
      const col = minion.col ?? minion.x

      if (row === undefined || col === undefined) return

      const key = `${row}-${col}`
      if (!minionsByHex[key]) {
        minionsByHex[key] = []
      }

      minionsByHex[key].push(minion)
    })

    const result: PositionedMinion[] = []

    Object.entries(minionsByHex).forEach(([hexKey, hexMinions]) => {
      const [rowText, colText] = hexKey.split("-")
      const row = Number(rowText)
      const col = Number(colText)

      if (Number.isNaN(row) || Number.isNaN(col)) return

      const xOffset = col * hexWidth + (row % 2 ? hexWidth / 2 : 0)
      const yOffset = row * verticalSpacing
      const centerX = xOffset + hexWidth / 2
      const centerY = yOffset + hexHeight / 2

      hexMinions.forEach((minion, index) => {
        result.push({
          key: `${hexKey}-${minion.type}-${index}`,
          type: minion.type,
          x: centerX,
          y: centerY,
          stackIndex: index,
          stackSize: hexMinions.length,
        })
      })
    })

    return result
  }, [hexHeight, hexWidth, minions, verticalSpacing])

  const getMinionImage = (type: string) => {
    const normalized = type.toLowerCase().replace(/[_\s-]/g, "")
    return minionImages[normalized]
  }

  return (
    <>
      {positionedMinions.map((minion) => {
        const imageSrc = getMinionImage(minion.type)
        if (!imageSrc) return null

        const size = 36
        const offsetStep = 10
        const offset =
          (minion.stackIndex - (minion.stackSize - 1) / 2) * offsetStep

        return (
          <image
            key={minion.key}
            href={imageSrc}
            x={minion.x - size / 2 + offset}
            y={minion.y - size / 2}
            width={size}
            height={size}
            preserveAspectRatio="xMidYMid meet"
            pointerEvents="none"
          />
        )
      })}
    </>
  )
}
