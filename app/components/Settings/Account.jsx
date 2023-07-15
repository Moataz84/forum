"use client"
import { useState } from "react"
import { changeEmail } from "@/utils/actions/settings"
import "@/app/styles/settings.css"

export default function Account({ user }) {
  const [orgEmail, setOrgEmail] = useState(user.email)
  const [email, setEmail] = useState(user.email)
  const [error, setError] = useState("")

  async function update(e) {
    e.preventDefault()
    setError("")
    if (orgEmail === email) return
    if (!email) {
      setError("This feild is required.")
      return
    }
    setOrgEmail(email)
    const data = await changeEmail(user.id, email.toLowerCase().replace(/\s/g, ""))
    setError(data)
  }

  return (
    <form>
      <label>Email</label>
      <input type="email" value={email} 
        onChange={e => setEmail(e.target.value)} onFocus={() => setError("")} 
      />
      <button onClick={update}>Update</button>
      <p className="error" style={{color: error.includes("success")? "#000" : null}}>{error}</p>
    </form>
  )
}