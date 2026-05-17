"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { LogoMark } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-violet-50/30 to-background dark:hidden" />
      <div className="absolute inset-0 bg-background hidden dark:block" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl border border-[#7c5cf6] bg-[#9885fa] dark:bg-[#7c3aed]/30 dark:border-[#7c3aed]/50 p-10 sm:p-16 text-center overflow-hidden relative"
        >
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 size-40 rounded-full border border-white/15 dark:border-white/5" />
          <div className="absolute -bottom-8 -left-8 size-28 rounded-full border border-white/15 dark:border-white/5" />
          <div className="absolute top-8 left-8 size-16 rounded-full border border-white/10 dark:border-white/5" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex justify-center"
          >
            <div className="flex size-16 items-center justify-center rounded-2xl bg-white/20 border border-white/25 shadow-md">
              <LogoMark size="xl" tone="mono" className="size-10 text-white" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold text-white sm:text-5xl leading-tight"
          >
            Ready to ship with confidence?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 mx-auto max-w-2xl text-lg text-white/75 leading-8"
          >
            Explore dashboard state, API-key management, and a live review screen with realistic mocked data. No account required.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="h-12 rounded-full gap-2 px-8 text-base bg-white text-violet-900 border-0 shadow-lg hover:bg-white/90 transition-all font-bold"
                asChild
              >
                <Link href="/dashboard">
                  Open dashboard <ArrowRight className="size-4" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-8 text-base border-white/30 bg-white/15 text-white hover:bg-white/25 transition-all font-semibold"
                asChild
              >
                <Link href="/dashboard/review/rev-2847">View live review</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
