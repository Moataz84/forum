import { Schema, models, model } from "mongoose"

const schema = new Schema({
  postId: String,
  title: String,
  body: String,
  tags: Array,
  upvotes: Array,
  downvotes: Array,
  score: Number,
  views: Number,
  comments: Array,
  answers: Array,
  postedBy: String,
  createdAt: Number
})

const Posts = models.posts || model("posts", schema)
export default Posts