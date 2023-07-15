"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { getQuestionDate } from "@/utils/functions/date"
import formatReputation from "@/utils/functions/reputation"
import "@/app/styles/main.css"

export default function Post({ post }) {
  const path = usePathname()
  const id = post.answerId?? post.postId
  const answers = post.answers.length
  const score = post.score
  const views = post.views

  function getPostPreview() {
    const tempElement = document.createElement("div")
    tempElement.innerHTML = post.body
    const text = tempElement.textContent
    if (text.length <= 150) return text
    return `${text.substring(0, 150)} ...`
  }
  
  return (
    <div className={`post ${path !== "/"? "with-body" : ""}`} key={id}>
      <div className="post-info">
        {post.isAnswer?
          <>
            <p>{score} vote{score !== 1? "s" : ""}</p>
            <p>{post.selected? "Accepted" : ""}</p>
          </>
        :
          <>
            <p>{score} vote{score !== 1? "s" : ""}</p>
            <p>{answers} answer{answers !== 1? "s": ""}</p>
            <p>{views} view{views !== 1? "s" : ""}</p>
          </>
        }
      </div>
      <div className="title">
        <p>{post.isAnswer !== undefined ? post.isAnswer? "A" : "Q" : ""}</p>
        <Link href={`/questions/${post.postId}${post.isAnswer? `#${id}` : ""}`}>{post.title}</Link>
      </div>
      {path === "/"? <></> : 
        <div className="body-preview">{getPostPreview()}</div>
      }
      <div className="tags">
        {post.tags.map(tag => <Link href={`/tags/${tag}`} key={tag}>{tag}</Link>)}
      </div>
      <div className="asked">
        {post.postedBy.username === "user"?
          <>
            <img src={post.postedBy.profile.pictureUrl} />
            <span>User</span>
            <p>0</p>
          </>
        :
          <>
            <Link href={`/users/${post.postedBy.username}`}>
              <img src={post.postedBy.profile.pictureUrl} />
            </Link>
            <Link href={`/users/${post.postedBy.username}`}>{post.postedBy.name}</Link>
            <p>{formatReputation(post.postedBy.reputation)}</p>
          </>
        }
        <p>{post.isAnswer? "answered" : "asked"} {getQuestionDate(post.createdAt)}</p>
      </div>
    </div>
  )
}