"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Input from "@/app/components/Input"
import signup from "@/utils/actions/auth/signup"
import "@/app/styles/auth.css"

export default function SignupPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function signupClient(e) {
    e.preventDefault()
    setError("")
    if (!username || !email || !password || !repeatPassword) {
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
    const data = await signup(
      name, 
      username.toLowerCase().replace(/\s/g, ""), 
      email.toLowerCase().replace(/\s/g, ""), 
      password
    )
    setLoading(false)
    if (data !== "success") {
      setError(data)
      return
    }
    router.push("/auth/verify")
  }

  return (
    <div className="auth-container">
      <form className="signup">
        { loading? <div className="loading"></div> : <></> }
        <h2>Sign Up</h2>
        <Input name="Name" type="text" value={name} setValue={setName} setMsg={setError} />
        <Input name="Username" type="text" value={username} setValue={setUsername} setMsg={setError} />
        <Input name="Email" type="email" value={email} setValue={setEmail} setMsg={setError} />
        <Input name="Password" type="password" value={password} setValue={setPassword} setMsg={setError} />
        <Input name="Repeat Password" type="password" value={repeatPassword} setValue={setRepeatPassword} setMsg={setError} />
        <p className="account">Already have an account, <Link href="/auth/login">Sign In</Link>.</p>
        <button onClick={signupClient}>Sign Up</button>
        <p className="error-msg">{error}</p>
      </form>
    </div>
  )
}