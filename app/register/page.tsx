"use client"
import { useState } from "react"
import type React from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RegisterPage() {
  const [company, setCompany] = useState("")
  const [ownerAddress, setOwnerAddress] = useState("") // optionally prefill from wallet store if present

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Replace with real registration (API / chain call)
    alert(`Registered company: ${company}\nOwner: ${ownerAddress}`)
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 text-center">
      <h1 className="text-3xl font-semibold md:text-4xl">Register Company</h1>
      <p className="mt-2 text-white/70">Register to create raffles and manage prizes in AVAX.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 text-left">
        <div>
          <label className="mb-1 block text-sm text-white/80">Company Name</label>
          <Input placeholder="Acme Labs" value={company} onChange={(e) => setCompany(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/80">Owner Wallet Address</label>
          <Input placeholder="0x..." value={ownerAddress} onChange={(e) => setOwnerAddress(e.target.value)} required />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-white/70 underline underline-offset-4">
            Cancel
          </Link>
          <Button type="submit" className="bg-white text-black hover:bg-gray-200">
            Register
          </Button>
        </div>
      </form>
    </div>
  )
}
