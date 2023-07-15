"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { changePassword, deleteAccount } from "@/utils/actions/settings"
import "@/app/styles/settings.css"

export default function Password({ user }) {
  const router = useRouter()
  const [password, setPassword] = useState()
  const [newPassword, setNewPassword] = useState()
  const [error, setError] = useState("")
  const [show, setShow] = useState(false)

  async function update(e) {
    e.preventDefault()
    setError("")
    if (!password || !newPassword) {
      setError("All feilds are required.")
      return
    }
    if (newPassword.length < 8 || /\s/.test(password)) {
      setError("Password must be at least 8 characters and can not contain spaces.")
      return
    }
    const data = await changePassword(user.id, password, newPassword)
    if (data) {
      setError(data)
      return
    }
    setError("Password updated successfully.")
    setPassword("")
    setNewPassword("")
  }

  async function deleteAcc(e) {
    e.preventDefault()
    const confirmed = confirm("Are you sure you want to delete your account? This action is irreversible.")
    if (!confirmed) return
    await deleteAccount(user.id)
    router.push("/auth/login")
  }

  return (
    <form className="password-settings">
      <label>Current Password</label>
      <input type={!show? "password" : "text"} value={password} 
        onChange={e => setPassword(e.target.value)} onFocus={() => setError("")} 
      />
      <label>New Password</label>
      <input type={!show? "password" : "text"} value={newPassword} 
        onChange={e => setNewPassword(e.target.value)} onFocus={() => setError("")} 
      />
      <label>Show Passwords</label>
      <input type="checkbox" onClick={() => setShow(prev => !prev)}/>
      <button onClick={update}>Update</button>
      <p className="error" style={{color: error.includes("success")? "#000" : null}}>{error}</p>
      <button onClick={deleteAcc}>Delete Account</button>
    </form>  
  )
}