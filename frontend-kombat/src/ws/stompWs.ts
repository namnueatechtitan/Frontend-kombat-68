type MessageHandler = (payload: any) => void

const resolveWsUrl = () => {
  const configured = import.meta.env.VITE_WS_URL?.trim()
  if (configured) {
    return configured
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
  return `${protocol}//${window.location.hostname}:8080/ws`
}

class SimpleStompWs {
  private socket: WebSocket | null = null
  private connected = false
  private subscriptions = new Map<string, MessageHandler>()
  private subscribedDestinations = new Set<string>()
  private subSeq = 0
  private readonly wsUrl = resolveWsUrl()
  private pendingConnectedCallbacks: Array<() => void> = []

  connect(onConnected?: () => void) {
    if (this.connected) {
      onConnected?.()
      return
    }

    if (onConnected) {
      this.pendingConnectedCallbacks.push(onConnected)
    }

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return
    }

    this.socket = new WebSocket(this.wsUrl)

    this.socket.onopen = () => {
      const host = (() => {
        try {
          return new URL(this.wsUrl).host
        } catch {
          return "localhost"
        }
      })()

      this.sendFrame("CONNECT", {
        "accept-version": "1.2",
        host,
      })
    }

    this.socket.onmessage = (event) => {
      const text = String(event.data ?? "")
      const frames = text.split("\u0000").filter(Boolean)
      for (const frame of frames) {
        const parsed = this.parseFrame(frame)
        if (!parsed) continue
        if (parsed.command === "CONNECTED") {
          this.connected = true
          for (const destination of this.subscriptions.keys()) {
            this.subscribeFrame(destination)
          }
          const callbacks = this.pendingConnectedCallbacks
          this.pendingConnectedCallbacks = []
          for (const callback of callbacks) {
            callback()
          }
          continue
        }
        if (parsed.command === "MESSAGE") {
          const destination = parsed.headers.destination
          if (!destination) continue
          const handler = this.subscriptions.get(destination)
          if (!handler) continue
          try {
            const payload = parsed.body ? JSON.parse(parsed.body) : null
            handler(payload)
          } catch {
            handler(parsed.body)
          }
        }
      }
    }

    this.socket.onclose = () => {
      this.connected = false
      this.subscribedDestinations.clear()
      this.pendingConnectedCallbacks = []
    }
  }

  subscribe(destination: string, handler: MessageHandler) {
    this.subscriptions.set(destination, handler)
    if (!this.connected) return
    this.subscribeFrame(destination)
  }

  unsubscribe(destination: string) {
    this.subscriptions.delete(destination)
    this.subscribedDestinations.delete(destination)
  }

  send(destination: string, body: unknown) {
    if (!this.connected) return
    const payload = JSON.stringify(body)
    this.sendFrame("SEND", {
      destination,
      "content-type": "application/json",
      "content-length": String(payload.length),
    }, payload)
  }

  isConnected() {
    return this.connected
  }

  private subscribeFrame(destination: string) {
    if (this.subscribedDestinations.has(destination)) {
      return
    }
    this.subSeq += 1
    this.sendFrame("SUBSCRIBE", {
      id: `sub-${this.subSeq}`,
      destination,
    })
    this.subscribedDestinations.add(destination)
  }

  private sendFrame(command: string, headers: Record<string, string>, body = "") {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return
    const lines = [command]
    for (const [k, v] of Object.entries(headers)) {
      lines.push(`${k}:${v}`)
    }
    lines.push("")
    lines.push(body)
    const frame = `${lines.join("\n")}\u0000`
    this.socket.send(frame)
  }

  private parseFrame(frame: string): { command: string; headers: Record<string, string>; body: string } | null {
    const parts = frame.split("\n\n")
    if (parts.length === 0) return null
    const head = parts[0]
    const body = parts.slice(1).join("\n\n")
    const lines = head.split("\n")
    const command = lines[0]?.trim()
    if (!command) return null
    const headers: Record<string, string> = {}
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const idx = line.indexOf(":")
      if (idx <= 0) continue
      headers[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
    }
    return { command, headers, body }
  }
}

export const stompWs = new SimpleStompWs()
