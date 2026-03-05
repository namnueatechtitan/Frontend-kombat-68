import type { MinionData } from "../types/MinionData"

// ----- preview -----
import fighterPreview from "../assets/images/minions/Human/human_fighter_preview.png"
import tankPreview from "../assets/images/minions/Human/human_tank_preview.png"
import dpsPreview from "../assets/images/minions/Human/human_dps_preview.png"
import assassinPreview from "../assets/images/minions/Human/human_assassin_preview.png"
import supportPreview from "../assets/images/minions/Human/human_support_preview.png"

// ----- portrait -----
import fighterPortrait from "../assets/images/minions/Human/human_fighter_preview_portrait.png"
import tankPortrait from "../assets/images/minions/Human/human_tank_preview_portrait.png"
import dpsPortrait from "../assets/images/minions/Human/human_dps_preview_portrait.png"
import assassinPortrait from "../assets/images/minions/Human/human_assassin_preview_portrait.png"
import supportPortrait from "../assets/images/minions/Human/human_support_preview_portrait.png"

export const humanMinions: MinionData[] = [
  {
    type: "FIGHTER",
    name: "TANJIRO",
    image: fighterPortrait,
    preview: fighterPreview,
  },
  {
    type: "ASSASSIN",
    name: "YORIICHI",
    image: assassinPortrait,
    preview: assassinPreview,
  },
  {
    type: "DPS",
    name: "GIYU",
    image: dpsPortrait,
    preview: dpsPreview,
  },
  {
    type: "TANK",
    name: "KYOJURO",
    image: tankPortrait,
    preview: tankPreview,
  },
  {
    type: "SUPPORT",
    name: "INOSUKE",
    image: supportPortrait,
    preview: supportPreview,
  },
]
