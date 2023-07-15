import { Schema, models, model } from "mongoose"

const schema = new Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  code: String,
  verified: Boolean,
  forgotPasswordCode: String,
  joined: Number,
  reputation: Number,
  profile: Object,
  questions: Array,
  answers: Array,
  deactivated: Boolean
})

const Users = models.users || model("users", schema)
export default Users