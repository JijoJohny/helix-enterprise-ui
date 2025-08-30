"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useWallet } from "@/components/wallet-store"

type CompanyForm = {
  companyName: string
  email: string
  walletAddress: string
  details: string
}

export default function FixItPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { address } = useWallet()

  const defaults: CompanyForm = useMemo(
    () => ({
      companyName: searchParams.get("company") || "",
      email: "",
      walletAddress: address || "",
      details: "",
    }),
    [address, searchParams],
  )

  const [form, setForm] = useState<CompanyForm>(defaults)

  async function onExecute() {
    // Example: mark company registered locally and proceed to manager
    try {
      const raw = window.localStorage.getItem("registeredCompanies")
      const arr: string[] = raw ? JSON.parse(raw) : []
      if (!arr.includes(form.companyName.trim())) {
        arr.push(form.companyName.trim())
        window.localStorage.setItem("registeredCompanies", JSON.stringify(arr))
      }
    } catch {}
    alert("Company registered (simulated). Taking you to Manager Dashboard.")
    router.push(`/manager?company=${encodeURIComponent(form.companyName.trim())}`)
  }

  return (
    <main className="min-h-screen px-4 py-10 flex items-start justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <header className="text-center space-y-1">
          <h1 className="text-3xl md:text-4xl font-semibold">Register Company</h1>
          <p className="text-muted-foreground">
            Connected wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect wallet"}
          </p>
        </header>

        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <label className="flex flex-col text-sm">
              Company name
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                className="mt-1 rounded-md border border-gray-300 bg-white/90 px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </label>
            <label className="flex flex-col text-sm">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="mt-1 rounded-md border border-gray-300 bg-white/90 px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </label>
            <label className="flex flex-col text-sm">
              Wallet address
              <input
                type="text"
                value={form.walletAddress}
                onChange={(e) => setForm((f) => ({ ...f, walletAddress: e.target.value }))}
                className="mt-1 rounded-md border border-gray-300 bg-white/90 px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="0x..."
                readOnly
              />
            </label>
            <label className="flex flex-col text-sm">
              Other company details
              <textarea
                value={form.details}
                onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
                className="mt-1 rounded-md border border-gray-300 bg-white/90 px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black min-h-[120px]"
              />
            </label>
          </div>
        </section>

        <footer className="flex items-center justify-end gap-3">
          <button
            onClick={() => {
              setForm(defaults)
              // go back home or post-connect
              window.history.back()
            }}
            className="border border-gray-300 text-black font-semibold py-2 px-4 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onExecute}
            className="bg-white text-black font-semibold py-2 px-4 rounded-md hover:bg-gray-200"
          >
            Register
          </button>
        </footer>
      </div>
    </main>
  )
}
