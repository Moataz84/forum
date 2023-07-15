"use client"
import { AiOutlineCloseCircle } from "react-icons/ai"
import "@/app/styles/main.css"

export default function Modal({ message, setMessage }) {
  if (!message) return <></>
  return (
    <div className="modal">
      <p>{message}</p>
      <AiOutlineCloseCircle size={24} onClick={() => setMessage("")} />
    </div>
  )
}