"use server"
import { cookies } from "next/headers"
import { hash } from "bcrypt"
import { v4 } from "uuid"
import { sign } from "jsonwebtoken"
import Users from "@/utils/Models/Users"
import sendEmail from "@/utils/functions/email"
import connectDB from "@/utils/database"

export default async function signup(name, username, email, password) {
  await connectDB()
  const check = await Users.find({$or: [{email, deactivated: false}, {username}]})
  const usernameCheck = check.some(entry => entry.username === username)
  const emailCheck = check.some(entry => entry.email === email)

  if (usernameCheck) return "This username already exists."
  if (emailCheck) return "This email address is already in use."

  const hashedPassword = await hash(password, 10)
  const code = v4().replace(/\D/g,"").substring(0, 6)
  const forgotPasswordCode = v4().toString().replace(/-/g, "")
  const profile = {
    pictureUrl: "https://ik.imagekit.io/pk4i4h8ea/forum/profiles/no-profile.jpg",
    pictureId: "64b4b6b406370748f22ce77e"
  }
  const user = new Users({
    name, 
    username, 
    email, 
    password: hashedPassword,
    code,
    verified: false,
    forgotPasswordCode,
    joined: new Date().getTime(),
    reputation: 1,
    profile,
    questions: [],
    answers: [],
    deactivated: false
  }).save()

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
  sendEmail(email, "Verification Code", `Your verification code is ${code}.`)
  return "success"
}