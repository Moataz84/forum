"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { BsArrowLeft } from "react-icons/bs"
import { resend, verify } from "@/utils/actions/auth/verify"
import Input from "@/app/components/Input"
import "@/app/styles/auth.css"

export default function VerifyCode({ setPage, sent, setSent, time }) {
  const router = useRouter()

  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function verifyClient(e) {
    e.preventDefault()
    setError("")
    if (!code) {
      setError("All fields are required.")
      return
    }
    setLoading(true)
    const data = await verify(code)
    setLoading(false)
    if (data !== "success") {
      setError(data)
      return
    }
    router.push("/")
  }

  async function resendClient(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    setSent(true)
    const data = await resend()
    setLoading(false)
    setError(data)
  }

  return (
    <form className="verify">
      { loading? <div className="loading"></div> : <></> }
      <h2>Verify Account</h2>
      <div className="back" onClick={() => setPage("email")}>
        <BsArrowLeft size={24} />
        Change Email
      </div>
      <Input name="Verification Code" type="number" value={code} setValue={setCode} setMsg={setError} />
      {
        !sent? <p className="resend" onClick={resendClient}>Resend Code</p> : <p>Resend Code in {time}s.</p>
      }
      <button onClick={verifyClient}>Verify</button>
      <p className="error-msg" style={{color: error.includes("resent")? "#000" : ""}}>{error}</p>
    </form>
  )
}