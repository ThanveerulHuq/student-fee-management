import "next-auth"

declare module "next-auth" {
  interface User {
    username: string
    role: string
  }

  interface Session {
    user: {
      id: string
      username: string
      role: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string
    role: string
  }
}