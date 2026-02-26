// ======================================================
// BASE CONFIG
// ======================================================

const BASE_URL = "http://localhost:8080/api/game"


// ======================================================
// ADD MINION (Strategy Confirm)
// ======================================================

export async function addMinion(
  type: string,
  defenseFactor: number,
  strategy: string
) {
  const res = await fetch(`${BASE_URL}/minion/create`, {   // ✅ แก้ endpoint
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type,
      defenseFactor,
      strategy,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Failed to create minion")
  }

  // Backend return plain text
  return res.text()   // ✅ แก้จาก res.json()
}


// ======================================================
// CHARACTER
// ======================================================

export const setCharacter = async (
  character: "HUMAN" | "DEMON"
) => {
  const res = await fetch(`${BASE_URL}/character`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ character }),
  })

  if (!res.ok) {
    throw new Error("Failed to set character")
  }

  return res.json()
}

// ======================================================
// MODE
// ======================================================

export const setMode = async (
  mode: "DUEL" | "SOLITAIRE" | "AUTO"
) => {
  const res = await fetch(`${BASE_URL}/mode`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mode }),
  })

  if (!res.ok) {
    throw new Error("Failed to set mode")
  }

  return res.json()
}


// ======================================================
// CONFIG
// ======================================================

export const getConfig = async () => {
  const res = await fetch(`${BASE_URL}/config`)

  if (!res.ok) {
    throw new Error("Failed to load config")
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const saveConfig = async (config: any) => {
  const res = await fetch(`${BASE_URL}/config`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  })

  if (!res.ok) {
    throw new Error("Failed to save config")
  }

  return res.json()
}


// ======================================================
// SETUP SUMMARY
// ======================================================

export const getSetupSummary = async () => {
  const res = await fetch(`${BASE_URL}/setup`)

  if (!res.ok) {
    throw new Error("Failed to load setup summary")
  }

  return res.json()
}


// ======================================================
// START GAME
// ======================================================

export const startGame = async () => {
  const res = await fetch(`${BASE_URL}/start`, {
    method: "POST",
  })

  if (!res.ok) {
    throw new Error("Failed to start game")
  }

  return res.text()
}


// ======================================================
// GAME STATE
// ======================================================

export const getGameState = async () => {
  const res = await fetch(`${BASE_URL}/state`)

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Game not started")
  }

  return res.json()
}