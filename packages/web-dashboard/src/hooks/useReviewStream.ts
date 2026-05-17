"use client"

import { useEffect, useRef, useState } from "react"
import { getStreamUrl } from "@/lib/api"

export type StreamEvent =
  | {
      type: "agent_progress"
      jobId: number
      status: string
      agentName?: string
      [key: string]: unknown
    }
  | {
      type: "job_completed"
      jobId?: number
      status: string
      findings?: Array<{ agent_name: string; severity: string; content: string }>
    }

export function useReviewStream(reviewId: number, enabled: boolean) {
  const [events, setEvents] = useState<StreamEvent[]>([])
  const [lastEvent, setLastEvent] = useState<StreamEvent | null>(null)
  const [connected, setConnected] = useState(false)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!enabled || !reviewId) return

    const url = getStreamUrl(reviewId)
    const es = new EventSource(url)
    esRef.current = es

    es.onopen = () => setConnected(true)

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as StreamEvent
        setEvents((prev) => [...prev, data])
        setLastEvent(data)
      } catch {
        // ignore malformed frames
      }
    }

    es.onerror = () => {
      setConnected(false)
      es.close()
    }

    return () => {
      es.close()
      setConnected(false)
    }
  }, [reviewId, enabled])

  return { events, lastEvent, connected }
}
