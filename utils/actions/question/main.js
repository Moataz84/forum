"use server"
import { v4 } from "uuid"
import imagekit from "@/utils/imagekit"
import Users from "@/utils/Models/Users"
import Posts from "@/utils/Models/Posts"
import Answers from "@/utils/Models/Answers"
import connectDB from "@/utils/database"

export async function incrementCount(postId) {
  await connectDB()
  await Posts.findOneAndUpdate({postId}, {$inc: {views: 1}})
}

export async function answerQuestion(answer, answerId, answeredAt, userId, postId) {
  await connectDB()

  const pattern = /<img[^>]+src="([^">]+)"/g
  const images = new Set([...answer.matchAll(pattern)].map(match => match[1]))
  
  const imageUrls = await Promise.all(
    [...images].map(image => {
      return new Promise(resolve => {
        imagekit.upload({
          file: image,
          fileName: v4(),
          folder: `forum/posts/${postId}/${answerId}`
        }, (e, result) => resolve({image, url: result.url}))
      })
    })
  )
  imageUrls.forEach(img => answer = answer.replaceAll(img.image, img.url))

  const answerBody = {
    postId,
    answerId,
    body: answer,
    answeredBy: userId,
    answeredAt,
    comments: [],
    upvotes: [],
    downvotes: [],
    score: 0,
    selected: false
  }
  await Promise.all([
    Posts.findOneAndUpdate({postId}, {$push: {answers: answerId}}),
    Users.findOneAndUpdate({_id: userId}, {$push: {answers: answerId}}),
    new Answers(answerBody).save()
  ])
}