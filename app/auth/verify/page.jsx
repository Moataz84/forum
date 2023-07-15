"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import logout from "@/utils/actions/auth/logout"
import VerifyCode from "@/app/components/VerifyCode"
import ChangeEmail from "@/app/components/ChangeEmail"

export default function VerifyPage() {
  const router = useRouter()
  const [page, setPage] = useState("verify")
  const [sent, setSent] = useState(false)
  const [time, setTime] = useState(60)

  useEffect(() => {
    if (sent) {
      const timeout = setTimeout(() => setTime(time - 1), 1000)
      if (time === 0) {
        clearTimeout(timeout)
        setSent(false)
        setTime(60)
      }
    }
  }, [time, sent])

  async function back() {
    await logout()
    router.push("/auth/login")
  }

  return (
    <div className="auth-container">
      <button className="back-to-login" onClick={back}>Back to Login</button>
      {
        page === "verify" ? 
          <VerifyCode setPage={setPage} sent={sent} setSent={setSent} time={time} setTime={setTime} /> 
        :
          <ChangeEmail setPage={setPage} />
      }
    </div>
  )
}