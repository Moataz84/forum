export default function getDateJoined(date) {
  const currentTime = new Date()
  const elapsedTime = Math.floor((currentTime - date) / 1000)
  if (elapsedTime < 86400) return "Member for less than a day"
  if (elapsedTime < 2592000) {
    const days = Math.floor(elapsedTime / 86400)
    return `Member for ${days} day${days > 1? "s" : ""}`
  }
  if (elapsedTime < 31536000) {
    const months = Math.floor(elapsedTime / 2592000)
    return `Member for ${months} month${months > 1? "s" : ""}`
  }
  const years = Math.floor(elapsedTime / 31536000)
  const months = Math.floor((elapsedTime - (years * 31536000)) / 2592000)
  if (months === 0) return `Member for ${years} year${years > 1? "s" : ""}`
  return `Member for ${years} year${years > 1? "s" : ""}, ${months} month${months > 1? "s" : ""}`
}