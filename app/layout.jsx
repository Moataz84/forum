import { cookies } from "next/headers"
import getUser from "@/utils/functions/user"
import Menu from "@/app/components/Menu"
import Footer from "@/app/components/Footer"
import SideMenu from "@/app/components/SideMenu"
import "@/app/styles/globals.css"

export default async function RootLayout({ children }) {
  const user = await getUser()

  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body>
        <div className="container">
          <Menu user={user} />
          <div className="content">
            <SideMenu />
            {children}
          </div>
          <Footer />
        </div>
      </body>
    </html>
  )
}