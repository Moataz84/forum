import { Schema, models, model } from "mongoose"

const schema = new Schema({
  value: String,
  questions: Array,
  users: Array
})

const Tags = models.tags || model("tags", schema)
export default Tags