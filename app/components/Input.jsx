"use client"
import { useRef, useState } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import "@/app/styles/auth.css"

export default function Input({ type, name, value, setValue, setMsg }) {
  const labelRef = useRef()
  const parentRef = useRef()
  const inputRef = useRef()

  const [show, setShow] = useState()
  
  const changeVisibility = () => setShow(!show)

  function handleFocus() {
    setMsg("")
    labelRef.current.style.transform = labelRef.current.style.animation = null
    parentRef.current.classList.remove("red-border")
    parentRef.current.classList.add("blue-border")
    labelRef.current.classList.add("entered", "blue-text")
  }

  function handleBlur() {
    if (!document.hasFocus()) return
    
    parentRef.current.classList.remove("blue-border")
    labelRef.current.classList.remove("blue-text")

    if (value.length === 0) {
      labelRef.current.style.transform = "translate(2px, -20px)"
      labelRef.current.classList.remove("entered")
      parentRef.current.classList.add("red-border")   
      labelRef.current.style.animation = "move-back 0.1s linear both"
    }
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault()
  }

  return (
    <div className="input-container" ref={parentRef}>
      <label ref={labelRef}>{name}</label>
      <input type={type === "password"? show? "text": type : type} value={value} ref={inputRef}
        onKeyDown={type === "number"? handleKeyDown: null}
        onChange={e => setValue(e.target.value)} 
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {
        type === "password"?
          !show? 
            <FaEye className="icon" size={22} onClick={changeVisibility} /> 
          : 
            <FaEyeSlash className="icon" size={24} onClick={changeVisibility} />
        : 
          <></>
      }
    </div>
  )
}