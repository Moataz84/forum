"use client"
import { useState, useRef, useEffect } from "react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { BsSearch, BsPerson } from "react-icons/bs"
import { FiSettings, FiLogOut } from "react-icons/fi"
import { IoCloseOutline } from "react-icons/io5"
import logout from "@/utils/actions/auth/logout"
import Link from "next/link"
import "@/app/styles/globals.css"

export default function Menu({ user }) {
  const path = usePathname()
  const query = useSearchParams().get("q")
  const router = useRouter()
  const searchRef = useRef()
  const tipsRef = useRef()
  const inputRef = useRef()
  const [search, setSearch] = useState("")

  useEffect(() => {
    router.refresh()
    if (path === "/search" && query) {
      setSearch(query)
      return
    }
    setSearch("")
  }, [path])

  async function logoutClient() {
    await logout()
    router.push("/auth/login")
  }

  if (path === "/auth/verify") return <></>
  return (
    <nav>
      <Link href="/" className="logo">Stack<span>Share</span></Link>
      <div className="search-bar" ref={searchRef}>
        <BsSearch color="#808080" />
        <input type="text" value={search} placeholder="Search for anything" ref={inputRef}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => {
            searchRef.current.classList.add("focused")
            tipsRef.current.style.display = "grid"
          }}
          onBlur={() => {
            if (!document.hasFocus()) return
            searchRef.current.classList.remove("focused")
            tipsRef.current.style.display = "none"
          }}
          onKeyDown={e => {
            if (e.key !== "Enter" || !search.length) return
            router.push(`/search?q=${search}`)
            e.target.blur()
          }}
        />
        {
          !search.length? null: 
          <IoCloseOutline size={24} style={{color: "#808080" , cursor: "pointer"}} onClick={() => {
            setSearch("")
            inputRef.current.focus()
          }} />
        }
        <div className="search-tips" ref={tipsRef}>
          <p>some phrase <span>General Search</span></p>
          <p>tag:html <span>Search by Tag</span></p>
          <p>user:moataz44 <span>Search by User</span></p>
          <p>users:moataz44 <span>Search for Users</span></p>
        </div>
      </div>
      {
        user === false?
          <>
            <Link href="/auth/login" className="login-btn">Login</Link>
            <Link href="/auth/signup" className="signup-btn">Sign Up</Link>
          </>
        :
          <>
            <Link className="profile-pic" href={`/users/${user.username}`} style={{height: "60px"}}>
              <img src={user.profile.pictureUrl} />
            </Link>
            <div className="dropdown">
              <Link href={`/users/${user.username}`}>
                <BsPerson size={20} />
                Profile
              </Link>
              <Link href="/settings">
                <FiSettings size={20} />
                Settings
              </Link>
              <button onClick={logoutClient}>
                <FiLogOut size={20} /> 
                Logout
              </button>
            </div>
          </>
      }
    </nav>
  )
}