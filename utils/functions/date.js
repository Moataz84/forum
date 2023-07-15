export function getQuestionDate(time) {
  const currentTime = new Date()
  const elapsedTime = Math.floor((currentTime - parseInt(time)) / 1000)

  if (elapsedTime === 0) return "just now"
  if (elapsedTime < 60) {
    return `${elapsedTime} sec${elapsedTime > 1? "s" : ""} ago`
  }
  if (elapsedTime < 3600) {
    const minutes = Math.floor(elapsedTime / 60)
    return `${minutes} min${minutes > 1? "s" : ""} ago`
  }
  if (elapsedTime < 86400) {
    const hours = Math.floor(elapsedTime / 3600)
    return `${hours} hour${hours > 1? "s" : ""} ago`
  }
  if (elapsedTime < 2592000) {
    const days = Math.floor(elapsedTime / 86400)
    return `${days} day${days > 1? "s" : ""} ago`
  }
  if (elapsedTime < 31536000) {
    const months = Math.floor(elapsedTime / 2592000)
    return `${months} month${months > 1? "s" : ""} ago`
  }
  const date = new Date(parseInt(time)).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" })
  return `on ${date}`
}

export function getCardDate(time) {
  const currentTime = new Date()
  const elapsedTime = Math.floor((currentTime - parseInt(time)) / 1000)

  if (elapsedTime === 0) return "just now"
  if (elapsedTime < 60) {
    return `${elapsedTime} sec${elapsedTime > 1? "s" : ""} ago`
  }
  if (elapsedTime < 3600) {
    const minutes = Math.floor(elapsedTime / 60)
    return `${minutes} min${minutes > 1? "s" : ""} ago`
  }
  if (elapsedTime < 86400) {
    const hours = Math.floor(elapsedTime / 3600)
    return `${hours} hour${hours > 1? "s" : ""} ago`
  }
  const date = new Date(parseInt(time)).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" })
  return `on ${date}`
}

export function getShortDate(time) {
  const date = getCardDate(time).replace("on ", "")
  const current = new Date()
  if (current.getFullYear() === new Date(time).getFullYear()) return date.replace(`, ${current.getFullYear()}`, "")
  return date
}