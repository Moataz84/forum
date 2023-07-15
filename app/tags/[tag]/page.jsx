import { headers } from "next/headers"
import connectDB from "@/utils/database"
import Posts from "@/utils/Models/Posts"
import Users from "@/utils/Models/Users"
import Post from "@/app/components/Post"
import Pagination from "@/app/components/Pagination"
import NotFound from "@/app/components/NotFound"
import "@/app/styles/main.css"

const limit = 20

export async function generateMetadata({ params }) {
  await connectDB()
  const posts = await Posts.find({tags: params.tag})
  return { 
    title: posts.length? `Tags - ${params.tag}` : "Not found"
  }
}

export default async function TagPage({ params }) {
  await connectDB()
  const { page } = JSON.parse(decodeURIComponent(headers().get("x-invoke-query")))
  
  let number = !isNaN(parseInt(page))? parseInt(page) : 1
  if (number <= 0) number = 1

  const [postData, totalDocuments] = await Promise.all([
    Posts.find({tags: params.tag}).sort({score: -1, createdAt: -1}).skip((number - 1) * limit).limit(limit),
    Posts.countDocuments({tags: "react"})
  ])
  const pages = Math.ceil(totalDocuments / limit)
  const postUsers = await Users.find({_id: {$in: postData.map(post => post.postedBy)}})
  const posts = postData.map(post => {
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
  
  if (!posts.length) return <NotFound />
  return (
    <div className="posts-container">
      <h2>Questions Using "{params.tag}" Tag</h2>
      <div className="posts">
        { posts.map(post => <Post post={post} key={post.postId} />) }
      </div>
      <Pagination number={number} pages={pages} page={`/tags/${params.tag}`} />
    </div>
  )
}