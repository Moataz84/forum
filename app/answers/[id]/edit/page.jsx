import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import connectDB from "@/utils/database"
import Posts from "@/utils/Models/Posts"
import EditAnswer from "@/app/components/Question/EditAnswer"
import NotFound from "@/app/components/NotFound"
import "@/app/styles/main.css"
import { redirect } from "next/navigation"
import Answers from "@/utils/Models/Answers"

async function getAnsweredBy(answerId) {
  await connectDB()
  const answer = await Answers.findOne({answerId})
  if (!answer) return {isAnswer: false, exists: false}
  let answeredBy
  try {
    const result = verify(cookies().get("JWT-Token").value, process.env.ACCESS_TOKEN)
    answeredBy = result.user.id
  } catch {
    return {isAnswer: false, exists: true}
  }
  return {
    isAnswer: answeredBy === answer.answeredBy,
    exists: true,
    answer
  }
}

export async function generateMetadata({ params }) {
  const { exists, isAnswer } = await getAnsweredBy(params.id)
  if (!exists) return {title: "Not found"}
  if (isAnswer) return {title: "Edit Answer"}
}

export default async function EpitAnswerPage({ params }) {
  const { isAnswer, exists, answer } = await getAnsweredBy(params.id)
  if (!exists) return <NotFound />
  if (!isAnswer) return redirect(`/questions/${postId}`)
  const answerData = {
    postId: answer.postId,
    answerId: answer.answerId,
    body: answer.body
  }
  return <EditAnswer answer={answerData} />
}