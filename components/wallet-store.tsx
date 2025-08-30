"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"

type WalletContextValue = {
  address: string | null
  setAddress: (addr: string | null) => void
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)

  // Persist in localStorage so reloads keep the address
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("walletAddress")
      if (saved) setAddress(saved)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      if (address) window.localStorage.setItem("walletAddress", address)
      else window.localStorage.removeItem("walletAddress")
    } catch {}
  }, [address])

  const value = useMemo(() => ({ address, setAddress }), [address])
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error("useWallet must be used within WalletProvider")
  return ctx
}
