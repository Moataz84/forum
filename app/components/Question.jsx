"use client"
import { useState, useEffect } from "react"
import { v4 } from "uuid"
import { incrementCount, answerQuestion } from "@/utils/actions/question/main"
import Body from "@/app/components/Question/Body"
import Answers from "@/app/components/Question/Answers"
import Modal from "@/app/components/Question/Modal"
import TextEditor from "@/app/components/TextEditor"
import Preview from "@/app/components/Preview"
import "@/app/styles/main.css"

export default function Question({ post, currentUser }) {
  const [postState, setPost] = useState({...post})
  const [answer, setAnswer] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    increment()
    const clearError = () => setError("")
    document.querySelector(".ql-editor:not(.preview)")?.addEventListener("focus", clearError)
  }, [])

  async function increment() {
    setPost(prev => ({...prev, views: prev.views + 1}))
    await incrementCount(post.postId)
  }

  async function answerQuestionClient() {
    const tempElement = document.createElement("div")
    tempElement.innerHTML = answer
    if (tempElement.textContent.length < 50) {
      setError("Please add at least 50 characters to the body")
      return
    }
    const answerId = v4().replace(/-/g, "").substring(0, 10)
    const answeredAt = new Date().getTime()
    const answerBody = {
      postId: post.postId,
      answerId,
      body: answer,
      answeredAt,
      comments: [],
      upvotes: [],
      downvotes: [],
      score: 0,
      selected: false,
      answeredBy: {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        profile: currentUser.profile,
        reputation: currentUser.reputation
      }
    }
    setAnswer("")
    setPost(prev => ({...prev, answers: [...prev.answers, answerBody]}))
    setTimeout(() => {
      const element = document.querySelector(`#a${answerId}`)
      const targetPosition = element.getBoundingClientRect().top + window.scrollY - 70
      window.scrollTo({top: targetPosition, behavior: 'smooth'})
      document.querySelector(".ql-editor:not(.preview)").blur()
    }, 500)
    await answerQuestion(answer, answerId, answeredAt, currentUser.id, post.postId)
  }

  return (
    <div className="question-container">
      <Modal message={message} setMessage={setMessage} />
      <Body post={postState} setPost={setPost} currentUser={currentUser} setMessage={setMessage} />
      <Answers post={postState} setPost={setPost} currentUser={currentUser} setMessage={setMessage} />
      {
        !currentUser? null :
        <div className="write-answer">
          <h3>Your Answer</h3>
          <TextEditor body={answer} setBody={setAnswer} min={50} />
          <Preview body={answer} />
          <button onClick={answerQuestionClient}>Answer</button>
          <p style={{color: "#8c0c0c", fontSize: "13px"}}>{error}</p>
        </div>
      }
    </div>
  )
}