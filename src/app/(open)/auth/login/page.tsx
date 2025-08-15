"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { trackLogin, trackLoginFailed } from "@/lib/analytics"
import { getSchoolConfigFromEnv } from "@/lib/schools/config"

const schoolConfig = getSchoolConfigFromEnv()

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setErrorMessage("Invalid username or password")
        trackLoginFailed("invalid_credentials")
      } else {
        trackLogin("credentials")
        router.push("/select-academic-year")
      }
    } catch {
      setErrorMessage("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {schoolConfig.header.showLogo && (
            <div className="flex justify-center mb-4">
              <Image
                src={schoolConfig.header.logoPath}
                alt={`${schoolConfig.shortName} Logo`}
                width={parseInt(schoolConfig.header.logoSize?.width || '60px')}
                height={schoolConfig.header.logoSize?.height === 'auto' ? 60 : parseInt(schoolConfig.header.logoSize?.height || '60px')}
                className="object-contain"
                priority
              />
            </div>
          )}
          <CardTitle className="text-2xl font-bold">{schoolConfig.shortName}</CardTitle>
          <CardDescription>
            School Data Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                {errorMessage}
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}