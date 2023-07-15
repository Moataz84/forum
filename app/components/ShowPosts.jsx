"use client"

export default function ShowPosts({ posts }) {
  return posts.map(post => (
    <div className="post" key={post.id}>
      <h2>{post.title}</h2>
      <p>{post.body}</p>
      <p>{post.postedBy}</p>
    </div>
  ))
}