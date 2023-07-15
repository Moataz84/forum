import getUser from "@/utils/functions/user"
import Profile from "@/app/components/Settings/Profile"
import Account from "@/app/components/Settings/Account"
import Password from "@/app/components/Settings/Password"
import "@/app/styles/settings.css"

export const metadata = {
  title: "Settings"
}

export default async function SettingsPage() {
  const user = await getUser()

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <Profile user={user} />
      <Account user={user} />
      <Password user={user} />
    </div>
  )
}