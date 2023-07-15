"use server"
import { cookies } from "next/headers"
import { compare } from "bcrypt"
import { sign } from "jsonwebtoken"
import Users from "@/utils/Models/Users"
import connectDB from "@/utils/database"

export default async function(email, password) {
  await connectDB()
  const user = await Users.findOne({email, deactivated: false})
  if (user === null) return "This account does not exist."
  const result = await compare(password, user.password)
  if (!result) return "The password you entred is incorrect."

  const token = sign({
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5, 
    user: {
      id: user._id, 
      verified: user.verified,
    }
  }, process.env.ACCESS_TOKEN)
  const cookie = {
    name: "JWT-Token",
    value: token,
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 5,
    path: "/"
  }
  cookies().set(cookie)
  cookies().get("JWT-Token")
  return "success"
}