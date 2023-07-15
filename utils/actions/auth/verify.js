"use server"
import { cookies } from "next/headers"
import { verify as verifyToken, sign } from "jsonwebtoken"
import Users from "@/utils/Models/Users"
import sendEmail from "@/utils/functions/email"
import connectDB from "@/utils/database"

export async function verify(code) {
  await connectDB()
  const id = verifyToken(cookies().get("JWT-Token").value, process.env.ACCESS_TOKEN).user.id
  const user = await Users.findOne({_id: id})
  if (user.code !== code) return "The code you enetred is incorrect."
  await Users.findOneAndUpdate({_id: id}, {$set: {verified: true}})

  const token = sign({
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5, 
    user: {
      id, 
      verified: true,
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
  return "success"
}

export async function resend() {
  await connectDB()
  const id = verify(cookies().get("JWT-Token").value, process.env.ACCESS_TOKEN).user.id
  const user = await Users.findOne({_id: id})
  sendEmail(user.email, "Verification Code", `Your verification code is ${user.code}.`)
  return "Your verifaction code has been resent."
}

export async function changeEmail(email) {
  await connectDB()
  const id = verify(cookies().get("JWT-Token").value, process.env.ACCESS_TOKEN).user.id
  const user = await Users.findOneAndUpdate({_id: id}, {$set: {email}})
  sendEmail(email, "Verification Code", `Your verification code is ${user.code}.`)
  return "Email updated successfully."
}