"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Input from "@/app/components/Input"
import { resetPassword } from "@/utils/actions/auth/forgot"
import "@/app/styles/auth.css"

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  async function resetPasswordClient(e) {
    e.preventDefault()
    setError("")
    if (!password || !repeatPassword) {
      setError("All fields are required.")
      return
    }

    if (password.length < 8 || /\s/.test(password)) {
      setError("Password must be at least 8 characters and can not contain spaces.")
      return
    }

    if (password !== repeatPassword) {
      setError("Both passwords must match.")
      return
    }
    
    setLoading(true)
    await resetPassword(password)
    setLoading(false)
    router.push("/auth/login")
  }

  return (
    <form className="forgot-form">
      { loading? <div className="loading"></div> : <></> }
      <h2>Forgot Password</h2>
      <Input name="New Password" type="password" value={password} setValue={setPassword} setMsg={setError} />
      <Input name="Repeat New Password" type="password" value={repeatPassword} setValue={setRepeatPassword} setMsg={setError} />
      <button onClick={resetPasswordClient}>Submit</button>
      <p className="error-msg">{error}</p>
    </form>
  )
}