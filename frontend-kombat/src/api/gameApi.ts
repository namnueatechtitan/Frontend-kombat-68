// ======================================================
// BASE CONFIG
// ======================================================

const BASE_URL = "http://localhost:8080/api/game"


// ======================================================
// CHARACTER (รองรับ 2 ผู้เล่น)
// ======================================================

export const setCharacter = async (
  playerId: number,
  character: "HUMAN" | "DEMON"
) => {
  const res = await fetch(`${BASE_URL}/character`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      playerId,
      character,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Failed to set character")
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
    const text = await res.text()
    throw new Error(text || "Failed to set mode")
  }

  return res.json()
}


// ======================================================
// CONFIG
// ======================================================

export const getConfig = async () => {
  const res = await fetch(`${BASE_URL}/config`)

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Failed to load config")
  }

  return res.json()
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
    const text = await res.text()
    throw new Error(text || "Failed to save config")
  }

  return res.json()
}


// ======================================================
// SETUP FULL (รองรับ playerId)
// ======================================================

export const setupFull = async (
  playerId: number,
  minions: {
    type: string
    defenseFactor: number
    strategy: string
  }[]
) => {
  const res = await fetch(`${BASE_URL}/setup/full/${playerId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(minions),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Setup failed")
  }

  return res.text()
}


// ======================================================
// SETUP SUMMARY
// ======================================================

export const getSetupSummary = async () => {
  const res = await fetch(`${BASE_URL}/setup`)

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Failed to load setup summary")
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
    const text = await res.text()
    throw new Error(text || "Failed to start game")
  }

  return res.text()
}


// ======================================================
// NEW: GAME STATUS (ใช้ใน GameplayPage)
// ======================================================

export const getGameStatus = async () => {
  const res = await fetch(`${BASE_URL}/status`)

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Game not started")
  }

  return res.json()
}


// ======================================================
// NEW: SPAWN MINION (ใช้ใน FREE_SPAWN + BUY)
// ======================================================

export const spawnMinion = async (
  type: string,
  row: number,
  col: number
) => {
  const res = await fetch(`${BASE_URL}/spawn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, row, col }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Spawn failed")
  }

  return await res.json()   
}


// ======================================================
//  NEW: END TURN
// ======================================================

export const endTurn = async () => {
  const res = await fetch(`${BASE_URL}/end-turn`, {
    method: "POST",
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "End turn failed")
  }

  return res.text()
}