"use client"
import { useRef, useState } from "react"
import { AiOutlineCamera } from "react-icons/ai"
import { changeProfile, removeProfile, changeName, changeUsername } from "@/utils/actions/settings"
import "@/app/styles/settings.css"

export default function Profile({ user }) {
  const imgRef = useRef()
  const coverRef = useRef()
  const inputRef = useRef()
  const [orgName, setOrgName] = useState(user.name)
  const [orgUsername, setOrgUsername] = useState(user.username)
  const [name, setName] = useState(user.name)
  const [username, setUsername] = useState(user.username)
  const [error, setError] = useState("")

  function dropHandler(e) {
    e.preventDefault()
    const item = e.dataTransfer.items[0]
    if (item.kind !== 'file') return
    const file = item.getAsFile()
    const list = new DataTransfer()
    list.items.add(file)
    inputRef.current.files = list.files
    updateProfile()
  }

  async function updateProfile() {
    if (!inputRef.current.files.length) return
    const file = inputRef.current.files[0]
    if (!file.type.includes("image")) return
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = e => {
      const image = document.createElement("img")
      image.src = e.target.result
      image.onload = async e => {
        const width = 512
        const canvas = document.createElement("canvas")
        const ratio = e.target.width / e.target.height
        if (e.target.width > width) canvas.width = width
        if (e.target.width <= width) canvas.width = e.target.width
        canvas.height = canvas.width / ratio
        const context = canvas.getContext("2d")
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        const newImage = context.canvas.toDataURL("image/jpeg", 0.9)
        imgRef.current.src = newImage
        inputRef.current.files = new DataTransfer().files
        await changeProfile(newImage, user.id)
      }
    }
  }
  
  async function remove() {
    const noProfile = "https://ik.imagekit.io/pk4i4h8ea/forum/profiles/no-profile.jpg"
    if (imgRef.current.src === noProfile) return
    imgRef.current.src = noProfile
    await removeProfile(user.id)
  }
  
  async function update(e) {
    e.preventDefault()
    setError("")
    if (orgName === name && orgUsername === username) return
    if (!name || !username) {
      setError("All feilds are required.")
      return
    }
    if (orgName !== name) {
      setOrgName(name)
      await changeName(user.id, name)
    }
    if (orgUsername !== username) {
      setOrgUsername(username)
      const data = await changeUsername(user.id, username.toLowerCase().replace(/\s/g, ""))
      setError(data?? "")
      if (data) return
    }
    setError("Updated successfully.")
  }

  return (
    <>
      <div className="change-picture">
        <img src={user.profile.pictureUrl} ref={imgRef} 
          onDragOver={e => e.preventDefault()} onDrop={e => dropHandler(e)} 
        />
        <div className="cover" ref={coverRef} onClick={() => inputRef.current.click()}>
          <AiOutlineCamera size={24} />
        </div>
        <input type='file' accept="image/*" style={{display: 'none'}} ref={inputRef} onChange={updateProfile} />
        <button onClick={remove}>Remove Profile</button>
      </div>

      <form>
        <label>Name</label>
        <input type="text" value={name} 
          onChange={e => setName(e.target.value)} onFocus={() => setError("")} 
        />
        <label>Username</label>
        <input type="text" value={username} 
          onChange={e => setUsername(e.target.value)} onFocus={() => setError("")} 
        />
        <button onClick={update}>Update</button>
        <p className="error" style={{color: error.includes("success")? "#000" : null}}>{error}</p>
      </form>
    </>
  )
}