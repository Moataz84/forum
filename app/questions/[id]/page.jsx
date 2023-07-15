import connectDB from "@/utils/database"
import Posts from "@/utils/Models/Posts"
import getPost from "@/utils/functions/post"
import getUser from "@/utils/functions/user"
import Question from "@/app/components/Question"
import NotFound from "@/app/components/NotFound"
import "@/app/styles/main.css"

export async function generateMetadata({ params }) {
  await connectDB()
  const post = await Posts.findOne({postId: params.id})
  return { 
    title: post? `Questions - ${post.title}` : "Not found"
  }
}

export default async function QuestionId({ params }) {
  await connectDB()
  const post = await Posts.findOne({postId: params.id})
  if (!post) return <NotFound />
  const currentUser = await getUser()
  const postData = await getPost(post)
  return <Question currentUser={currentUser} post={postData} />
}