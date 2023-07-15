import { headers } from "next/headers"
import getDateJoined from "@/utils/functions/joined"
import connectDB from "@/utils/database"
import Users from "@/utils/Models/Users"
import Tags from "@/utils/Models/Tags"
import Link from "next/link"
import Pagination from "@/app/components/Pagination"
import "@/app/styles/users.css"

const limit = 20

export default async function UserPageTags({ params }) {
  await connectDB()
  const user = await Users.findOne({username: params.user})
  const { page } = JSON.parse(decodeURIComponent(headers().get("x-invoke-query")))
  let number = !isNaN(parseInt(page))? parseInt(page) : 1
  if (number <= 0) number = 1

  const [tags, totalTags] = await Promise.all([
    Tags.aggregate([
      {$match: {users: user.id}},
      {$project: {value: 1, questions: {$size: "$questions"}}}, 
      {$sort: {questions: -1}}
    ]).skip((number - 1) * limit).limit(limit),
    Tags.countDocuments({users: {$in: user.id}})
  ])
  const pages = Math.ceil(totalTags / limit)
  
  return (
    <div className="user-profile items-list">
      <div className="profile-wrapper">
        <div className="profile-sec profile-info">
          <div>
            <Link href={`/users/${params.user}`}>
              <img src={user.profile.pictureUrl} />
            </Link>
            <h2>{user.name}</h2>
            <p>{getDateJoined(user.joined)}</p>
          </div>
        </div>
        <div className="profile-sec profile-tags" style={{flex: 1}}>
          <h2>Tags</h2>
          <div>
            {!tags.length? <p className="no-items">This user has no tags.</p> : 
            tags.map(tag => (
              <div className="tag-info">
                <Link href={`/tags/${tag.value}`}>{tag.value}</Link>
                <p>{tag.questions} question{tag.questions !== 1? "s" : ""}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {tags.length > 0? 
        <Pagination number={number} pages={pages} page={`/users/${params.user}/tags`} /> 
      : <></>}
    </div>
  )
}