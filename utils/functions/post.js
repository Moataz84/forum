import Users from "@/utils/Models/Users"
import Answers from "@/utils/Models/Answers"
import connectDB from "@/utils/database"

export default async function getPost(post) {
  await connectDB()

  const postAnswers = await Answers.find({answerId: {$in: post.answers}})
  const answerUsers = await Users.find({_id: {$in: postAnswers.map(answer => answer.answeredBy)}})
  const answerCommentUsers = await Users.find(
    {_id: {$in: postAnswers.map(answer => answer.comments).reduce((a, b) => [...a, ...b], []).map(comment => comment.commentedBy)}}
  )

  const answers = postAnswers.map(answer => {
    const user = answerUsers.find(user => user.id === answer.answeredBy)
    const comments = answer.comments.map(comment => {
      const user = answerCommentUsers.find(user => user.id === comment.commentedBy)
      return {
        ...comment,
        commentedBy: {
          id: user.id,
          name: user.name,
          username: user.username
        }
      }
    })
    return {
      postId: answer.postId,
      answerId: answer.answerId,
      body: answer.body,
      upvotes: answer.upvotes,
      downvotes: answer.downvotes,
      selected: answer.selected,
      score: answer.score,
      answeredAt: answer.answeredAt,
      comments,
      answeredBy: {
        id: user.id,
        name: user.name,
        username: user.username,
        profile: user.profile,
        reputation: user.reputation
      }
    }
  })

  const commentUsers = await Users.find({_id: {$in: post.comments.map(comment => comment.commentedBy)}})
  const comments = post.comments.map(comment => {
    const user = commentUsers.find(user => user.id === comment.commentedBy)
    return {
      ...comment,
      commentedBy: {
        id: user.id,
        name: user.name,
        username: user.username
      }
    }
  })

  const postedUser =  await Users.findOne({_id: post.postedBy})
  const postedBy = {
    id: postedUser.id,
    name: postedUser.name,
    username: postedUser.username,
    profile: postedUser.profile,
    reputation: postedUser.reputation
  }

  return ({
    postId: post.postId,
    title: post.title,
    body: post.body,
    tags: post.tags,
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    score: post.score,
    views: post.views,
    comments,
    answers,
    postedBy,
    createdAt: post.createdAt
  })
}