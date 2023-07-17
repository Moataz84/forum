"use client"
import { useRef, useEffect } from "react"
import ReactQuill, { Quill } from "react-quill"
import "react-quill/dist/quill.snow.css"
import "@/app/styles/editor.css"

const ColorAttributor = Quill.import("attributors/style/color")
ColorAttributor.whitelist = []
Quill.register(ColorAttributor)

const BackgroundColorAttributor = Quill.import("attributors/style/background")
BackgroundColorAttributor.whitelist = []
Quill.register(BackgroundColorAttributor)

const icons = Quill.import("ui/icons")
icons["code-block"] = `<svg strokeWidth="0" viewBox="0 0 16 16" height="15" width="15" xmlns="http://www.w3.org/2000/svg"><path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM6.646 7.646a.5.5 0 1 1 .708.708L5.707 10l1.647 1.646a.5.5 0 0 1-.708.708l-2-2a.5.5 0 0 1 0-.708l2-2zm2.708 0 2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L10.293 10 8.646 8.354a.5.5 0 1 1 .708-.708z"></path></svg>`

const modules = {
  toolbar: {
    container: "#toolbar",
    handlers: {
      image
    }
  }
}

function image() {
  const input = document.createElement("input")
  input.setAttribute("type", "file")
  input.setAttribute("accept", "image/*")
  input.click()

  input.onchange = () => {
    const width = 1000
    const file = input.files[0]
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = e => {
      const image = document.createElement("img")
      image.src = e.target.result
      image.onload = e => {
        const canvas = document.createElement("canvas")
        const ratio = e.target.width / e.target.height
        if (e.target.width > width) canvas.width = width
        if (e.target.width <= width) canvas.width = e.target.width
        canvas.height = canvas.width / ratio
        const context = canvas.getContext("2d")
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        const newImage = context.canvas.toDataURL("image/jpeg", 0.9)
        const editor = this.quill
        const range = editor.getSelection()
        editor.insertEmbed(range.index, "image", newImage, Quill.sources.USER)
        editor.setSelection(range.index + 1, Quill.sources.SILENT)
      }
    }
  }
}

function getLength(min, body) {
  const tempElement = document.createElement("div")
  tempElement.innerHTML = body
  return `${tempElement.textContent.length.toLocaleString("en-US")} / ${min}`
}

export default function TextEditor({ body, setBody, min }) {
  const quillRef = useRef()

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor()

      editor.getModule("clipboard").addMatcher("IMG", () => {
        const Delta = Quill.import("delta")
        return new Delta().insert("")
      })

      editor.getModule("clipboard").addMatcher("PICTURE", () => {
        const Delta = Quill.import("delta")
        return new Delta().insert("")
      })
    }
  }, [])

  return (
    <div style={{position: "relative"}} onDrop={e => e.preventDefault()}>
      <div id="toolbar" style={{borderBottomWidth: "0"}}>
        <span className="ql-formats">
          <select className="ql-header" defaultValue="7" onChange={e => e.persist()}>
            <option value="1" />
            <option value="2" />
            <option value="7" />
          </select>
        </span>
        <span className="ql-formats">
          <button className="ql-bold" />
          <button className="ql-italic" />
          <button className="ql-underline" />
          <button className="ql-strike" />
        </span>
        <span className="ql-formats">
          <button className="ql-blockquote" />
          <button className="ql-link" />
          <button className="ql-image" />
          <button className="ql-code" />
          <button className="ql-code-block" />
        </span>
        <span className="ql-formats">
          <button className="ql-list" value="ordered" />
          <button className="ql-list" value="bullet" />
        </span>
      </div>
      <ReactQuill ref={quillRef} theme="snow" value={body} onChange={setBody} modules={modules} />
      <p className="required-characters">{getLength(min, body)}</p>
    </div>
  )
}