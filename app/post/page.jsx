"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import post from "@/utils/actions/post"
import PostForm from "@/app/components/PostForm"
import "@/app/styles/post.css"

export default function PostPage() {
  const router = useRouter()
  
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [tags, setTags] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function postClient(e) {
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
    const questionId = await post(title, body, tags, new Date().getTime())
    router.push(`/questions/${questionId}`)
  }

  return (
    <div className="post-container">
      <h2>Ask a Question</h2>
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
        <button onClick={postClient}>Post Question</button>
        <p style={{color: "#8c0c0c"}}>{error}</p>
        { loading? <p>Loading, please wait you will be redirected shortly.</p> : null }
      </form>
    </div>
  )
}