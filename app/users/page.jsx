import { headers } from "next/headers"
import formatReputation from "@/utils/functions/reputation"
import connectDB from "@/utils/database"
import Users from "@/utils/Models/Users"
import Link from "next/link"
import NotFound from "@/app/components/NotFound"
import Pagination from "@/app/components/Pagination"
import "@/app/styles/users.css"

const limit = 20

async function getUsers() {
  await connectDB()
  const { page } = JSON.parse(decodeURIComponent(headers().get("x-invoke-query")))
  let number = !isNaN(parseInt(page))? parseInt(page) : 1
  if (number <= 0) number = 1

  const [users, totalDocuments] = await Promise.all([
    Users.find({deactivated: false}).sort({reputation: -1}).skip((number - 1) * limit).limit(limit),
    Users.countDocuments({deactivated: false})
  ])
  return {users, totalDocuments, number}
}

export async function generateMetadata() {
  const { users, number } = await getUsers()
  return {
    title: users.length === 0? "Not found" : `Users - Page ${number}`
  }
}

export default async function UsersPage() {
  const { users, totalDocuments, number } = await getUsers()
  if (users.length === 0) return <NotFound />
  const pages = Math.ceil(totalDocuments / limit)

  return (
    <div className="users-container">
      <h2>Users ({totalDocuments})</h2>
      <div className="users-list">
        {users.map(user => (
          <div className="user-item" key={user.id}>
            <Link href={`/users/${user.username}`}>
              <img src={user.profile.pictureUrl} />
            </Link>
            <div className="user-info">
              <p>{user.name}</p>
              <Link href={`/users/${user.username}`}>{user.username}</Link>
              <p>{formatReputation(user.reputation)}</p>
            </div>
          </div>
        ))}
      </div>
      <Pagination number={number} pages={pages} page="/users" />
    </div>
  )
}