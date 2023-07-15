"use server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { v4 } from "uuid"
import imagekit from "@/utils/imagekit"
import Users from "@/utils/Models/Users"
import Posts from "@/utils/Models/Posts"
import Tags from "@/utils/Models/Tags"
import connectDB from "@/utils/database"

export default async function post(title, body, tags, createdAt) {
  await connectDB()
  const userId = verify(cookies().get("JWT-Token").value, process.env.ACCESS_TOKEN).user.id
  const id = v4().replace(/-/g, "")

  const pattern = /<img[^>]+src="([^">]+)"/g
  const images = new Set([...body.matchAll(pattern)].map(match => match[1]))

  const imageUrls = await Promise.all(
    [...images].map(image => {
      return new Promise(resolve => {
        imagekit.upload({
          file: image,
          fileName: v4(),
          folder: `forum/posts/${id}`
        }, (e, result) => resolve({image, url: result.url}))
      })
    })
  )
  imageUrls.forEach(img => body = body.replaceAll(img.image, img.url))
  
  const existing = await Tags.find({value: {$in: tags}})
  const existingTags = existing.map(tag => tag.value)
  const newTags = tags.filter(tag => !existingTags.includes(tag))

  await Promise.all([
    ...newTags.map(value => new Tags({value, questions: [id], users: [userId]}).save()),
    Tags.updateMany({value: {$in: existingTags}}, {$push: {questions: id, users: userId}}),
    Users.findOneAndUpdate({_id: userId}, {$push: {questions: id}}),
    new Posts({
      postId: id,
      title,
      body,
      tags,
      upvotes: [],
      downvotes: [],
      score: 0,
      views: 0,
      comments: [],
      answers: [],
      postedBy: userId,
      createdAt
    }).save()
  ])
  return id
}