import { useState, useRef } from "react"
import Link from "next/link"
import { v4 } from "uuid"
import { commentQuestion, deleteCommentQuestion, editCommentQuestion } from "@/utils/actions/question/question"
import { commentAnswer, deleteCommentAnswer, editCommentAnswer } from "@/utils/actions/question/answers"
import "@/app/styles/main.css"

function Comment({ post, setPost, comment, currentUser, answerId }) {
  const [editable, setEditable] = useState(false)
  const commentRef = useRef()

  const dateFormat = {month: "short", day: "numeric", year: "numeric"}

  async function deleteComment(commentId) {
    const confirmed = confirm("Are you sure you want to delete this comment?")
    if (!confirmed) return
    if (!answerId) {
      setPost(prev => ({...prev, comments: prev.comments.filter(comment => comment.id !== commentId)}))
      await deleteCommentQuestion(post.postId, commentId)
    } else {
      setPost(prev => ({...prev, answers: prev.answers.map(answer => {
        if (answer.answerId === answerId) return {
          ...answer, comments: answer.comments.filter(comment => comment.id !== commentId)
        }
        return answer
      })}))
      await deleteCommentAnswer(answerId, commentId)
    }
  }

  function editComment() {
    commentRef.current.contentEditable = true
    commentRef.current.focus()
    const range = document.createRange()
    range.selectNodeContents(commentRef.current)
    range.collapse(false)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    setEditable(true)
  }

  async function saveComment(commentId) {
    const newComment = commentRef.current.innerText
    if (newComment.length < 15) return
    commentRef.current.contentEditable = false
    setEditable(false)
    if (!answerId) {
      setPost(prev => ({
        ...prev,
        comments: prev.comments.map(comment => {
          if (comment.id === commentId) return {...comment, message: newComment}
          return comment
        })
      }))
      await editCommentQuestion(post.postId, commentId, newComment)
    } else {
      setPost(prev => ({
        ...prev, answers: prev.answers.map(answer => {
          if (answer.answerId === answerId) return {...answer, comments: answer.comments.map(comment => 
            comment.id === commentId? {...comment, message: newComment} : comment
          )}
          return answer
        })
      }))
      await editCommentAnswer(answerId, commentId, newComment)
    }
  }

  return (
    <div className="comment">
      <p>
        <span ref={commentRef}>{comment.message}</span>
        {
          editable? null: 
          <>
            <span> - </span>
            {comment.commentedBy.username === "user"? 
              <span>User</span>
            :
              <Link href={`/users/${comment.commentedBy.username}`}>{comment.commentedBy.name}</Link>
            }
            <span>{` ${new Date(parseInt(comment.date)).toLocaleString("en-US", dateFormat)}`}</span>
          </>
        }
      </p>
      {
        comment.commentedBy.id !== currentUser?.id? null : 
        <div className="actions">
          <button onClick={editComment}>Edit</button>
          <button onClick={() => deleteComment(comment.id)}>Delete</button>
        </div>
      }
      {!editable? null: <button onClick={() => saveComment(comment.id)}>Save</button>}
    </div>
  )
}

export default function Comments({ post, setPost, currentUser, answerId }) {
  const [comment, setComment] = useState("")
  const [error, setError] = useState("")

  const comments = !answerId? post.comments : post.answers.find(answer => answer.answerId === answerId).comments

  async function addComment() {
    if (comment.length < 15) {
      setError("Please enter at least 15 characters.")
      return
    }
    const commentBody = {
      id: v4().replace(/-/g, ""),
      date: new Date().getTime(),
      message: comment,
      commentedBy: currentUser.id
    }
    setComment("")
    if (!answerId) {
      setPost(prev => ({...prev, comments: [...prev.comments, {
        ...commentBody, 
        commentedBy: { id: currentUser.id, name: currentUser.name}
      }]}))
      await commentQuestion(post.postId, commentBody)
    } else {
      setPost(prev => ({...prev, answers: prev.answers.map(answer => {
        if (answer.answerId === answerId) return {
          ...answer, 
          comments: [
            ...answer.comments, 
            {...commentBody, commentedBy: { id: currentUser.id, name: currentUser.name}}
          ]
        }
        return answer
      })}))
      await commentAnswer(answerId, commentBody)
    }
  }

  return (
    <>
      {
        !comments.length > 0? null :
        <div className="comments">
          {comments.map(comment => 
            <Comment 
              key={comment.id}
              post={post}
              setPost={setPost}
              comment={comment} 
              currentUser={currentUser}
              answerId={answerId} 
            />
          )}
        </div>
      }
      {
        !currentUser?.id? null :
        <div className="write-comment">
          <textarea value={comment} onChange={e => setComment(e.target.value)} onFocus={() => setError("")} />
          <button onClick={addComment}>Comment</button>
          <p>{error}</p>
        </div>
      } 
    </>
  )
}