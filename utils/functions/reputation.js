export default function formatReputation(rep) {
  const sign = rep < 0? "-" : ""
  rep = Math.abs(rep)
  if (rep < 1000) return `${sign}${rep}`
  if (rep < 1000000) return `${sign}${Math.round(rep / 1000)}k`
  return `${sign}${Math.round((rep / 1000000) * 10) / 10}m`
}