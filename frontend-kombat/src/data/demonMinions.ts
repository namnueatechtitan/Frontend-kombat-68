import type { MinionData } from "../types/MinionData"

// ----- preview -----
import fighterPreview from "../assets/images/minions/Demon/demon_fighter_preview.png"
import tankPreview from "../assets/images/minions/Demon/demon_tank_preview.png"
import dpsPreview from "../assets/images/minions/Demon/demon_dps_preview.png"
import assassinPreview from "../assets/images/minions/Demon/demon_assassin_preview.png"
import supportPreview from "../assets/images/minions/Demon/demon_support_preview.png"

// ----- portrait -----
import fighterPortrait from "../assets/images/minions/Demon/demon_fighter_preview_portrait.png"
import tankPortrait from "../assets/images/minions/Demon/demon_tank_preview_portrait.png"
import dpsPortrait from "../assets/images/minions/Demon/demon_dps_preview_portrait.png"
import assassinPortrait from "../assets/images/minions/Demon/demon_assassin_preview_portrait.png"
import supportPortrait from "../assets/images/minions/Demon/demon_support_preview_portrait.png"

export const demonMinions: MinionData[] = [
  {
    type: "FIGHTER",
    name: "Kibutsuji Muzan",
    image: fighterPortrait,
    preview: fighterPreview,
  },
  {
    type: "ASSASSIN",
    name: "KOKUSHIBO",
    image: assassinPortrait,
    preview: assassinPreview,
  },
  {
    type: "DPS",
    name: "DOMA",
    image: dpsPortrait,
    preview: dpsPreview,
  },
  {
    type: "TANK",
    name: "AKAZA",
    image: tankPortrait,
    preview: tankPreview,
  },
  {
    type: "SUPPORT",
    name: "NAKIME",
    image: supportPortrait,
    preview: supportPreview,
  },
]