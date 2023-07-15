import { headers } from "next/headers"
import connectDB from "@/utils/database"
import Tags from "@/utils/Models/Tags"
import Link from "next/link"
import NotFound from "@/app/components/NotFound"
import Pagination from "@/app/components/Pagination"
import "@/app/styles/tags.css"

const limit = 20

async function getTags() {
  await connectDB()
  const { page } = JSON.parse(decodeURIComponent(headers().get("x-invoke-query")))
  let number = !isNaN(parseInt(page))? parseInt(page) : 1
  if (number <= 0) number = 1

  const [tags, totalDocuments] = await Promise.all([
    Tags.aggregate([
      {$project: {value: 1, questions: {$size: "$questions"}}}, {$sort: {questions: -1}}
    ]).skip((number - 1) * limit).limit(limit),
    Tags.countDocuments()
  ])
  return {tags, totalDocuments, number}
}

export async function generateMetadata() {
  const { tags, number } = await getTags()
  return {
    title: tags.length === 0? "Not found" : `Tags - Page ${number}`
  }
}

export default async function TagsPage() {
  const { tags, totalDocuments, number } = await getTags()
  if (tags.length === 0) return <NotFound />
  const pages = Math.ceil(totalDocuments / limit)

  return (
    <div className="tags-container">
      <h2>Tags ({totalDocuments.toLocaleString('en-US')})</h2>
      <div className="tags-list">
        {tags.map(tag => (
          <div className="tag-item" key={tag.value}>
            <Link href={`/tags/${tag.value}`}>{tag.value}</Link>
            <p>Used in {tag.questions.toLocaleString('en-US')} question{tag.questions !== 1? "s" : ""}</p>
          </div>
        ))}
      </div>
      <Pagination number={number} pages={pages} page="/tags" />
    </div>
  )
}