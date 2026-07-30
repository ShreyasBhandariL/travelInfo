"use server"
import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import bcrypt from "bcryptjs"
import clientPromise from "../lib/config/db"

export async function googleSignIn() {
  await signIn("google", { redirectTo: "/" }) 
}

export async function googleSignOut() {
    await signOut({redirectTo: '/'});
}

export async function credentialSignUp(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return { error: "Please fill in all fields." }
    }

    const client = await clientPromise
    const db = client.db()

    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return { error: "An account with this email already exists." }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await db.collection("users").insertOne({
      name: email.split("@")[0],
      email: email,
      password: hashedPassword,
      image: null,
      emailVerified: null,
    })

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    })

  } catch (error: any) {
    if (error?.message?.includes("NEXT_REDIRECT")) {
      throw error
    }
    return { error: "Something went wrong during registration. Please try again." }
  }
}


export async function credentialSignIn(formData: FormData) {
try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return { error: "Please fill in all fields." }
    }
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    })
}catch(error){
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." }
        default:
          return { error: "Something went wrong. Please try again." }
      }
    }
    throw error
}
}
