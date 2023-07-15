"use server"
import { cookies } from "next/headers"

export default async function logout() {
  cookies().set({
    name: "JWT-Token",
    value: "deleted",
    maxAge: -1,
  })
}