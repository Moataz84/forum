"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Input from "@/app/components/Input"
import login from "@/utils/actions/auth/login"
import "@/app/styles/auth.css"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function loginClient(e) {
    e.preventDefault()
    setError("")
    if (!email || !password) {
      setError("All fields are required.")
      return
    }
    setLoading(true)
    const data = await login(email.toLowerCase().replace(/\s/g, ""), password)
    setLoading(false)
    if (data !== "success") {
      setError(data)
      return
    }
    router.push("/")
  }

  return (
    <div className="auth-container">
      <form className="login">
        { loading? <div className="loading"></div> : <></> }
        <h2>Sign In</h2>
        <Input name="Email" type="email" value={email} setValue={setEmail} setMsg={setError} />
        <Input name="Password" type="password" value={password} setValue={setPassword} setMsg={setError} />
        <Link href="/auth/forgot-password" className="forgot">Forgot Password</Link>
        <button onClick={loginClient}>Sign In</button>
        <p className="account">Don"t have an account yet, <Link href="/auth/signup">Sign Up</Link>.</p>
        <p className="error-msg">{error}</p>
      </form>
    </div>
  )
}