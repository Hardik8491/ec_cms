"use client"

import type React from "react"
import { useState } from "react"
import { Box, Text, TextArea } from "@adminjs/design-system"

const JsonEdit = (props: any) => {
  const { onChange, property, record } = props
  const value = record.params[property.name]

  const initialValue = value ? (typeof value === "string" ? value : JSON.stringify(value, null, 2)) : ""

  const [jsonText, setJsonText] = useState(initialValue)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value)
    setError("")
  }

  const handleBlur = () => {
    try {
      if (jsonText.trim()) {
        const parsedJson = JSON.parse(jsonText)
        onChange(property.name, parsedJson)
      } else {
        onChange(property.name, null)
      }
    } catch (e) {
      setError("Invalid JSON format")
    }
  }

  return (
    <Box>
      <TextArea value={jsonText} onChange={handleChange} onBlur={handleBlur} rows={10} />
      {error && (
        <Text color="danger" mt="default">
          {error}
        </Text>
      )}
    </Box>
  )
}

export default JsonEdit
