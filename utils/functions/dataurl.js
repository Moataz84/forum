export default function getDataUrl(file) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
  })
}