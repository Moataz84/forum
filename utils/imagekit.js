import ImageKit from "imagekit"

const imagekit = new ImageKit({
  publicKey : process.env.PUBLIC_KEY,
  privateKey : process.env.PRIVATE_KEY,
  urlEndpoint : "https://ik.imagekit.io/pk4i4h8ea/"
})

export default imagekit