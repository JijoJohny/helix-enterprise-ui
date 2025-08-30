"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/components/wallet-store"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<any>
  on?: (event: string, handler: (...args: any[]) => void) => void
  removeListener?: (event: string, handler: (...args: any[]) => void) => void
}

const AVALANCHE_HEX_CHAIN_ID = "0xa86a" // 43114
const AVALANCHE_PARAMS = {
  chainId: AVALANCHE_HEX_CHAIN_ID,
  chainName: "Avalanche C-Chain",
  nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
  rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://snowtrace.io/"],
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
  const router = useRouter()
  const { address, setAddress } = useWallet()
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
      return
    }
    ;(async () => {
      try {
        const [accounts, currentChainId] = await Promise.all([
          eth.request({ method: "eth_accounts" }),
          eth.request({ method: "eth_chainId" }),
        ])
        if (!mounted) return
        if (Array.isArray(accounts) && accounts.length > 0) setAddress(accounts[0])
        if (typeof currentChainId === "string") setChainId(currentChainId)
      } catch {
        // Ignore prefetch errors
      }
    })()

    const handleAccountsChanged = (accounts: string[]) => {
      setAddress(accounts?.[0] ?? null)
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
  }, [setAddress])

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
      setAddress(accounts[0])

      const cid = await provider.request({ method: "eth_chainId" })
      if (typeof cid === "string") {
        setChainId(cid)
      }

      try {
        if (cid !== AVALANCHE_HEX_CHAIN_ID) {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: AVALANCHE_HEX_CHAIN_ID }],
          })
          setChainId(AVALANCHE_HEX_CHAIN_ID)
        }
      } catch (switchErr: any) {
        // If the chain has not been added to MetaMask, add it then switch
        if (switchErr?.code === 4902 || /wallet_addEthereumChain/i.test(String(switchErr?.message))) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [AVALANCHE_PARAMS],
          })
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: AVALANCHE_HEX_CHAIN_ID }],
          })
          setChainId(AVALANCHE_HEX_CHAIN_ID)
        } else {
          throw switchErr
        }
      }

      router.push("/post-connect")
    } catch (e: any) {
      setError(e?.message ?? "Failed to connect wallet.")
    } finally {
      setConnecting(false)
    }
  }, [router, setAddress])

  const handleDisconnect = useCallback(() => {
    // MetaMask has no programmatic disconnect; clear UI state
    setAddress(null)
    setChainId(null)
    setError(null)
  }, [setAddress])

  const label = useMemo(() => {
    if (connecting) return "Connecting..."
    if (address) return truncateAddress(address)
    return "Connect Wallet"
  }, [connecting, address])

  return (
    <div className="flex items-center gap-3">
      {address ? (
        <button
          type="button"
          className={connectedClassName}
          aria-label={`Connected: ${truncateAddress(address)}${chainId ? ` on ${chainId}` : ""}`}
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
