import { useMemo } from "react"
import assasinDemonImage from "../assets/images/Minion_gameplay/demon/assasindemon.png"
import dpsDemonImage from "../assets/images/Minion_gameplay/demon/dpsdemon.png"
import fighterDemonImage from "../assets/images/Minion_gameplay/demon/figtherdemon.png"
import supportDemonImage from "../assets/images/Minion_gameplay/demon/supportdemon.png"
import tankDemonImage from "../assets/images/Minion_gameplay/demon/tankdemon.png"
import assasinHumanImage from "../assets/images/Minion_gameplay/human/assasinhuman.png"
import dpsHumanImage from "../assets/images/Minion_gameplay/human/dpshuman.png"
import fighterHumanImage from "../assets/images/Minion_gameplay/human/figtherhuman.png"
import supportHumanImage from "../assets/images/Minion_gameplay/human/supporthuman.png"
import tankHumanImage from "../assets/images/Minion_gameplay/human/tankhuman.png"

export interface BoardMinion {
  ownerId: number
  type: string
  hp?: number
  runtimeId?: string
  row?: number
  col?: number
  x?: number
  y?: number
}

interface Props {
  minions: BoardMinion[]
  shakingMinionIds?: string[]
  hexWidth: number
  hexHeight: number
  verticalSpacing: number
  hexGap: number
  boardPadding: number
}

interface PositionedMinion {
  key: string
  runtimeId: string
  type: string
  ownerId: number
  x: number
  y: number
  stackIndex: number
  stackSize: number
}

const MINION_IMAGE_BY_TYPE: Record<string, string> = {
  assasindemon: assasinDemonImage,
  assasinhuman: assasinHumanImage,
  dpsdemon: dpsDemonImage,
  dpshuman: dpsHumanImage,
  figtherdemon: fighterDemonImage,
  figtherhuman: fighterHumanImage,
  supportdemon: supportDemonImage,
  supporthuman: supportHumanImage,
  tankdemon: tankDemonImage,
  tankhuman: tankHumanImage,
  // aliases
  assassindemon: assasinDemonImage,
  assassinhuman: assasinHumanImage,
  fighterdemon: fighterDemonImage,
  fighterhuman: fighterHumanImage,
}

export default function SpawnedMinionsLayer({
  minions,
  shakingMinionIds = [],
  hexWidth,
  hexHeight,
  verticalSpacing,
  hexGap,
  boardPadding,
}: Props) {
  const positionedMinions = useMemo(() => {
    const minionsByHex: Record<string, BoardMinion[]> = {}

    minions.forEach((minion) => {
      const row = minion.row ?? minion.x
      const col = minion.col ?? minion.y

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

      const xOffset =
        col * (hexWidth + hexGap) +
        (row % 2 ? (hexWidth + hexGap) / 2 : 0) +
        boardPadding
      const yOffset = row * (verticalSpacing + hexGap) + boardPadding
      const centerX = xOffset + hexWidth / 2
      const centerY = yOffset + hexHeight / 2

      hexMinions.forEach((minion, index) => {
        const runtimeId = minion.runtimeId ?? `${hexKey}-${minion.type}-${index}`
        result.push({
          key: runtimeId,
          runtimeId,
          type: minion.type,
          ownerId: minion.ownerId,
          x: centerX,
          y: centerY,
          stackIndex: index,
          stackSize: hexMinions.length,
        })
      })
    })

    return result
  }, [boardPadding, hexGap, hexHeight, hexWidth, minions, verticalSpacing])

  const shakingSet = useMemo(
    () => new Set(shakingMinionIds),
    [shakingMinionIds],
  )

  const resolveImageByType = (type: string, ownerId: number) => {
    const normalized = type.toLowerCase().replace(/[_\s-]/g, "")

    const direct = MINION_IMAGE_BY_TYPE[normalized]
    if (direct) return direct

    const roleToOwnerVariant: Record<string, { 1: string; 2: string }> = {
      fighter: { 1: fighterHumanImage, 2: fighterDemonImage },
      figther: { 1: fighterHumanImage, 2: fighterDemonImage },
      assassin: { 1: assasinHumanImage, 2: assasinDemonImage },
      assasin: { 1: assasinHumanImage, 2: assasinDemonImage },
      assasinn: { 1: assasinHumanImage, 2: assasinDemonImage },
      dps: { 1: dpsHumanImage, 2: dpsDemonImage },
      support: { 1: supportHumanImage, 2: supportDemonImage },
      tank: { 1: tankHumanImage, 2: tankDemonImage },
    }

    const byRole = roleToOwnerVariant[normalized]
    if (byRole) {
      return ownerId === 2 ? byRole[2] : byRole[1]
    }

    return undefined
  }

  return (
    <>
      {positionedMinions.map((minion) => {
        const imageSrc = resolveImageByType(minion.type, minion.ownerId)
        if (!imageSrc) return null
        const isShaking = shakingSet.has(minion.runtimeId)

        const size = 70
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
            className={isShaking ? "minion-shake" : undefined}
          />
        )
      })}
    </>
  )
}
