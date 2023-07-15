import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { BiSearchAlt } from "react-icons/bi"
import Link from "next/link"
import Post from "@/app/components/Post"
import Pagination from "@/app/components/Pagination"
import Posts from "@/utils/Models/Posts"
import Answers from "@/utils/Models/Answers"
import Users from "@/utils/Models/Users"
import "@/app/styles/main.css"
import "@/app/styles/users.css"

export const metadata = {
  title: "Search"
}

const limit = 20

function getQueryParams() {
  const { page, q } = JSON.parse(decodeURIComponent(headers().get("x-invoke-query")))
  let number = !isNaN(parseInt(page))? parseInt(page) : 1
  if (number <= 0) number = 1
  return {query: q??"", number}
}

function getSearchedTerm(query) {
  let searchQuery = query
  if (query.substring(0, 4) === "tag:") searchQuery = query.substring(4, query.length)
  if (query.substring(0, 5) === "user:") searchQuery = query.substring(5, query.length)
  if (query.substring(0, 6) === "users:") searchQuery = query.substring(6, query.length)
  return searchQuery
}

async function generalSearch() {
  const { number, query } = getQueryParams()
  const search = new RegExp(query, "i")
  const [posts, totalDocuments] = await Promise.all([
    Posts.find(
      {$or: [{title: search}, {body: search}, {tags: {$in: [search]}}]}
    ).sort({score: -1, createdAt: -1}).skip((number - 1) * limit).limit(limit),
    Posts.countDocuments({$or: [{title: search}, {body: search}, {tags: {$in: [search]}}]})
  ])
  const postUsers = await Users.find({_id: {$in: posts.map(post => post.postedBy)}})
  const results = posts.map(post => {
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
  return {type: "posts", results, totalDocuments}
}

async function tagSearch() {
  const { number, query } = getQueryParams()
  const tag = query.replace("tag:", "")
  const [posts, totalDocuments] = await Promise.all([
    Posts.find(
      {tags: {$in: [tag.toLowerCase(), tag.toUpperCase()]}}
    ).sort({score: -1, createdAt: -1}).skip((number - 1) * limit).limit(limit),
    Posts.countDocuments({tags: {$in: [tag.toLowerCase(), tag.toUpperCase()]}})
  ])
  const postUsers = await Users.find({_id: {$in: posts.map(post => post.postedBy)}})
  const results = posts.map(post => {
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
  return {type: "posts", results, totalDocuments}
}

async function userSearch() {
  const { number, query } = getQueryParams()
  const username = query.replace("user:", "").toLowerCase()
  const user = await Users.findOne({username, deactivated: false})
  if (!user) return {type: "posts", results: []}

  const start = (number - 1) * limit
  const end = start + limit

  const postedBy = {
    name: user.name,
    username: user.username,
    profile: user.profile,
    reputation: user.reputation
  }

  const [questions, answers] = await Promise.all([
    Posts.find({postedBy: user._id}),
    Answers.find({answeredBy: user._id})
  ])
  
  const posts = [
    ...questions.map(post => ({
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
      postedBy,
      isAnswer: false
    })), 
    ...answers.map(answer => {
      const post = questions.find(question => question.postId === answer.postId)
      return {
        postId: post._doc.postId,
        title: post._doc.title,
        body: answer._doc.body,
        tags: post._doc.tags,
        upvotes: answer._doc.upvotes,
        downvotes: answer._doc.downvotes,
        score: answer._doc.score,
        views: post._doc.views,
        comments: post._doc.comments,
        answers: post._doc.answers,
        createdAt: answer._doc.answeredAt,
        postedBy, 
        selected: answer._doc.selected,
        isAnswer: true
      }
    })
  ].sort((a, b) => b.score - a.score || b.createdAt - a.createdAt)
  const results = posts.map(post => ({...post, postedBy})).splice(start, end)
  return {type: "posts", results, totalDocuments: posts.length}
}

async function usersSearch() {
  const { number, query } = getQueryParams()
  const username = new RegExp(query.replace("users:", ""), "i")
  const [results, totalDocuments] = await Promise.all([
    Users.find(
      {username, deactivated: false}
    ).sort({reputation: -1, joined: -1}).skip((number - 1) * limit).limit(limit),
    Users.countDocuments({username, deactivated: false})
  ])
  return {type: "users", results, totalDocuments}
}

async function getResults() {
  const { query } = getQueryParams()
  if (query.substring(0, 4) === "tag:") return (await tagSearch())
  if (query.substring(0, 5) === "user:") return (await userSearch())
  if (query.substring(0, 6) === "users:") return (await usersSearch())
  return (await generalSearch())
}

export default async function SearchPage() {
  const { query } = getQueryParams()
  if (!query.length) redirect("/")
  const { type, results, totalDocuments } = await getResults()
  if (!results.length) return <NoResults />
  if (type === "posts") return <PostsResult posts={results} totalDocuments={totalDocuments} />
  return <UsersResult users={results} totalDocuments={totalDocuments} />
}

function NoResults() {
  const { query } = getQueryParams()
  const searchedQuery = getSearchedTerm(query)

  return (
    <div className="no-results">
      <h2>0 Results</h2>
      <BiSearchAlt size={80} />
      <p>No results were found for {searchedQuery}.</p>
    </div>
  )
}

function PostsResult({ posts, totalDocuments }) {
  const { query, number } = getQueryParams()
  const searchQuery = getSearchedTerm(query)
  const pages = Math.ceil(totalDocuments / limit)

  return (
    <div className="posts-container">
      <h2>{totalDocuments.toLocaleString('en-US')} Result{totalDocuments !== 1? "s" : ""} ({searchQuery})</h2>
      <div className="posts">
        {posts.map(post => <Post post={post} key={post.postId} />)}
      </div>
      <Pagination number={number} pages={pages} page="/search" query={query} />
    </div>
  )
}

function UsersResult({ users, totalDocuments }) {
  const { query, number } = getQueryParams()
  const searchQuery = getSearchedTerm(query)
  const pages = Math.ceil(totalDocuments / limit)

  return (
    <div className="users-container">
      <h2>{totalDocuments} Result{totalDocuments !== 1? "s" : ""} ({searchQuery})</h2>
      <div className="users-list">
        {users.map(user => (
          <div className="user-item" key={user.id}>
            <Link href={`/users/${user.username}`}>
              <img src={user.profile.pictureUrl} />
            </Link>
            <div className="user-info">
              <p>{user.name}</p>
              <Link href={ `/users/${user.username}`}>{user.username}</Link>
              <p>{user.reputation.toLocaleString('en-US')}</p>
            </div>
          </div>
        ))}
      </div>
      <Pagination number={number} pages={pages} page="/search" query={query} />
    </div>
  )
}