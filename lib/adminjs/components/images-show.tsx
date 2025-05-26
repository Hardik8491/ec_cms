import { Box, Text } from "@adminjs/design-system"

const ImagesShow = (props: any) => {
  const { record } = props
  const images = record.params.images || []

  if (!images.length) {
    return <Text>No images</Text>
  }

  return (
    <Box>
      {images.map((image: string, index: number) => (
        <Box key={index} mb="default">
          <img
            src={image || "/placeholder.svg"}
            alt={`Product ${index + 1}`}
            style={{
              maxWidth: "100%",
              maxHeight: "200px",
              borderRadius: "4px",
            }}
          />
        </Box>
      ))}
    </Box>
  )
}

export default ImagesShow
