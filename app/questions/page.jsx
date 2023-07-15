import connectDB from "@/utils/database"
import { headers } from "next/headers"
import Link from "next/link"
import Posts from "@/utils/Models/Posts"
import Users from "@/utils/Models/Users"
import Post from "@/app/components/Post"
import Pagination from "@/app/components/Pagination"
import NotFound from "@/app/components/NotFound"
import "@/app/styles/main.css"

const limit = 20

async function getPosts() {
  await connectDB()
  const { page, sort } = JSON.parse(decodeURIComponent(headers().get("x-invoke-query")))
  
  let number = !isNaN(parseInt(page))? parseInt(page) : 1
  if (number <= 0) number = 1
  const filters = ["recent", "views", "upvotes", "answers"]
  const filter = filters.includes(sort)? sort : "recent"
  
  let sortBy = {createdAt: -1}
  if (filter === "views") sortBy = {views: -1}
  if (filter === "upvotes") sortBy = {score: -1}
  if (filter === "answers") sortBy = {answers: -1}

  const [postData, totalDocuments] = await Promise.all([
    Posts.find().sort(sortBy).skip((number - 1) * limit).limit(limit),
    Posts.countDocuments()
  ])
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
  return {posts, totalDocuments, filter, number}
}

export async function generateMetadata() {
  const { posts, number } = await getPosts()
  return {
    title: posts.length === 0? "Not found" : `Questions - Page ${number}`
  }
}

export default async function QuestionsPage() {
  const { posts, totalDocuments, filter, number } = await getPosts()
  if (posts.length === 0) return <NotFound />
  const background = query => filter === query? '#f1f2f3' : null
  const pages = Math.ceil(totalDocuments / limit)

  return (
    <div className="posts-container">
      <div className="posts">
        <div className="top">
          <h2>All Questions ({totalDocuments.toLocaleString('en-US')})</h2>
          <Link href="/post">Ask Question</Link>
          <div className="sort-by">
            <Link href={`/questions?page=${number}&sort=recent`} 
              style={{backgroundColor: background('recent')}}
            >Recent</Link>
            <Link href={`/questions?page=${number}&sort=views`} 
              style={{backgroundColor: background('views')}}
            >Views</Link>
            <Link href={`/questions?page=${number}&sort=upvotes`} 
              style={{backgroundColor: background('upvotes')}}
            >Upvotes</Link>
            <Link href={`/questions?page=${number}&sort=answers`} 
              style={{backgroundColor: background('answers')}}
            >Answers</Link>
          </div>
        </div>
        {posts.map(post => <Post post={post} key={post.postId} />)}
      </div>
      <Pagination number={number} pages={pages} filter={filter} page="/questions" />
    </div>
  )
}