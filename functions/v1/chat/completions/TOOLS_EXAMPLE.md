# OpenAI Tools Support

The `/v1/chat/completions` endpoint now supports OpenAI-compatible tools (function calling).

## Basic Usage

### Request Format

```json
{
  "messages": [
    {
      "role": "user",
      "content": "What's the weather in San Francisco?"
    }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_current_weather",
        "description": "Get the current weather in a given location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The city and state, e.g. San Francisco, CA"
            },
            "unit": {
              "type": "string",
              "enum": ["celsius", "fahrenheit"],
              "description": "The unit of temperature"
            }
          },
          "required": ["location"]
        }
      }
    }
  ],
  "tool_choice": "auto"
}
```

### Response Format

When the model decides to call a function, the response will include `tool_calls`:

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "deepseek-r1-distill-qwen-32b",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": null,
        "tool_calls": [
          {
            "id": "call_abc123",
            "type": "function",
            "function": {
              "name": "get_current_weather",
              "arguments": "{\"location\": \"San Francisco, CA\", \"unit\": \"fahrenheit\"}"
            }
          }
        ]
      },
      "finish_reason": "tool_calls"
    }
  ]
}
```

## Tool Choice Options

The `tool_choice` parameter controls how the model uses tools:

### Auto (default)
```json
{
  "tool_choice": "auto"
}
```
The model decides whether to call a function or respond normally.

### Required
```json
{
  "tool_choice": "required"
}
```
Forces the model to call at least one function.

### None
```json
{
  "tool_choice": "none"
}
```
Prevents the model from calling any functions.

### Specific Function
```json
{
  "tool_choice": {
    "type": "function",
    "function": {
      "name": "get_current_weather"
    }
  }
}
```
Forces the model to call a specific function.

## Complete Example

```javascript
const response = await fetch('https://your-domain.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: '@tx/deepseek-ai/deepseek-r1-distill-qwen-32b',
    messages: [
      {
        role: 'user',
        content: 'What is the weather like in Boston and New York?'
      }
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'get_current_weather',
          description: 'Get the current weather in a given location',
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'The city and state, e.g. San Francisco, CA'
              },
              unit: {
                type: 'string',
                enum: ['celsius', 'fahrenheit']
              }
            },
            required: ['location']
          }
        }
      }
    ],
    tool_choice: 'auto'
  })
});

const data = await response.json();
console.log(data);
```

## Multi-Turn Conversation with Tools

After receiving a tool call, you need to execute the function and send the result back:

```javascript
// Step 1: Initial request
const step1 = await fetch('/v1/chat/completions', {
  method: 'POST',
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'What is the weather in SF?' }],
    tools: [/* ... */]
  })
});

const result1 = await step1.json();
const toolCall = result1.choices[0].message.tool_calls[0];

// Step 2: Execute the function
const weatherData = getWeather(JSON.parse(toolCall.function.arguments));

// Step 3: Send function result back
const step2 = await fetch('/v1/chat/completions', {
  method: 'POST',
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'What is the weather in SF?' },
      result1.choices[0].message,
      {
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(weatherData)
      }
    ],
    tools: [/* ... */]
  })
});

const result2 = await step2.json();
console.log(result2.choices[0].message.content);
```

## Backwards Compatibility

Requests without the `tools` parameter continue to work as before:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "model": "@tx/deepseek-ai/deepseek-r1-distill-qwen-32b"
}
```

## Additional Features

The endpoint also supports:
- `network`: Enable web search integration
- `model`: Select from available DeepSeek models
- Streaming responses with `stream: true`

## Error Handling

Invalid tool definitions will return validation errors:

```json
{
  "error": "Invalid request: tools[0].function.name is required"
}
```
