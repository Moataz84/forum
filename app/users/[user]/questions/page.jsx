import { headers } from "next/headers"
import getDateJoined from "@/utils/functions/joined"
import { getShortDate } from "@/utils/functions/date"
import connectDB from "@/utils/database"
import Users from "@/utils/Models/Users"
import Posts from "@/utils/Models/Posts"
import Link from "next/link"
import Pagination from "@/app/components/Pagination"
import "@/app/styles/users.css"

const limit = 20

export default async function UserPageQuestions({ params }) {
  await connectDB()

  const { page } = JSON.parse(decodeURIComponent(headers().get("x-invoke-query")))
  let number = !isNaN(parseInt(page))? parseInt(page) : 1
  if (number <= 0) number = 1

  const user = await Users.findOne({username: params.user})
  const [questions, totalDocuments] = await Promise.all([
    Posts.find({postedBy: user.id}).sort({score: -1, createdAt: -1}).skip((number - 1) * limit).limit(limit),
    Posts.countDocuments({postedBy: user.id})
  ])
  const pages = Math.ceil(totalDocuments / limit)
  
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
        <div className="profile-sec profile-posts" style={{flex: 1}}>
          <h2>Questions</h2>
          <div>
            {!questions.length? <p className="no-items">This user has no questions.</p> : 
            questions.map(post => (
              <div className="post-info">
                <Link href={`/questions/${post.postId}`} style={{gridColumn: "1 / 3"}}>{post.title}</Link>
                <p className="date">{getShortDate(post.createdAt)}</p>
              </div>
            ))}    
          </div>
        </div>
      </div>
      {questions.length > 0? 
        <Pagination number={number} pages={pages} page={`/users/${params.user}/questions`} />
      : <></>}
    </div>
  )
}