import { Box, Text } from "@adminjs/design-system"

const ImagesList = (props: any) => {
  const { record } = props
  const images = record.params.images || []

  if (!images.length) {
    return <Text>No images</Text>
  }

  return (
    <Box>
      <img
        src={images[0] || "/placeholder.svg"}
        alt="Product"
        style={{
          width: "100px",
          height: "60px",
          objectFit: "cover",
          borderRadius: "4px",
        }}
      />
      {images.length > 1 && <Text>+{images.length - 1} more</Text>}
    </Box>
  )
}

export default ImagesList
