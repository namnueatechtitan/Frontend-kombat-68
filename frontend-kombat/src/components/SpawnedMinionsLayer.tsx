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
  hpPercent?: number
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
  hp?: number
  hpPercent?: number
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

const DEMON_CLASS_COLOR_BY_ROLE: Record<string, string> = {
  fighter: "#AFAFAF",
  assassin: "#720066",
  dps: "#001311",
  tank: "#D42828",
  support: "#372026",
}

const HUMAN_CLASS_COLOR_BY_ROLE: Record<string, string> = {
  fighter: "#195A45",
  assassin: "#7B140D",
  dps: "#0139C9",
  tank: "#BD3431",
  support: "#FFB300",
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
          hp: minion.hp,
          hpPercent: minion.hpPercent,
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

  const resolveRoleByType = (type: string) => {
    const normalized = type.toLowerCase().replace(/[_\s-]/g, "")

    if (normalized.includes("fight")) return "fighter"
    if (normalized.includes("assass")) return "assassin"
    if (normalized.includes("dps")) return "dps"
    if (normalized.includes("tank")) return "tank"
    return "support"
  }

  const resolveHpPercent = (minion: PositionedMinion) => {
    if (typeof minion.hpPercent === "number") {
      return Math.max(0, Math.min(100, minion.hpPercent))
    }
    if (typeof minion.hp === "number") {
      const fallback = minion.hp <= 100 ? minion.hp : 100
      return Math.max(0, Math.min(100, fallback))
    }
    return 100
  }

  return (
    <>
      {positionedMinions.map((minion) => {
        const imageSrc = resolveImageByType(minion.type, minion.ownerId)
        if (!imageSrc) return null
        const isShaking = shakingSet.has(minion.runtimeId)
        const hpPercent = resolveHpPercent(minion)
        const role = resolveRoleByType(minion.type)
        const classColorMap =
          minion.ownerId === 2
            ? DEMON_CLASS_COLOR_BY_ROLE
            : HUMAN_CLASS_COLOR_BY_ROLE
        const auraColor = classColorMap[role]
        const auraColorSoft = `${auraColor}55`
        const auraColorStrong = `${auraColor}cc`
        const hpColor = auraColor
        const hpColorSoft = `${auraColor}55`

        const size = 62
        const outerRing = size / 2 + 10
        const progressRadius = size / 2 + 4
        const progressCircumference = 2 * Math.PI * progressRadius
        const dashOffset =
          progressCircumference - (hpPercent / 100) * progressCircumference
        const offsetStep = 10
        const offset =
          (minion.stackIndex - (minion.stackSize - 1) / 2) * offsetStep
        const centerX = minion.x + offset
        const centerY = minion.y
        const clipId = `clip-${minion.runtimeId.replace(/[^a-zA-Z0-9_-]/g, "-")}`

        return (
          <g
            key={minion.key}
            className={isShaking ? "minion-shake" : undefined}
            pointerEvents="none"
          >
            {isShaking && (
              <>
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={size / 2 + 8}
                  fill="#fff7ed"
                  className="minion-hit-flash"
                />
                <g>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                    const rad = (angle * Math.PI) / 180
                    const sparkRadius = size / 2 + 14
                    const px = centerX + Math.cos(rad) * sparkRadius
                    const py = centerY + Math.sin(rad) * sparkRadius
                    return (
                      <circle
                        key={`${minion.key}-hit-${angle}`}
                        cx={px}
                        cy={py}
                        r={2.1}
                        fill="#fde68a"
                        className="minion-hit-spark"
                      />
                    )
                  })}
                </g>
              </>
            )}

            <circle
              cx={centerX}
              cy={centerY}
              r={outerRing + 6}
              fill={auraColorSoft}
              className="minion-aura-pulse"
            />

            <circle
              cx={centerX}
              cy={centerY}
              r={outerRing}
              fill="none"
              stroke={auraColorStrong}
              strokeWidth={3}
              className="minion-aura-spin"
            />

            <circle
              cx={centerX}
              cy={centerY}
              r={outerRing + 2}
              fill="none"
              stroke={auraColorSoft}
              strokeWidth={1.2}
              strokeDasharray="6 8"
              className="minion-aura-spin-reverse"
            />

            <g className="minion-aura-spin">
              {[0, 72, 144, 216, 288].map((angle) => {
                const rad = (angle * Math.PI) / 180
                const px = centerX + Math.cos(rad) * (outerRing + 4)
                const py = centerY + Math.sin(rad) * (outerRing + 4)
                return (
                  <circle
                    key={`${minion.key}-spark-${angle}`}
                    cx={px}
                    cy={py}
                    r={1.8}
                    fill={auraColorStrong}
                    className="minion-aura-spark"
                  />
                )
              })}
            </g>

            <circle
              cx={centerX}
              cy={centerY}
              r={progressRadius}
              fill="none"
              stroke="rgba(20,20,20,0.85)"
              strokeWidth={6}
            />

            <circle
              cx={centerX}
              cy={centerY}
              r={progressRadius}
              fill="none"
              stroke={hpColor}
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={progressCircumference}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${centerX} ${centerY})`}
              className="minion-hp-ring"
              style={{
                filter: `drop-shadow(0 0 6px ${hpColorSoft})`,
              }}
            />

            <clipPath id={clipId}>
              <circle cx={centerX} cy={centerY} r={size / 2} />
            </clipPath>

            <image
              href={imageSrc}
              x={centerX - size / 2}
              y={centerY - size / 2}
              width={size}
              height={size}
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${clipId})`}
            />

            <circle
              cx={centerX}
              cy={centerY}
              r={size / 2}
              fill="none"
              stroke={auraColorStrong}
              strokeWidth={2}
            />

            <rect
              x={centerX - 22}
              y={centerY + size / 2 - 6}
              width={44}
              height={16}
              rx={8}
              fill="rgba(0,0,0,0.7)"
              stroke={auraColorStrong}
              strokeWidth={1}
            />
            <text
              x={centerX}
              y={centerY + size / 2 + 6}
              textAnchor="middle"
              fontSize={10}
              fontWeight={800}
              fill="#fef3c7"
              className="select-none"
              style={{ textShadow: `0 0 8px ${auraColorStrong}` }}
            >
              {Math.round(hpPercent)}%
            </text>
          </g>
        )
      })}
    </>
  )
}
