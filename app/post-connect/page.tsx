"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useWallet } from "@/components/wallet-store"

function isRegisteredCompany(name: string): boolean {
  try {
    const raw = window.localStorage.getItem("registeredCompanies")
    const arr: string[] = raw ? JSON.parse(raw) : ["DemoCo"] // DemoCo is registered by default
    return arr.includes(name.trim())
  } catch {
    return false
  }
}

export default function PostConnectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { address } = useWallet()
  const [company, setCompany] = useState(searchParams.get("company") || "")

  // if no wallet, keep user here so they can go back and connect
  useEffect(() => {
    // no-op for now
  }, [address])

  function handleProceed(e: React.FormEvent) {
    e.preventDefault()
    const name = company.trim()
    if (!name) return
    if (isRegisteredCompany(name)) {
      router.push(`/manager?company=${encodeURIComponent(name)}`)
    } else {
      router.push(`/fix-it?company=${encodeURIComponent(name)}`)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-6 text-center">
        <h1 className="text-2xl md:text-3xl font-semibold">Choose Company</h1>
        <p className="text-muted-foreground">
          Connected wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
        </p>
        <form onSubmit={handleProceed} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Company name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white/90 px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-black"
            aria-label="Company name"
            required
          />
          <button
            type="submit"
            className="bg-black text-white font-semibold py-3 px-6 rounded-md hover:bg-black/90 transition"
          >
            Continue
          </button>
        </form>
        <p className="text-sm text-gray-500">Tip: Try "DemoCo" to simulate a registered company.</p>
      </div>
    </main>
  )
}
