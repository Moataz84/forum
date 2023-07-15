"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import PostForm from "@/app/components/PostForm"
import { editQuestion } from "@/utils/actions/question/question"
import "@/app/styles/post.css"

export default function EditQuestion({ post }) {
  const router = useRouter()
  const [title, setTitle] = useState(post.title)
  const [body, setBody] = useState(post.body)
  const [tags, setTags] = useState(post.tags)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function editClient(e) {
    e.preventDefault()
    if (!title || !body || !tags.length) {
      setError("Please fill out all the fields above.")
      return
    }
    const tempElement = document.createElement("div")
    tempElement.innerHTML = body
    if (tempElement.textContent.length < 250) {
      setError("Please add at least 250 characters to the body.")
      return
    }
    
    setLoading(true)
    await editQuestion(post.postId, title, body, tags)
    router.push(`/questions/${post.postId}`)
  }

  return (
    <div className="post-container">
      <h2>Edit Post</h2>
      <form>
        <PostForm 
          title={title}
          setTitle={setTitle}
          body={body}
          setBody={setBody}
          tags={tags}
          setTags={setTags}
          setError={setError}
        />
        <button onClick={editClient}>Save Question</button>
        <p style={{color: "#8c0c0c"}}>{error}</p>
        { loading? <p>Loading, please wait you will be redirected shortly.</p> : null }
      </form>
    </div>
  )
}