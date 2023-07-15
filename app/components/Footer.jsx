"use client"
import { usePathname } from "next/navigation"
import "@/app/styles/globals.css"

export default function Footer() {
  const path = usePathname()
  if (path === "/auth/verify") return <></>
  
  return <footer>Copyright © {new Date().getFullYear()} StackShare. All Rights Reserved.</footer>
}