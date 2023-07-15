"use server"
import { v4 } from "uuid"
import imagekit from "@/utils/imagekit"
import Users from "@/utils/Models/Users"
import Posts from "@/utils/Models/Posts"
import Answers from "@/utils/Models/Answers"
import Tags from "@/utils/Models/Tags"
import connectDB from "@/utils/database"

async function setReputation(oldPost) {
  await connectDB()
  const newPost = await Posts.findOne({postId: oldPost.postId})
  const oldPostRep = (oldPost.upvotes.length * 10) + (oldPost.downvotes.length * -4)
  const newPostRep = (newPost.upvotes.length * 10) + (newPost.downvotes.length * -4)
  const reputation = newPostRep - oldPostRep
  await Users.findOneAndUpdate({_id: newPost.postedBy}, {$inc: {reputation}})
}

export async function upvoteQuestion(postId, userId, action) {
  await connectDB()
  let oldPost
  if (action === "add") {
    oldPost = await Posts.findOneAndUpdate({postId}, {$push: {upvotes: userId}, $inc: {score: 1}})
  } else if (action === "remove") {
    oldPost = await Posts.findOneAndUpdate({postId}, {$pull: {upvotes: userId}, $inc: {score: -1}})
  } else {
    oldPost = await Posts.findOneAndUpdate(
      {postId}, {$push: {upvotes: userId}, $pull: {downvotes: userId}, $inc: {score: 2}}
    )
  }
  if (!oldAnswer) return
  await setReputation(oldPost)
}

export async function downvoteQuestion(postId, userId, action) {
  await connectDB()
  let oldPost
  if (action === "add") {
    oldPost = await Posts.findOneAndUpdate({postId}, {$push: {downvotes: userId}, $inc: {score: -1}})
  } else if (action === "remove") {
    oldPost = await Posts.findOneAndUpdate({postId}, {$pull: {downvotes: userId}, $inc: {score: 1}})
  } else {
    oldPost = await Posts.findOneAndUpdate(
      {postId}, {$push: {downvotes: userId}, $pull: {upvotes: userId}, $inc: {score: -2}}
    )
  }
  if (!oldAnswer) return
  await setReputation(oldPost)
}

export async function commentQuestion(postId, comment) {
  await connectDB()
  await Posts.findOneAndUpdate({postId}, {$push: {comments: comment}})
}

export async function editCommentQuestion(postId, commentId, comment) {
  await connectDB()
  await Posts.findOneAndUpdate({postId, "comments.id": commentId}, {$set: {"comments.$.message": comment}})
}

export async function deleteCommentQuestion(postId, commentId) {
  await connectDB()
  await Posts.findOneAndUpdate({postId}, {$pull: {comments: {id: commentId}}})
}

export async function editQuestion(postId, title, body, tags) {
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
          folder: `forum/posts/${postId}`
        }, (e, result) => resolve({image, url: result.url}))
      })
    })
  )
  imageUrls.filter(img => img !== undefined).forEach(img => body = body.replaceAll(img.image, img.url))
  const post = await Posts.findOneAndUpdate({postId}, {$set: {title, body, tags}})

  const [existing] = await Promise.all([
    Tags.find({value: {$in: tags}}),
    Tags.updateMany({value: {$in: post.tags}}, {$pull: {questions: postId, users: post.postedBy}})
  ])
  const existingTags = existing.map(tag => tag.value)
  const newTags = tags.filter(tag => !existingTags.includes(tag))
  await Promise.all([
    ...newTags.map(value => new Tags({value, questions: [postId], users: [post.postedBy]}).save()),
    Tags.updateMany({value: {$in: existingTags}}, {$push: {questions: postId, users: post.postedBy}})
  ])
  await Tags.deleteMany({questions: []})

  const usedImages = [...body.matchAll(pattern)].map(match => match[1])
  imagekit.listFiles({
    path: `forum/posts/${postId}`
  }, async (e, result) => {
    const unusedIds = result.filter(image => !usedImages.includes(image.url)).map(image => image.versionInfo.id)
    if (unusedIds.length) await imagekit.bulkDeleteFiles(unusedIds)
  })
}

export async function deleteQuestion(postId) {
  await connectDB()
  const post = await Posts.findOneAndDelete({postId})
  await Promise.all([
    Users.findOneAndUpdate({_id: post.postedBy}, {$pull: {questions: postId}}),
    Answers.deleteMany({postId}),
    Users.updateMany({answers: {$in: post.answers}}, {$pull: {answers: {$in: post.answers}}})
  ])
  await Promise.all(post.tags.map(async tag => {
    const res = await Tags.findOneAndUpdate({value: tag}, {$pull: {questions: postId}}, {new: true})
    if (res.questions.length === 0) return Tags.findOneAndDelete({value: tag})
    const users = [...res.users]
    const index = users.indexOf(post.postedBy)
    if (index !== -1) users.splice(index, 1)
    return Tags.findOneAndUpdate({value: tag}, {$set: {users}})
  }))
  await Tags.deleteMany({questions: []})
  try {
    await imagekit.deleteFolder(`forum/posts/${postId}`)
  } catch {}
}