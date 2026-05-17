import { NextResponse } from "next/server"

export function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
  return NextResponse.redirect(`${apiUrl}/auth/github`)
}
