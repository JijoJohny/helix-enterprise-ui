"use client"
import { useMemo, useState } from "react"
import { set } from "date-fns"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

function toUnixSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000)
}

export default function CreateRafflePage() {
  // Prize in AVAX
  const [prizeAvax, setPrizeAvax] = useState<string>("")
  // Date selection
  const [date, setDateState] = useState<Date | undefined>(new Date())
  // Time selection (hour, minute)
  const [hour, setHour] = useState<string>("12")
  const [minute, setMinute] = useState<string>("00")

  const scheduledAt: Date | undefined = useMemo(() => {
    if (!date) return undefined
    const h = Number.parseInt(hour || "0", 10)
    const m = Number.parseInt(minute || "0", 10)
    const base = set(date, { hours: h, minutes: m, seconds: 0, milliseconds: 0 })
    return base
  }, [date, hour, minute])

  const scheduledUnix = scheduledAt ? toUnixSeconds(scheduledAt) : undefined

  const onExecute = () => {
    if (!prizeAvax || !scheduledUnix) {
      alert("Please enter prize amount and pick a date/time.")
      return
    }
    // TODO: hook up to smart contract execute call
    alert(`Execute raffle\nPrize: ${prizeAvax} AVAX\nTime (UNIX): ${scheduledUnix}`)
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-center text-3xl font-semibold md:text-4xl">Create Raffle</h1>
      <p className="mt-2 text-center text-white/70">
        Prizes are denominated in AVAX. Your wallet will auto-switch to Avalanche.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader>
            <CardTitle>Prize</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-white/80">Amount (AVAX)</label>
              <div className="flex items-center gap-2">
                <Input
                  inputMode="decimal"
                  type="number"
                  step="0.0001"
                  min="0"
                  placeholder="e.g., 1.5"
                  value={prizeAvax}
                  onChange={(e) => setPrizeAvax(e.target.value)}
                  className="bg-transparent text-white caret-white placeholder:text-white/50 border-white/20 focus-visible:ring-white/30 focus-visible:ring-offset-0"
                />
                <span className="shrink-0 rounded-md bg-white/10 px-2 py-1 text-sm">AVAX</span>
              </div>
              <p className="mt-1 text-xs text-white/60">Native currency on Avalanche C-Chain.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  <Calendar mode="single" selected={date} onSelect={setDateState} initialFocus />
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

            <div className="rounded-md bg-white/5 p-3 text-sm">
              <div>Scheduled: {scheduledAt ? scheduledAt.toLocaleString() : "-"}</div>
              <div>UNIX: {scheduledUnix ?? "-"}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <a href="/" className="text-white/70 underline underline-offset-4">
          Cancel
        </a>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
            Preview
          </Button>
          <Button onClick={onExecute} className="bg-white text-black hover:bg-gray-200">
            Execute
          </Button>
        </div>
      </div>
    </div>
  )
}
