"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, Mic, MicOff, Sparkles, TrendingUp, Users, Package, BarChart3, Lightbulb, Zap } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  actions?: Array<{
    label: string
    action: string
    data?: any
  }>
}

interface Suggestion {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  query: string
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const suggestions: Suggestion[] = [
    {
      id: "1",
      title: "Sales Performance",
      description: "How are my sales performing this month?",
      icon: <TrendingUp className="h-5 w-5" />,
      query: "Show me my sales performance for this month compared to last month",
    },
    {
      id: "2",
      title: "Top Products",
      description: "Which products are selling best?",
      icon: <Package className="h-5 w-5" />,
      query: "What are my top-selling products this week?",
    },
    {
      id: "3",
      title: "Customer Insights",
      description: "Tell me about my customers",
      icon: <Users className="h-5 w-5" />,
      query: "Give me insights about my customer segments and their behavior",
    },
    {
      id: "4",
      title: "Inventory Alerts",
      description: "Check my inventory status",
      icon: <BarChart3 className="h-5 w-5" />,
      query: "Show me products that are low in stock or need reordering",
    },
    {
      id: "5",
      title: "Marketing Ideas",
      description: "Suggest marketing campaigns",
      icon: <Lightbulb className="h-5 w-5" />,
      query: "Suggest some marketing campaign ideas for my best-selling products",
    },
    {
      id: "6",
      title: "Pricing Optimization",
      description: "Optimize my product pricing",
      icon: <Zap className="h-5 w-5" />,
      query: "Analyze my pricing strategy and suggest optimizations",
    },
  ]

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: "welcome",
        type: "assistant",
        content:
          "👋 Hello! I'm your AI business assistant. I can help you analyze your store performance, suggest optimizations, and answer questions about your e-commerce business. What would you like to know?",
        timestamp: new Date(),
      },
    ])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          context: "ecommerce_assistant",
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.response,
        timestamp: new Date(),
        actions: data.actions,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (query: string) => {
    sendMessage(query)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false)
      // Stop voice recognition
    } else {
      setIsListening(true)
      // Start voice recognition
      toast.info("Voice input feature coming soon!")
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Business Assistant</h1>
            <p className="text-gray-600">Get intelligent insights and recommendations for your business</p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Suggestions Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Try these common queries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <Button
                      key={suggestion.id}
                      variant="outline"
                      className="w-full justify-start h-auto p-3 text-left"
                      onClick={() => handleSuggestionClick(suggestion.query)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-primary">{suggestion.icon}</div>
                        <div>
                          <div className="font-medium text-sm">{suggestion.title}</div>
                          <div className="text-xs text-muted-foreground">{suggestion.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Chat with AI Assistant</span>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Online
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <ScrollArea className="flex-1 pr-4 mb-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex max-w-[80%] ${
                            message.type === "user" ? "flex-row-reverse" : "flex-row"
                          } items-start space-x-3`}
                        >
                          <Avatar className="w-8 h-8">
                            {message.type === "assistant" ? (
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            ) : (
                              <AvatarImage src="/placeholder.svg" alt="User" />
                            )}
                          </Avatar>
                          <div
                            className={`rounded-lg p-3 ${
                              message.type === "user" ? "bg-primary text-primary-foreground ml-3" : "bg-muted mr-3"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {message.actions && (
                              <div className="mt-3 space-y-2">
                                {message.actions.map((action, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="mr-2"
                                    onClick={() => {
                                      // Handle action
                                      toast.info(`Action: ${action.label}`)
                                    }}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                            <p className="text-xs opacity-70 mt-2">{message.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about your business..."
                      disabled={isLoading}
                      className="pr-12"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2"
                      onClick={toggleVoiceInput}
                    >
                      {isListening ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button onClick={() => sendMessage(inputValue)} disabled={isLoading || !inputValue.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
