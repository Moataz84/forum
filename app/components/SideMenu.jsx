"use client"
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { BsPeople, BsPeopleFill } from "react-icons/bs"
import { 
  AiFillTags, 
  AiOutlineTags, 
  AiFillHome, 
  AiOutlineHome, 
  AiFillQuestionCircle, 
  AiOutlineQuestionCircle 
} from "react-icons/ai"
import "@/app/styles/globals.css"

export default function SideMenu() {
  const router = useRouter()
  const path = usePathname()

  useEffect(() => router.refresh(), [path])

  if (path.startsWith("/auth")) return (<></>)
  return (
    <div className="side-menu">
      <Link href="/">
        {path === "/"? <AiFillHome size={20} /> : <AiOutlineHome size={20} />}
        Home
      </Link>
      <Link href="/questions">
        {path.startsWith("/questions")? <AiFillQuestionCircle size={20} /> : <AiOutlineQuestionCircle size={20} />}
        Questions
      </Link>
      <Link href="/users">
        {path.startsWith("/users")? <BsPeopleFill size={20} /> : <BsPeople size={20} />}
        Users
      </Link>
      <Link href="/tags">
        {path.startsWith("/tags")? <AiFillTags size={20} /> : <AiOutlineTags size={20} />}
        Tags
      </Link>
    </div>
  )
}