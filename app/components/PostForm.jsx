"use client"
import { useRef, useState, useEffect } from "react"
import { FaTimes } from "react-icons/fa"
import TextEditor from "@/app/components/TextEditor"
import Preview from "@/app/components/Preview"

export default function PostForm({ title, setTitle, body, setBody, tags, setTags, setError }) {
  const [value, setValue] = useState("")
  const inputRef = useRef()

  useEffect(() => {
    const clearError = () => setError("")
    document.querySelector(".ql-editor").addEventListener("focus", clearError)
  }, [])

  return (
    <>
      <label>Title</label>
      <p>A good title reflects the question you are asking</p>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} onFocus={() => setError("")}
        placeholder="eg. How do I create a function that waits for n amounts of seconds in javascript?"
      />
      <label>Body</label>
      <p>Add all the required information to answer your question</p>
      <TextEditor body={body} setBody={setBody} min={250} />
      <label>Preview</label>
      <Preview body={body} />
      <label>Tags</label>
      <div className="tag-input" ref={inputRef}>
        <div className="tags">
          {tags.map(tag => (
            <div key={tag}>
              <p>{tag}</p>
              <FaTimes size={12} style={{cursor: "pointer"}} onClick={() => {
                inputRef.current.children[1].focus()
                setTags(tags.filter(t => t !== tag))
              }} />
            </div>
          ))}
        </div>
        <input type="text" value={value} 
        onBlur={() => {
          inputRef.current.style.outlineColor = "#ccc"
          if (tags.length < 5 && value.length > 0 && !tags.includes(value)) {
            setTags([...tags, value])
            setValue("")
          }
        }} 
          onFocus={() => {
            inputRef.current.style.outlineColor = "#1a73e8"
            setError("")
          }}
          onChange={e => {
            setValue(e.target.value)
            if (e.target.value.includes(" ")) {
              setValue("")
              if (tags.length < 5 && value.length > 0) {
                setTags([...tags, ...e.target.value.split(" ").
                filter(t => t.length !== 0 && !tags.includes(t))].splice(0, 5))
              }
            }
          }}
        />
      </div>
    </>
  )
}