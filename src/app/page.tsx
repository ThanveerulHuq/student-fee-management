"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import LoaderOne from "@/components/ui/loader-one"

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
    <div className="flex items-center justify-center h-screen">
      <LoaderOne />
    </div>
  )
}
