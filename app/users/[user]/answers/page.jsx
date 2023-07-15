import { headers } from "next/headers"
import getDateJoined from "@/utils/functions/joined"
import { getShortDate } from "@/utils/functions/date"
import connectDB from "@/utils/database"
import Users from "@/utils/Models/Users"
import Posts from "@/utils/Models/Posts"
import Answers from "@/utils/Models/Answers"
import Link from "next/link"
import Pagination from "@/app/components/Pagination"
import "@/app/styles/users.css"

const limit = 20

export default async function UserPageAnswers({ params }) {
  await connectDB()

  const { page } = JSON.parse(decodeURIComponent(headers().get("x-invoke-query")))
  let number = !isNaN(parseInt(page))? parseInt(page) : 1
  if (number <= 0) number = 1

  const user = await Users.findOne({username: params.user})
  let [answers, totalDocuments] = await Promise.all([
    Answers.find({answeredBy: user.id}).sort({score: -1, createdAt: -1}).skip((number - 1) * limit).limit(limit),
    Answers.countDocuments({answeredBy: user.id})
  ])
  const questionAnswers = await Posts.find({postId: {$in: answers.map(answer => answer.postId)}})
  answers = answers.map(answer => ({
    ...answer._doc, 
    title: questionAnswers.find(question => question.postId === answer.postId)._doc.title,
  }))
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
          <h2>Answers</h2>
          <div>
            {!answers.length? <p className="no-items">This user has no answers.</p> : 
            answers.map(answer => (
              <div className="post-info">
                <Link href={`/questions/${answer.postId}#${answer.answerId}`} style={{gridColumn: "1 / 3"}}>
                  {answer.title}
                </Link>
                <p className="date">{getShortDate(answer.answeredAt)}</p>
              </div>
            ))}    
          </div>
        </div>
      </div>
      {answers.length > 0? 
        <Pagination number={number} pages={pages} page={`/users/${params.user}/answers`} /> 
      : <></>}
    </div>
  )
}