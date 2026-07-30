import clientPromise from "./config/db"
import bcrypt from "bcryptjs"

export async function validateUserCredentials(credentials: Record<string, string> | undefined) {
  if (!credentials?.email || !credentials?.password) return null


  const client = await clientPromise
  const db = client.db()
  

  const user = await db.collection("users").findOne({ email: credentials.email })
  if (!user || !user.password) return null 


  const isValid = await bcrypt.compare(credentials.password, user.password)
  if (!isValid) return null

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    image: user.image
  }
}
