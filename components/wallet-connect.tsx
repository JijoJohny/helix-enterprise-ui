"use client"

import type React from "react"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<any>
  on?: (event: string, handler: (...args: any[]) => void) => void
  removeListener?: (event: string, handler: (...args: any[]) => void) => void
}

function truncateAddress(addr: string) {
  if (!addr) return ""
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function WalletConnect({
  className = "bg-white text-black font-bold py-3 px-6 rounded-md hover:bg-gray-200 transition duration-300",
  connectedClassName = "bg-white text-black font-bold py-3 px-6 rounded-md hover:bg-gray-200 transition duration-300",
  children,
}: {
  className?: string
  connectedClassName?: string
  children?: React.ReactNode
}) {
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const providerRef = useRef<EthereumProvider | null>(null)

  // Initialize provider from window.ethereum on client
  useEffect(() => {
    let mounted = true
    const eth = typeof window !== "undefined" ? (window as any).ethereum : null
    providerRef.current = eth ?? null

    if (!eth) {
      // MetaMask not installed; show a helpful message on connect
      return
    }
    ;(async () => {
      try {
        const [accounts, currentChainId] = await Promise.all([
          eth.request({ method: "eth_accounts" }),
          eth.request({ method: "eth_chainId" }),
        ])
        if (!mounted) return
        if (Array.isArray(accounts) && accounts.length > 0) setAccount(accounts[0])
        if (typeof currentChainId === "string") setChainId(currentChainId)
      } catch {
        // Ignore prefetch errors
      }
    })()

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts?.[0] ?? null)
    }
    const handleChainChanged = (cid: string) => {
      setChainId(cid)
    }

    eth?.on?.("accountsChanged", handleAccountsChanged)
    eth?.on?.("chainChanged", handleChainChanged)

    return () => {
      mounted = false
      eth?.removeListener?.("accountsChanged", handleAccountsChanged)
      eth?.removeListener?.("chainChanged", handleChainChanged)
    }
  }, [])

  const handleConnect = useCallback(async () => {
    setError(null)
    setConnecting(true)
    try {
      const provider = providerRef.current
      if (!provider) {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
      }
      const accounts = await provider.request({ method: "eth_requestAccounts" })
      if (!Array.isArray(accounts) || accounts.length === 0) {
        throw new Error("No accounts were returned by MetaMask.")
      }
      setAccount(accounts[0])

      const cid = await provider.request({ method: "eth_chainId" })
      if (typeof cid === "string") {
        setChainId(cid)
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to connect wallet.")
    } finally {
      setConnecting(false)
    }
  }, [])

  const handleDisconnect = useCallback(() => {
    // MetaMask has no programmatic disconnect; clear UI state
    setAccount(null)
    setChainId(null)
    setError(null)
  }, [])

  const label = useMemo(() => {
    if (connecting) return "Connecting..."
    if (account) return truncateAddress(account)
    return "Connect Wallet"
  }, [connecting, account])

  return (
    <div className="flex items-center gap-3">
      {account ? (
        <button
          type="button"
          className={connectedClassName}
          aria-label={`Connected: ${truncateAddress(account)}${chainId ? ` on ${chainId}` : ""}`}
          title={chainId ? `Chain: ${chainId}` : undefined}
          onClick={handleDisconnect}
        >
          {label}
        </button>
      ) : (
        <button
          type="button"
          className={className}
          onClick={handleConnect}
          disabled={connecting}
          aria-busy={connecting}
        >
          {children ?? label}
        </button>
      )}
      {error ? (
        <span className="text-red-500 text-sm" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
