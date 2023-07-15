"use client"
import { useState } from "react"
import Input from "@/app/components/Input"
import { verifyEmail } from "@/utils/actions/auth/forgot"
import "@/app/styles/auth.css"

export default function VerifyEmail() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  async function verifyEmailClient(e) {
    e.preventDefault()
    setError("")
    if (!email) {
      setError("All fields are required.")
      return
    }

    setLoading(true)
    const data = await verifyEmail(email)
    setLoading(false)
    setError(data)
  }

  return (
    <form className="forgot-form">
      { loading? <div className="loading"></div> : <></> }
      <h2>Forgot Password</h2>
      <Input name="Email" type="email" value={email} setValue={setEmail} setMsg={setError} />
      <button onClick={verifyEmailClient}>Submit</button>
      <p className="error-msg" style={{color: error.includes("sent")? "#000" : ""}}>{error}</p>
    </form>
  )
}