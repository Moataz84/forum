"use server"
import { headers } from "next/headers"
import { v4 } from "uuid"
import { hash } from "bcrypt"
import Users from "@/utils/Models/Users"
import sendEmail from "@/utils/functions/email"
import connectDB from "@/utils/database"

export async function verifyEmail(email) {
  await connectDB()
  const user = await Users.findOne({email, deactivated: false})
  if (user === null) return "This account does not exist."
  const forgotPasswordCode = v4().toString().replace(/-/g, "")
  await Users.findOneAndUpdate({email, deactivated: false}, {$set: {forgotPasswordCode}})
  sendEmail(email, "Forgot Password", `This is a link to reset your password: ${headers().get("referer")}?email=${email}&id=${forgotPasswordCode}.`)
  return "A link to reset your password has been sent to your email."
}

export async function resetPassword(password) {
  await connectDB()
  const { email } = JSON.parse(decodeURIComponent(headers().get("x-invoke-query"))) 
  const hashedPassword = await hash(password, 10)
  await Users.findOneAndUpdate({email, deactivated: false}, {$set: {password: hashedPassword}})
}