"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Spinner } from "@/components/ui/spinner"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (session) {
      router.push("/select-academic-year")
    } else {
      router.push("/auth/login")
    }
  }, [session, status, router])

  return (
    <Spinner size="2xl" label="Loading BlueMoon SDMS..." fullScreen />
  )
}
