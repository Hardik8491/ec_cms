"use client"

import type React from "react"
import { useState } from "react"
import { Box, Text, TextArea } from "@adminjs/design-system"

const ImagesEdit = (props: any) => {
  const { onChange, property, record } = props
  const images = record.params.images || []
  const [imagesText, setImagesText] = useState(images.join("\n"))

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setImagesText(e.target.value)
    const newImages = e.target.value
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0)

    onChange(property.name, newImages)
  }

  return (
    <Box>
      <Text mb="default">Enter image URLs (one per line)</Text>
      <TextArea value={imagesText} onChange={handleChange} rows={5} />
      {images.length > 0 && (
        <Box mt="lg">
          <Text mb="default">Current Images:</Text>
          <Box display="flex" flexWrap="wrap">
            {images.map((image: string, index: number) => (
              <Box key={index} mr="default" mb="default">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Product ${index + 1}`}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default ImagesEdit
