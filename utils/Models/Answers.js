import { Schema, models, model } from "mongoose"

const schema = new Schema({
  postId: String,
  answerId: String,
  body: String,
  upvotes: Array,
  downvotes: Array,
  selected: Boolean,
  score: Number,
  comments: Array,
  answeredBy: String,
  answeredAt: Number
})

const Answers = models.answers || model("answers", schema)
export default Answers