import "react-quill/dist/quill.snow.css"
import "@/app/styles/editor.css"

export default function Preview({ body }) {
  return (
    <div className="preview-container quill">
      <div className="ql-container ql-snow">
        <div className="ql-editor preview" dangerouslySetInnerHTML={{__html: body}} />
      </div>
    </div>
  )
}