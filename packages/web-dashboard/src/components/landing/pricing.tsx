"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "motion/react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Starter",
    monthlyPrice: "Free",
    annualPrice: "Free",
    period: "during beta",
    text: "For individual maintainers and small teams validating the workflow.",
    features: ["50 reviews / month", "GitHub OAuth", "Live review stream"],
    highlighted: false,
    bg: "bg-[#c9fe87] border-[#a8e85a] dark:bg-[#166534]/30 dark:border-[#166534]/50",
    shadow: "",
    nameColor: "text-green-950 dark:text-white",
    descColor: "text-green-900/70 dark:text-zinc-400",
    priceColor: "text-green-950 dark:text-white",
    periodColor: "text-green-900/60 dark:text-zinc-500",
    featureColor: "text-green-950/80 dark:text-zinc-300",
    checkBg: "bg-green-950/10 dark:bg-white/10",
    checkColor: "text-green-950 dark:text-green-300",
  },
  {
    name: "Team",
    monthlyPrice: "$49",
    annualPrice: "$39",
    period: "/ seat / mo",
    text: "For teams that need policy enforcement across active repositories.",
    features: ["Unlimited reviews", "Custom gates", "Scoped API keys", "Priority support"],
    highlighted: true,
    bg: "bg-[#9885fa] border-[#7c5cf6] dark:bg-[#7c3aed]/40 dark:border-[#7c3aed]/60",
    shadow: "shadow-[0_20px_60px_rgba(152,133,250,0.4)] dark:shadow-[0_20px_60px_rgba(152,133,250,0.2)]",
    nameColor: "text-white",
    descColor: "text-white/75",
    priceColor: "text-white",
    periodColor: "text-white/60",
    featureColor: "text-white/85",
    checkBg: "bg-white/20",
    checkColor: "text-white",
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    period: "",
    text: "For organizations with compliance, SSO, and deployment constraints.",
    features: ["SAML SSO", "Audit exports", "Dedicated support", "Custom SLA"],
    highlighted: false,
    bg: "bg-[#ffd66c] border-[#f5c430] dark:bg-[#92400e]/30 dark:border-[#92400e]/50",
    shadow: "",
    nameColor: "text-amber-950 dark:text-white",
    descColor: "text-amber-900/70 dark:text-zinc-400",
    priceColor: "text-amber-950 dark:text-white",
    periodColor: "text-amber-900/60 dark:text-zinc-500",
    featureColor: "text-amber-950/80 dark:text-zinc-300",
    checkBg: "bg-amber-950/10 dark:bg-white/10",
    checkColor: "text-amber-950 dark:text-amber-300",
  },
]

export function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="relative border-b border-black/6 py-24 overflow-hidden dark:border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-[#9885fa]/5 via-background to-background pointer-events-none dark:hidden" />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 to-background pointer-events-none hidden dark:block" />
      <div aria-hidden className="absolute left-1/4 top-1/2 size-[400px] rounded-full bg-[#c9fe87]/15 blur-[120px] pointer-events-none dark:hidden" />
      <div aria-hidden className="absolute right-1/4 top-1/3 size-[400px] rounded-full bg-[#ffd66c]/15 blur-[120px] pointer-events-none dark:hidden" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center mb-12"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-[#7c3aed] dark:text-[#c4b5fd] mb-4">Pricing</p>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl leading-tight dark:text-white">
            Start with the shell,{" "}
            <span style={{
              background: "linear-gradient(135deg, #9885fa 0%, #6cb8ff 60%, #c9fe87 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              scale into policy.
            </span>
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-500 dark:text-zinc-400">
            The mock experience shows how the product will package reviews, governance, and support.
          </p>

          {/* Toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={cn("text-sm font-medium transition-colors", !annual ? "text-foreground dark:text-white" : "text-zinc-400 dark:text-zinc-500")}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual((v) => !v)}
              role="switch"
              aria-checked={annual}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9885fa] focus-visible:ring-offset-2",
                annual ? "bg-[#9885fa]" : "bg-zinc-300 dark:bg-zinc-700"
              )}
            >
              <span className={cn(
                "inline-block size-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                annual ? "translate-x-6" : "translate-x-1"
              )} />
            </button>
            <span className={cn("text-sm font-medium transition-colors", annual ? "text-foreground dark:text-white" : "text-zinc-400 dark:text-zinc-500")}>
              Annual
              <Badge className="ml-2 bg-[#c9fe87] hover:bg-[#c9fe87] text-green-950 border border-[#a8e85a] font-bold text-xs">
                Save 20%
              </Badge>
            </span>
          </div>
        </motion.div>

        {/* Cards grid — items-stretch so all cards match height */}
        <div className="grid gap-6 lg:grid-cols-3 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className={cn(
                "relative flex flex-col h-full rounded-3xl border p-8 transition-all duration-300",
                plan.highlighted ? "scale-[1.04] z-10" : "hover:scale-[1.01]",
                plan.bg,
                plan.shadow
              )}
            >
              {/* Most popular badge */}
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <Badge className="rounded-full bg-white hover:bg-white text-[#7c3aed] border-white/20 px-4 py-1 text-xs font-bold uppercase tracking-widest shadow-lg">
                    Most popular
                  </Badge>
                </div>
              )}

              {/* Plan name + desc */}
              <div>
                <p className={cn("text-base font-bold", plan.nameColor)}>{plan.name}</p>
                <p className={cn("mt-2 text-sm leading-6", plan.descColor)}>{plan.text}</p>
              </div>

              {/* Price */}
              <div className="mt-6">
                <div className="flex items-end gap-1">
                  <span className={cn("text-5xl font-extrabold tracking-tight", plan.priceColor)}>
                    {annual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  {plan.period && (
                    <span className={cn("mb-2 text-sm", plan.periodColor)}>{plan.period}</span>
                  )}
                </div>
                {annual && plan.name === "Team" && (
                  <p className="mt-1 text-xs text-white/70 font-medium">Billed annually — save $120/seat/year</p>
                )}
              </div>

              {/* Features — flex-1 pushes CTA to bottom */}
              <ul className="mt-8 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className={cn("flex items-center gap-3 text-sm font-medium", plan.featureColor)}>
                    <span className={cn("flex size-5 flex-shrink-0 items-center justify-center rounded-full", plan.checkBg)}>
                      <Check className={cn("size-3", plan.checkColor)} strokeWidth={3} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA always at bottom */}
              <div className="mt-8">
                {plan.highlighted ? (
                  <Button
                    size="lg"
                    className="w-full rounded-full h-11 bg-white hover:bg-white/90 text-[#7c3aed] font-bold border-0 shadow-md transition-all"
                    asChild
                  >
                    <Link href="/auth/login">Get started</Link>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="ghost"
                    className={cn(
                      "w-full rounded-full h-11 font-bold border transition-all",
                      plan.name === "Starter"
                        ? "border-green-950/20 bg-green-950/10 text-green-950 hover:bg-green-950/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                        : "border-amber-950/20 bg-amber-950/10 text-amber-950 hover:bg-amber-950/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    )}
                    asChild
                  >
                    <Link href="/auth/login">Get started</Link>
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}