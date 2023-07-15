"use client"
import { useState } from "react"
import { BsArrowLeft } from "react-icons/bs"
import { changeEmail } from "@/utils/actions/auth/verify"
import Input from "@/app/components/Input"
import "@/app/styles/auth.css"

export default function ChangeEmail({ setPage }) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  async function changeEmailClient(e) {
    e.preventDefault()
    setError("")
    if (!email) {
      setError("All fields are required.")
      return
    }
    setLoading(true)
    const data = await changeEmail(email)
    setLoading(false)
    setError(data)
  }

  return (
    <form className="verify">
      { loading? <div className="loading"></div> : <></> }
      <h2>Verify Account</h2>
      <div className="back" onClick={() => setPage("verify")}>
        <BsArrowLeft size={24} />
        Verify Code
      </div>
      <Input name="Email" type="email" value={email} setValue={setEmail} setMsg={setError} />
      <button onClick={changeEmailClient}>Submit</button>
      <p className="error-msg" style={{color: error.includes("successfully")? "#000" : ""}}>{error}</p>
    </form>
  )
}