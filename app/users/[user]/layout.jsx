import connectDB from "@/utils/database"
import Users from "@/utils/Models/Users"
import NotFound from "@/app/components/NotFound"

export async function generateMetadata({ params }) {
  await connectDB()
  if (params.username === "user") return {title: "Not Found"}
  const user = await Users.findOne({username: params.user, deactivated: false})
  return { 
    title: user? `Users - ${params.user}` : "Not found"
  }
}

export default async function Layout({ children, params }) {
  await connectDB()
  if (params.username === "user") return <NotFound />
  const user = await Users.findOne({username: params.user, deactivated: false})
  if (!user) return <NotFound />
  return children
}