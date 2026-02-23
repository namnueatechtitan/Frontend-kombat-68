// services/gameapi.ts

// -------------------- MODE --------------------

export const setMode = async (
  mode: "DUEL" | "SOLITAIRE" | "AUTO"
) => {
  const res = await fetch("/api/game/mode", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mode }),
  })

  if (!res.ok) {
    throw new Error("Failed to set mode")
  }

  return res.text()
}

// -------------------- CONFIG  --------------------

export const getConfig = async () => {
  const res = await fetch("/api/game/config")

  if (!res.ok) {
    throw new Error("Failed to load config")
  }

  const text = await res.text()

  // ถ้า backend ส่ง body ว่าง จะไม่พัง
  return text ? JSON.parse(text) : null
}


export const saveConfig = async (config: any) => {
  const res = await fetch("/api/game/config", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  })

  if (!res.ok) throw new Error("Failed to save config")
  return res.json()
}