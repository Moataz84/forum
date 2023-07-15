"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Preview from "@/app/components/Preview"
import TextEditor from "@/app/components/TextEditor"
import { editAnswer } from "@/utils/actions/question/answers"
import "@/app/styles/post.css"

export default function EditAnswer({ answer }) {
  const router = useRouter()

  const [body, setBody] = useState(answer.body)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const clearError = () => setError("")
    document.querySelector(".ql-editor").addEventListener("focus", clearError)
  }, [])

  async function updateAnswerClient(e) {
    e.preventDefault()
    const tempElement = document.createElement("div")
    tempElement.innerHTML = body
    if (tempElement.textContent.length < 50) {
      setError("Please add at least 50 characters to the body")
      return
    }

    setLoading(true)
    await editAnswer(body, answer.answerId, answer.postId)
    router.push(`/questions/${answer.postId}#${answer.answerId}`)
  }

  return (
    <div className="post-container">
      <h2>Edit Answer</h2>
      <form>
        <label>Body</label>
        <p>Add all the required information to answer your question</p>
        <TextEditor body={body} setBody={setBody} min={50} />
        <label>Preview</label>
        <Preview body={body} />
        <button onClick={updateAnswerClient}>Update Answer</button>
        <p style={{color: "#8c0c0c", fontSize: "13px"}}>{error}</p>
        {loading? <p>Loading, please wait you will be redirected shortly.</p> : null}
      </form>      
    </div>
  )
}