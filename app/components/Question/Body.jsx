import { useRouter } from "next/navigation"
import Link from "next/link"
import { AiFillCaretRight } from "react-icons/ai"
import { upvoteQuestion, downvoteQuestion, deleteQuestion } from "@/utils/actions/question/question"
import { getQuestionDate, getCardDate } from "@/utils/functions/date"
import formatReputation from "@/utils/functions/reputation"
import Preview from "@/app/components/Preview"
import Comments from "@/app/components/Question/Comments"
import "@/app/styles/main.css"

export default function Body({ post, setPost, currentUser, setMessage }) {
  const router = useRouter()

  async function upvote() {
    if (!currentUser) {
      setMessage("You must be signed in to vote.")
      return
    }
    if (currentUser.id === post.postedBy.id) {
      setMessage("You can't vote for your own post")
      return
    }
    let upvotes
    let downvotes
    let action

    if (post.downvotes.includes(currentUser.id)) {
      action = "replace"
      upvotes = [...post.upvotes, currentUser.id]
      downvotes = post.downvotes.filter(id => id !== currentUser.id)
    } else if (post.upvotes.includes(currentUser.id)) {
      action = "remove"
      upvotes = post.upvotes.filter(id => id !== currentUser.id)
      downvotes = post.downvotes 
    } else {
      action = "add"
      upvotes = [...post.upvotes, currentUser.id]
      downvotes = post.downvotes 
    }
    setPost(prev => ({...prev, upvotes, downvotes, score: (upvotes.length - downvotes.length)}))
    await upvoteQuestion(post.postId, currentUser.id, action)
  }

  async function downvote() {
    if (!currentUser) {
      setMessage("You must be signed in to vote.")
      return
    }
    if (currentUser.id === post.postedBy.id) {
      setMessage("You can't vote for your own post")
      return
    }
    let upvotes
    let downvotes
    let action

    if (post.upvotes.includes(currentUser.id)) {
      action = "replace"
      upvotes = post.upvotes.filter(id => id !== currentUser.id)
      downvotes = [...post.downvotes, currentUser.id]
    } else if (post.downvotes.includes(currentUser.id)) {
      action = "remove"
      upvotes = post.upvotes
      downvotes = post.downvotes.filter(id => id !== currentUser.id)
    } else {
      action = "add"
      upvotes = post.upvotes
      downvotes = [...post.downvotes, currentUser.id]
    }
    setPost(prev => ({...prev, upvotes, downvotes, score: (upvotes.length - downvotes.length)}))
    await downvoteQuestion(post.postId, currentUser.id, action)
  }

  async function deletePostClient() {
    const confirmed = confirm("Are you sure you want to delete this post?")
    if (!confirmed) return
    router.push("/questions")
    await deleteQuestion(post.postId)
  }

  return (
    <div className="question">
      <h2>{post.title}</h2>
      <div className="question-info">
        <p>Asked {getQuestionDate(post.createdAt)}</p>
        <p>Veiwed {post.views} time{post.views !== 1? "s": ""}</p>
      </div>
      <main>
        <div className="votes">
          <AiFillCaretRight size={40} onClick={upvote} 
            style={{rotate: "-90deg", color: post.upvotes.includes(currentUser?.id)? "#a0a0a0": null}} 
          />
          <p>{post.score}</p>
          <AiFillCaretRight size={40} onClick={downvote} 
            style={{rotate: "90deg", color: post.downvotes.includes(currentUser?.id)? "#a0a0a0": null}} 
          />
        </div>
        <Preview body={post.body} />
        <div className="tags">
          { post.tags.map(tag => <Link key={tag} href={`/tags/${tag}`}>{tag}</Link>) }    
        </div>
        {
          currentUser?.id !== post.postedBy.id? null :
          <div className="change">
            <Link href={`/questions/${post.postId}/edit`}>Edit</Link>
            <button onClick={deletePostClient}>Delete</button>
          </div>
        }
        <div className="posted-by">
          <p>Asked {getCardDate(post.createdAt)}</p>
          {post.postedBy.username === "user"?
            <>
              <img src={post.postedBy.profile.pictureUrl} style={{gridRow: "2 / 5"}} />
              <p>User</p>
              <p>0</p>
            </>
          :
            <>
              <Link href={`/users/${post.postedBy.username}`} style={{gridRow: "2 / 5"}}>
                <img src={post.postedBy.profile.pictureUrl} />
              </Link>
              <Link href={`/users/${post.postedBy.username}`}>{post.postedBy.name}</Link>
              <p>{formatReputation(post.postedBy.reputation)}</p>
            </>
          }
        </div>
      </main>
      <Comments post={post} setPost={setPost} currentUser={currentUser} /> 
    </div>
  )
}