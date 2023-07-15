import { headers } from "next/headers"
import Users from "@/utils/Models/Users"
import VerifyEmail from "@/app/components/VerifyEmail"
import ResetPassword from "@/app/components/ResetPassword"

async function verifyCode() {
  const { id, email } = JSON.parse(decodeURIComponent(headers().get("x-invoke-query")))
  if (!id || !email) return false
  const user = await Users.findOne({email, deactivated: false})
  if (user.forgotPasswordCode !== id) return false
  return true
}

export const metadata = {
  title: "Forgot Password"
}

export default async function ForgotPasswordPage() {
  const isVerified = await verifyCode()
  return (
    <div className="auth-container">
      { !isVerified? <VerifyEmail /> : <ResetPassword /> }
    </div>
  )
}