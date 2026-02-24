export async function addMinion(type: string) {
  const res = await fetch("http://localhost:8080/api/game/minion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text)
  }

  return res.json()
}
export const setCharacter = async (
  character: "HUMAN" | "DEMON"
) => {
  const res = await fetch("http://localhost:8080/api/game/character", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ character }),
  })

  if (!res.ok) {
    throw new Error("Failed to set character")
  }

  return res.json()
}
// -------------------- MINION TYPE COUNT --------------------

export const setMinionTypeCount = async (count: number) => {
  const res = await fetch("/api/game/minion-type-count", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ count }),
  })

  if (!res.ok) {
    throw new Error("Failed to set minion type count")
  }

  return res
}

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