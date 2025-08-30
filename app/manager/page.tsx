"use client"

import { useMemo, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useWallet } from "@/components/wallet-store"
import { set as setDateTime } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

type FormState = {
  numWinners: number
  prizeAmount: string
  endTime: number
  ownerAddress: string
}

export default function ManagerDashboardPage() {
  const searchParams = useSearchParams()
  const company = searchParams.get("company") || "Unknown Company"
  const { address } = useWallet()

  const defaults: FormState = useMemo(
    () => ({
      numWinners: 1,
      prizeAmount: "0.1",
      endTime: Math.floor(Date.now() / 1000) + 3600,
      ownerAddress: address || "",
    }),
    [address],
  )

  const [form, setForm] = useState<FormState>(defaults)
  const [step, setStep] = useState<"edit" | "preview" | "execute">("edit")

  const [date, setDate] = useState<Date | undefined>(new Date())
  const [hour, setHour] = useState<string>("12")
  const [minute, setMinute] = useState<string>("00")

  const scheduledAt = useMemo(() => {
    if (!date) return undefined
    const h = Number.parseInt(hour || "0", 10)
    const m = Number.parseInt(minute || "0", 10)
    return setDateTime(date, { hours: h, minutes: m, seconds: 0, milliseconds: 0 })
  }, [date, hour, minute])

  useEffect(() => {
    if (scheduledAt) {
      setForm((f) => ({ ...f, endTime: Math.floor(scheduledAt.getTime() / 1000) }))
    }
  }, [scheduledAt])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function onCancel() {
    setForm(defaults)
    setStep("edit")
  }

  function onPreview() {
    setStep("preview")
  }

  function onNext() {
    setStep("execute")
  }

  async function onExecute() {
    console.log("[v0] Executing with payload:", form)
    alert("Execute called. Check console for payload.")
  }

  return (
    <main className="min-h-screen px-4 py-10 flex items-start justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <header className="text-center space-y-1">
          <h1 className="text-3xl md:text-4xl font-semibold">{company} — Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Owner:{" "}
            {form.ownerAddress ? `${form.ownerAddress.slice(0, 6)}...${form.ownerAddress.slice(-4)}` : "Connect wallet"}
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <CardTitle>Prize</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <label className="block text-sm text-white/80">Prize Amount (AVAX)</label>
              <div className="flex items-center gap-2">
                <Input
                  inputMode="decimal"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={form.prizeAmount}
                  onChange={(e) => update("prizeAmount", e.target.value)}
                  className="bg-transparent text-white caret-white placeholder:text-white/50 border-white/20 focus-visible:ring-white/30 focus-visible:ring-offset-0"
                />
                <span className="shrink-0 rounded-md bg-white/10 px-2 py-1 text-sm">AVAX</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-white/80">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start bg-transparent text-white border-white/20 hover:bg-white/10")}
                    >
                      {date ? date.toLocaleDateString() : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-white/80">Hour (0-23)</label>
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                    className="bg-transparent text-white caret-white placeholder:text-white/50 border-white/20 focus-visible:ring-white/30 focus-visible:ring-offset-0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-white/80">Minute</label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    className="bg-transparent text-white caret-white placeholder:text-white/50 border-white/20 focus-visible:ring-white/30 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
              <div className="rounded-md bg-white/5 p-3 text-xs text-white/80">
                <div>Scheduled: {scheduledAt ? scheduledAt.toLocaleString() : "-"}</div>
                <div>UNIX: {form.endTime || "-"}</div>
              </div>
            </CardContent>
          </Card>
        </section>

        {step === "preview" && (
          <section className="rounded-md border border-gray-200 p-4">
            <h2 className="font-medium mb-2">Preview</h2>
            <pre className="text-sm overflow-x-auto bg-gray-50 p-3 rounded text-black">
              {JSON.stringify(form, null, 2)}
            </pre>
            <div className="text-right mt-3">
              <button
                onClick={onNext}
                className="bg-black text-white font-semibold py-2 px-4 rounded-md hover:bg-black/90"
              >
                Next
              </button>
            </div>
          </section>
        )}

        <footer className="flex items-center justify-end gap-3">
          {step === "edit" && (
            <>
              <button
                onClick={onCancel}
                className="border border-gray-300 text-black font-semibold py-2 px-4 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={onPreview}
                className="bg-black text-white font-semibold py-2 px-4 rounded-md hover:bg-black/90"
              >
                Preview
              </button>
            </>
          )}

          {step === "execute" && (
            <button
              onClick={onExecute}
              className="bg-emerald-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-emerald-700"
            >
              Execute
            </button>
          )}
        </footer>
      </div>
    </main>
  )
}
