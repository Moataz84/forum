import { getShortDate } from "@/utils/functions/date"
import getDateJoined from "@/utils/functions/joined"
import connectDB from "@/utils/database"
import Users from "@/utils/Models/Users"
import Posts from "@/utils/Models/Posts"
import Answers from "@/utils/Models/Answers"
import Tags from "@/utils/Models/Tags"
import Link from "next/link"
import "@/app/styles/users.css"

export default async function UserPage({ params }) {
  await connectDB()
  const user = await Users.findOne({username: params.user})
  let answers
  const questions = await Posts.find({postedBy: user.id}).sort({createdAt: -1}).limit(10)
  if (questions.length < 10) {
    answers = await Answers.find({answerId: {$in: user.answers}}).sort({createdAt: -1}).
    limit(10 - questions.length)
    const questionAnswers = await Posts.find({postId: {$in: answers.map(answer => answer.postId)}})
    answers = answers.map(answer => ({
      answer: true,
      ...answer._doc, 
      ...questionAnswers.find(question => question.postId === answer.postId)._doc,
      createdAt: answer._doc.answeredAt
    }))
  }
  const posts = [...questions, ...answers].sort((a, b) => b.createdAt - a.createdAt)

  const topTags = await Tags.aggregate([
    {$match: {users: user.id}},
    {
      $addFields: {
        questions: {$size: {$filter: {input: "$users", as: "u", cond: {$eq: ["$$u", user.id]}}}}
      }
    },
    {$sort: {questions: -1}}
  ]).limit(6)  

  return (
    <div className="user-profile">
      <div className="profile-sec profile-info">
        <h2>Profile</h2>
        <div>
          <Link href={`/users/${params.user}`}>
            <img src={user.profile.pictureUrl} />
          </Link>
          <h2>{user.name}</h2>
          <p>{getDateJoined(user.joined)}</p>
        </div>
      </div>

      <div className="profile-sec profile-stats">
        <h2>Stats</h2>
        <div>
          <p>{user.reputation.toLocaleString("en-US")} reputation</p>
          <p>{user.questions.length} question{user.questions.length !== 1? "s" : ""}</p>
          <p>{user.answers.length} answer{user.answers.length !== 1? "s" : ""}</p>
        </div>
      </div>
      
      <div className="profile-sec profile-tags">
        <h2>Tags</h2>
        <div>
          {!topTags.length? <p className="no-items">This user has no tags.</p> :
          topTags.map(tag => (
            <div className="tag-info">
              <Link href={`/tags/${tag.value}`}>{tag.value}</Link>
              <p>{tag.questions} question{tag.questions !== 1? "s" : ""}</p>
            </div>
          ))}
        </div>
        <p>View all <Link href={`/users/${params.user}/tags`}>Tags</Link>.</p>
      </div>

      <div className="profile-sec profile-posts">
        <h2>Posts</h2>
        <div>
          {!posts.length? <p className="no-items">This user has no posts.</p> :
          posts.map(post => (
            <div className="post-info">
              <p className="type">{post.answer? "A" : "Q"}</p>
              <Link href={`/questions/${post.postId}${post.answer? `#${post.answerId}` : ""}`}>{post.title}</Link>
              <p className="date">{getShortDate(post.createdAt)}</p>
            </div>
          ))}          
        </div>
        <p>View all <Link href={`/users/${params.user}/questions`}>Questions</Link> or <Link href={`/users/${params.user}/answers`}>Answers</Link>.</p>
      </div>
    </div>
  )
}