const cloudinary = require("cloudinary").v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

const uploadImage = async (file, folder = "projects") => {
  if (!file || !file.buffer) return null
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image"
  })

  return {
    public_id: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes
  }
}

const deleteImage = async (publicId) => {
  if (!publicId) return
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" })
}

module.exports = { cloudinary, uploadImage, deleteImage }
