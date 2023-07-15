import { headers } from "next/headers"
import Link from "next/link"
import Posts from "@/utils/Models/Posts"
import Users from "@/utils/Models/Users"
import Post from "@/app/components/Post"
import "@/app/styles/main.css"

export const metadata = {
  title: "Home"
}

export default async function HomePage() {
  const { tab } = JSON.parse(decodeURIComponent(headers().get("x-invoke-query")))
  const background = query => tab === query? '#f1f2f3' : null
  
  const postData = await Posts.find().sort({createdAt: -1}).limit(20)
  const postUsers = await Users.find({_id: {$in: postData.map(post => post.postedBy)}})
  let posts = postData.map(post => {
    const user = postUsers.find(user => user.id === post.postedBy)
    const postedBy = {
      name: user.name,
      username: user.username,
      profile: user.profile,
      reputation: user.reputation
    }
    return {
      postId: post._doc.postId,
      title: post._doc.title,
      body: post._doc.body,
      tags: post._doc.tags,
      upvotes: post._doc.upvotes,
      downvotes: post._doc.downvotes,
      score: post._doc.score,
      views: post._doc.views,
      comments: post._doc.comments,
      answers: post._doc.answers,
      createdAt: post._doc.createdAt,
      postedBy
    } 
  })

  if (tab === 'views') posts = posts.sort((a, b) => b.views - a.views)
  if (tab === 'upvotes') posts = posts.sort((a, b) => b.score - a.score)
  if (tab === 'answers') posts = posts.sort((a, b) => b.answers.length - a.answers.length)
  
  return (
    <div className="posts-container">
      <div className="posts">
        <div className="top">
          <h2>Top Questions</h2>
          <Link href="/post">Ask Question</Link>
          <div className="sort-by">
            <Link href="/" style={{backgroundColor: background(undefined)}}>Recent</Link>
            <Link href="/?tab=views" style={{backgroundColor: background('views')}}>Views</Link>
            <Link href="/?tab=upvotes" style={{backgroundColor: background('upvotes')}}>Upvotes</Link>
            <Link href="/?tab=answers" style={{backgroundColor: background('answers')}}>Answers</Link>
          </div>
        </div>
        { posts.map(post => <Post post={post} key={post.postId} />) }
        <p className="view-all">To view all questions, visit <Link href="/questions">Questions</Link>.</p>
      </div>
    </div>
  )
}