"use client"

import { useState, useEffect } from "react"
import { getMe } from "@/lib/api"

export type CurrentUser = {
  id: number
  name: string
  email: string
  avatarUrl: string | null
  globalRole: string
  accessToken: string
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("mg_token")
    if (!token) {
      setLoading(false)
      return
    }
    getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("mg_token")
      })
      .finally(() => setLoading(false))
  }, [])

  function logout() {
    localStorage.removeItem("mg_token")
    setUser(null)
    window.location.href = "/auth/login"
  }

  return { user, loading, logout }
}
