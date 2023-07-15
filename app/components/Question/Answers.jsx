"use client"
import { useEffect } from "react"
import Link from "next/link"
import { AiFillCaretRight } from "react-icons/ai"
import { BiCheck } from "react-icons/bi"
import { selectAnswer, upvoteAnswer, downvoteAnswer, deleteAnswer } from "@/utils/actions/question/answers"
import formatReputation from "@/utils/functions/reputation"
import { getCardDate } from "@/utils/functions/date"
import Preview from "@/app/components/Preview"
import Comments from "@/app/components/Question/Comments"
import "@/app/styles/main.css"

export default function Answers({ post, setPost, currentUser, setMessage }) {

  useEffect(() => {
    function scrollToAnswer() {
      const hash = window.location.hash
      if (!hash.length) return
      const answer = document.querySelector(`#a${hash.slice(1)}`)
      if (!answer) return
      const targetPosition = answer.getBoundingClientRect().top + window.scrollY - 70
      window.scrollTo({top: targetPosition, behavior: 'smooth'})
    }
    scrollToAnswer()
    window.addEventListener("hashchange", scrollToAnswer)
  }, [])

  async function selectAnswerClient(id) {
    const selectedAnswer = post.answers.find(answer => answer.selected)
    const newAnswer = post.answers.find(answer => answer.answerId === id)

    if (selectedAnswer === undefined) {
      const newAnswers = post.answers.map(answer => 
        answer.answerId === newAnswer.answerId? ({...answer, selected: true}) : answer
      )
      setPost(prev => ({...prev, answers: newAnswers}))
      await selectAnswer([{answerId: newAnswer.answerId, selected: true}], post.postedBy.id)
    } else if (selectedAnswer?.answerId === id) {
      const newAnswers = post.answers.map(answer => ({...answer, selected: false}))
      setPost(prev => ({...prev, answers: newAnswers}))
      await selectAnswer([{answerId: newAnswer.answerId, selected: false}], post.postedBy.id)
    } else {
      const newAnswers = post.answers.map(answer => answer.answerId === newAnswer.answerId? 
        ({...answer, selected: true}) : ({...answer, selected: false}))
      setPost(prev => ({...prev, answers: newAnswers}))
      await selectAnswer([
        {answerId: newAnswer.answerId, selected: true},
        {answerId: selectedAnswer.answerId, selected: false}
      ], post.postedBy.id)
    }
  }

  async function upvote(answerId) {
    const answer = post.answers.find(answer => answer.answerId === answerId)

    if (!currentUser) {
      setMessage("You must be signed in to vote.")
      return
    }
    if (currentUser.id === answer.answeredBy.id) {
      setMessage("You can't vote for your own post")
      return
    }
    let upvotes
    let downvotes
    let action

    if (answer.downvotes.includes(currentUser.id)) {
      action = "replace"
      upvotes = [...answer.upvotes, currentUser.id]
      downvotes = answer.downvotes.filter(id => id !== currentUser.id)
    } else if (answer.upvotes.includes(currentUser.id)) {
      action = "remove"
      upvotes = answer.upvotes.filter(id => id !== currentUser.id)
      downvotes = answer.downvotes 
    } else {
      action = "add"
      upvotes = [...answer.upvotes, currentUser.id]
      downvotes = answer.downvotes 
    }
    setPost(prev => ({
      ...prev, 
      answers: prev.answers.map(answer => answer.answerId === answerId? 
        {...answer, upvotes, downvotes, score: (upvotes.length - downvotes.length)} : answer)
    }))
    await upvoteAnswer(answerId, currentUser.id, action)
  }

  async function downvote(answerId) {
    const answer = post.answers.find(answer => answer.answerId === answerId)

    if (!currentUser) {
      setMessage("You must be signed in to vote.")
      return
    }
    if (currentUser.id === answer.answeredBy.id) {
      setMessage("You can't vote for your own post")
      return
    }
    let upvotes
    let downvotes
    let action

    if (answer.upvotes.includes(currentUser.id)) {
      action = "replace"
      upvotes = answer.upvotes.filter(id => id !== currentUser.id)
      downvotes = [...answer.downvotes, currentUser.id]
    } else if (answer.downvotes.includes(currentUser.id)) {
      action = "remove"
      upvotes = answer.upvotes
      downvotes = answer.downvotes.filter(id => id !== currentUser.id)
    } else {
      action = "add"
      upvotes = answer.upvotes
      downvotes = [...answer.downvotes, currentUser.id]
    }
    setPost(prev => ({
      ...prev, 
      answers: prev.answers.map(answer => answer.answerId === answerId? 
        {...answer, upvotes, downvotes, score: (upvotes.length - downvotes.length)} : answer
      )
    }))
    await downvoteAnswer(answerId, currentUser.id, action)
  }

  async function deleteAnswerClient(answerId) {
    const confirmed = confirm("Are you sure you want to delete your answer?")
    if (!confirmed) return
    setPost(prev => ({...prev, answers: prev.answers.filter(answer => answer.answerId !== answerId)}))
    await deleteAnswer(answerId)
  }

  return (
    <div className="answers">
      <h3>{post.answers.length} Answer{post.answers.length !== 1? "s": ""}</h3>
        {post.answers.sort((a, b) => b.score - a.score).map(answer => (
          <div key={answer.answerId} className="answer" id={`a${answer.answerId}`}>
            <div className="votes">
              <AiFillCaretRight size={40} onClick={() => upvote(answer.answerId)}
                style={{rotate: "-90deg", color: answer.upvotes.includes(currentUser?.id)? "#a0a0a0": null}} 
              />
              <p>{answer.score}</p>
              <AiFillCaretRight size={40} onClick={() => downvote(answer.answerId)}
                style={{rotate: "90deg", color: answer.downvotes.includes(currentUser?.id)? "#a0a0a0": null}} 
              />
              {
                currentUser?.id == post.postedBy.id?
                  <BiCheck size={45} style={{color: answer.selected? "#1ba236" : null}} 
                    onClick={() => selectAnswerClient(answer.answerId)} 
                  />
                :
                  answer.selected?
                    <BiCheck size={45} style={{color: "#1ba236"}} />
                  :
                    <></>
              }
            </div>
            <Preview body={answer.body} />
            {
              currentUser?.id !== answer.answeredBy.id? null :
              <div className="change">
                <Link href={`/answers/${answer.answerId}/edit`}>Edit</Link>
                <button onClick={() => deleteAnswerClient(answer.answerId)}>Delete</button>
              </div>
            }
            <div className="posted-by">
              <p>Answered {getCardDate(answer.answeredAt)}</p>
              {post.postedBy.username === "user"?
                <>
                  <img src={answer.answeredBy.profile.pictureUrl} style={{gridRow: "2 / 5"}} />
                  <p>User</p>
                  <p>0</p>
                </>
              :
                <>
                  <Link href={`/users/${answer.answeredBy.username}`} style={{gridRow: "2 / 5"}}>
                    <img src={answer.answeredBy.profile.pictureUrl} />
                  </Link>
                  <Link href={`/users/${answer.answeredBy.username}`}>{answer.answeredBy.name}</Link>
                  <p>{formatReputation(answer.answeredBy.reputation)}</p>
                </>
              }
            </div>
            <Comments post={post} setPost={setPost} currentUser={currentUser} answerId={answer.answerId} />
        </div>
        ))}
    </div>
  )
}