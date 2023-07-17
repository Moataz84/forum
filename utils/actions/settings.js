"use server"
import { cookies } from "next/headers"
import { v4 } from "uuid"
import { compare, hash } from "bcrypt"
import imagekit from "@/utils/imagekit"
import Users from "@/utils/Models/Users"
import connectDB from "@/utils/database"
import sendEmail from "@/utils/functions/email"

export async function changeProfile(dataurl, id) {
  await connectDB()
  imagekit.upload({
    file: dataurl,
    fileName: v4(),
    folder: `forum/profiles`
  }, async (e, result) => {
    const profile = {
      pictureUrl: result.url,
      pictureId: result.fileId,
    }
    const user = await Users.findOneAndUpdate({_id: id}, {$set: {profile}})
    const pictureId = user.profile.pictureId
    if (pictureId !== "64b4b6b406370748f22ce77e") await imagekit.deleteFile(pictureId)
  })
}

export async function removeProfile(id) {
  await connectDB()
  const profile = {
    pictureUrl: "https://ik.imagekit.io/pk4i4h8ea/forum/profiles/no-profile.jpg",
    pictureId: "64b4b6b406370748f22ce77e"
  }
  const user = await Users.findOneAndUpdate({_id: id}, {$set: {profile}})
  try {
    if (user.profile.pictureId !== "64b4b6b406370748f22ce77e") await imagekit.deleteFile(user.profile.pictureId)
  } catch {}
}

export async function changeName(id, name) {
  await connectDB()
  await Users.findOneAndUpdate({_id: id}, {$set: {name}})
}

export async function changeUsername(id, username) {
  await connectDB()
  const exists = await Users.find({username})
  if (exists.length) return "This username is already in use."
  await Users.findOneAndUpdate({_id: id}, {$set: {username}})
}

export async function changeEmail(id, email) {
  await connectDB()
  const exists = await Users.find({email})
  if (exists.length) return "This email is already in use."
  const code = v4().replace(/\D/g,"").substring(0, 6)
  await Users.findOneAndUpdate({_id: id}, {$set: {email, code, verified: false}})
  const message = "Your email has been updated successfully. Note: you will be prompted to verify " + 
  "your email the next time you login to your account."
  sendEmail(email, "Email Updated", `${message} Your verification code is ${code}.`)
  return message
}

export async function changePassword(id, password, newPassword) {
  await connectDB()
  const user = await Users.findOne({_id: id})
  const result = await compare(password, user.password)
  if (!result) return "The password you entred is incorrect."
  const hashedPassword = await hash(newPassword, 10)
  await Users.findOneAndUpdate({_id: id}, {$set: {password: hashedPassword}})
}

export async function deleteAccount(id) {
  cookies().set({
    name: "JWT-Token",
    value: "deleted",
    maxAge: -1,
  })
  const profile = {
    pictureUrl: "https://ik.imagekit.io/pk4i4h8ea/forum/profiles/no-profile.jpg",
    pictureId: "64b4b6b406370748f22ce77e"
  }
  const user = await Users.findOneAndUpdate(
    {_id: id}, 
    {$set: {deactivated: true, name: "User", username: "user", profile}}
  )
  const pictureId = user.profile.pictureId
  if (pictureId !== "64b4b6b406370748f22ce77e") await imagekit.deleteFile(pictureId)
}