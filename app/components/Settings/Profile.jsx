"use client"
import { useRef, useState } from "react"
import { AiOutlineCamera } from "react-icons/ai"
import getDataUrl from "@/utils/functions/dataurl"
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
    if (file.size > 2 * 1024 * 1024) return
    const dataurl = await getDataUrl(file)
    imgRef.current.src = dataurl
    await changeProfile(dataurl, user.id)
  }
  
  async function remove() {
    if (user.profile.pictureId === "64958d3806370748f205fbda") return
    imgRef.current.src = "https://ik.imagekit.io/pk4i4h8ea/forum/profiles/no-profile.jpg"
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