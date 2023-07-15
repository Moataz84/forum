"use server"
import { v4 } from "uuid"
import imagekit from "@/utils/imagekit"
import Users from "@/utils/Models/Users"
import Posts from "@/utils/Models/Posts"
import Answers from "@/utils/Models/Answers"
import connectDB from "@/utils/database"

async function setReputation(oldAnswer) {
  await connectDB()
  const newAnswer = await Answers.findOne({answerId: oldAnswer.answerId})
  const oldAnswerRep = (oldAnswer.upvotes.length * 5) + (oldAnswer.downvotes.length * -2)
  const newAnswerRep = (newAnswer.upvotes.length * 5) + (newAnswer.downvotes.length * -2)
  const reputation = newAnswerRep - oldAnswerRep
  await Users.findOneAndUpdate({_id: oldAnswer.answeredBy}, {$inc: {reputation}})
}

export async function upvoteAnswer(answerId, userId, action) {
  await connectDB()
  let oldAnswer
  if (action === "add") {
    oldAnswer = await Answers.findOneAndUpdate({answerId}, {$push: {upvotes: userId}, $inc: {score: 1}})
  } else if (action === "remove") {
    oldAnswer = await Answers.findOneAndUpdate({answerId}, {$pull: {upvotes: userId}, $inc: {score: -1}})
  } else {
    oldAnswer = await Answers.findOneAndUpdate(
      {answerId}, {$push: {upvotes: userId}, $pull: {downvotes: userId}, $inc: {score: 2}}
    )
  }
  if (!oldAnswer) return
  await setReputation(oldAnswer)
}

export async function downvoteAnswer(answerId, userId, action) {
  await connectDB()
  let oldAnswer
  if (action === "add") {
    oldAnswer = await Answers.findOneAndUpdate({answerId}, {$push: {downvotes: userId}, $inc: {score: -1}})
  } else if (action === "remove") {
    oldAnswer = await Answers.findOneAndUpdate({answerId}, {$pull: {downvotes: userId}, $inc: {score: 1}})
  } else {
    oldAnswer = await Answers.findOneAndUpdate(
      {answerId}, {$push: {downvotes: userId}, $pull: {upvotes: userId}, $inc: {score: -2}}
    )
  }
  if (!oldAnswer) return
  await setReputation(oldAnswer)
}

export async function selectAnswer(answers, postedBy) {
  await connectDB()
  const updatedAnswers = await Promise.all(answers.map(answer => 
    Answers.findOneAndUpdate({answerId: answer.answerId}, {$set: {selected: answer.selected}}, {new: true})
  ))
  
  if (postedBy === updatedAnswers[0]?.answeredBy) return
  if (updatedAnswers.some(answer => answer?.selected)) {
    const userId = updatedAnswers.find(answer => answer.selected).answeredBy
    await Users.findOneAndUpdate({_id: userId}, {$inc: {reputation: 15}})
  }
  if (updatedAnswers.some(answer => !answer?.selected)) {
    const userId = updatedAnswers.find(answer => !answer.selected).answeredBy
    await Users.findOneAndUpdate({_id: userId}, {$inc: {reputation: -15}})
  }
}

export async function commentAnswer(answerId, comment) {
  await connectDB()
  await Answers.findOneAndUpdate({answerId}, {$push: {comments: comment}})
}

export async function editCommentAnswer(answerId, commentId, comment) {
  await connectDB()
  await Answers.findOneAndUpdate({answerId, "comments.id": commentId}, {$set: {"comments.$.message": comment}})
}

export async function deleteCommentAnswer(answerId, commentId) {
  await connectDB()
  await Answers.findOneAndUpdate({answerId}, {$pull: {comments: {id: commentId}}})
}

export async function editAnswer(body, answerId, postId) {
  await connectDB()

  const pattern = /<img[^>]+src="([^">]+)"/g
  const images = new Set([...body.matchAll(pattern)].map(match => match[1]))

  const imageUrls = await Promise.all(
    [...images].map(image => {
      if (image.includes("https://ik.imagekit.io/pk4i4h8ea/forum/")) return
      return new Promise(resolve => {
        imagekit.upload({
          file: image,
          fileName: v4(),
          folder: `forum/posts/${postId}/${answerId}`
        }, (e, result) => resolve({image, url: result.url}))
      })
    })
  )
  imageUrls.filter(img => img !== undefined).forEach(img => body = body.replaceAll(img.image, img.url))
  await Answers.findOneAndUpdate({answerId}, {$set: {body}})

  const usedImages = [...body.matchAll(pattern)].map(match => match[1])
  imagekit.listFiles({
    path: `forum/posts/${postId}/${answerId}`
  }, async (e, result) => {
    const unusedIds = result.filter(image => !usedImages.includes(image.url)).map(image => image.versionInfo.id)
    if (unusedIds.length) await imagekit.bulkDeleteFiles(unusedIds)
  })
}

export async function deleteAnswer(answerId) {
  const answer = await Answers.findOneAndDelete({answerId})
  await Promise.all([
    Posts.findOneAndUpdate({postId: answer.postId}, {$pull: {answers: answerId}}),
    Users.findOneAndUpdate({_id: answer.answeredBy}, {$pull: {answers: answerId}})
  ])
  try {
    await imagekit.deleteFolder(`forum/posts/${answer.postId}/${answerId}`)
  } catch {}
}