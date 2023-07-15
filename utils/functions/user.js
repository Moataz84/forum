import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import Users from "@/utils/Models/Users"
import connectDB from "@/utils/database"

export default async function getUser() {
  await connectDB()
  try {
    const result = verify(cookies().get("JWT-Token").value, process.env.ACCESS_TOKEN)
    const res = await Users.findOne({_id: result.user.id})
    const profile = {
      id: res.id,
      name: res.name,
      username: res.username,
      email: res.email,
      profile: res.profile,
      reputation: res.reputation
    }
    return profile
  } catch {
    return false
  }
}