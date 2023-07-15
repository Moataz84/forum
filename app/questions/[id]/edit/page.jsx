import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import connectDB from "@/utils/database"
import Posts from "@/utils/Models/Posts"
import getPost from "@/utils/functions/post"
import NotFound from "@/app/components/NotFound"
import EditQuestion from "@/app/components/Question/EditQuestion"
import "@/app/styles/main.css"
import { redirect } from "next/navigation"

async function getPostedBy(id) {
  let postedBy
  await connectDB()
  const post = await Posts.findOne({postId: id})
  if (post === null) return {isPost: false, exists: false}

  try {
    const result = verify(cookies().get("JWT-Token").value, process.env.ACCESS_TOKEN)
    postedBy = result.user.id
  } catch {
    return {
      isPost: false,
      exists: true
    }
  }
  return {
    isPost: postedBy === post.postedBy,
    exists: true,
    post
  }
}

export async function generateMetadata({ params }) {
  const { exists, isPost, post } = await getPostedBy(params.id)
  if (!exists) return {title: "Not found"}
  if (isPost) return {title: `${post.title} - Eidt`}
}

export default async function EpitQuestionPage({ params }) {
  const { isPost, exists, post } = await getPostedBy(params.id)
  if (!exists) return <NotFound />
  if (!isPost) return redirect(`/questions/${params.id}`)
  const postData = await getPost(post)
  return <EditQuestion post={postData} />
}