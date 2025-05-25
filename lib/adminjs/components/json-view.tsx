import { Box, Text } from "@adminjs/design-system"

const JsonView = (props: any) => {
  const { record, property } = props
  const value = record.params[property.name]

  if (!value) {
    return <Text>No data</Text>
  }

  try {
    const jsonValue = typeof value === "string" ? JSON.parse(value) : value
    return (
      <Box>
        <pre
          style={{
            background: "#f5f5f5",
            padding: "10px",
            borderRadius: "4px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(jsonValue, null, 2)}
        </pre>
      </Box>
    )
  } catch (error) {
    return <Text>Invalid JSON</Text>
  }
}

export default JsonView
