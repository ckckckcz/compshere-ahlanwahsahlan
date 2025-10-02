"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Mic,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
  MessageSquare,
  Bot,
  MicOff,
  Ticket,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface AgentRecommendation {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

interface AIModel {
  id: string
  name: string
  provider: string
}

// 🔹 Updated AI Models dengan ID yang valid
const aiModels: AIModel[] = [
  { id: "google/gemma-3n-e2b-it:free", name: "Gemma 3n E2B IT", provider: "Google" },
  { id: "x-ai/grok-4-fast:free", name: "Grok 4 Fast", provider: "xAI" },
  { id: "openai/gpt-oss-120b:free", name: "GPT-OSS-120B", provider: "OpenAI" },
]

// 🔹 Disesuaikan untuk KAI
const agentRecommendations: AgentRecommendation[] = [
  {
    id: "ticketing",
    title: "Asisten Pemesanan Tiket",
    description: "Bantu pesan tiket kereta, cek jadwal, atau ubah reservasi.",
    icon: <Ticket className="w-6 h-6 text-blue-500" />,
  },
  {
    id: "support",
    title: "Layanan Pelanggan",
    description: "Jawab pertanyaan tentang layanan KAI, refund, atau info perjalanan.",
    icon: <MessageSquare className="w-6 h-6 text-green-500" />,
  },
  {
    id: "lost-found",
    title: "Barang Hilang",
    description: "Laporkan atau cari barang yang hilang di stasiun atau kereta.",
    icon: <Search className="w-6 h-6 text-purple-500" />,
  },
]

function TypingText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, 30)
      return () => clearTimeout(timer)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, onComplete])

  return <span>{displayedText}</span>
}

export function AIChatAgent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [selectedModel, setSelectedModel] = useState<AIModel>(aiModels[0])
  const [isRecording, setIsRecording] = useState(false)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [isInitialState, setIsInitialState] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isThinking])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputValue])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    }

    const currentInput = inputValue
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsInitialState(false)
    setIsThinking(true)

    try {
      // Get API key from environment variable with proper prefix
      const apiKey = process.env.NEXT_PUBLIC_OPEN_ROUTER_API || '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'
      
      console.log('API Key exists:', !!apiKey) // Debug log
      console.log('Selected model:', selectedModel.id) // Debug log

      const requestBody = {
        model: selectedModel.id,
        messages: [
          { 
            role: "system", 
            content: "You are a helpful assistant for KAI Virtual Assistant, assisting with train ticket bookings, schedules, refunds, and customer service inquiries. Always respond in Indonesian language." 
          },
          { role: "user", content: currentInput },
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: false, // Explicitly disable streaming
      }

      console.log('Request body:', requestBody) // Debug log

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
          "X-Title": "KAI Virtual Assistant",
        },
        body: JSON.stringify(requestBody),
      })

      console.log('Response status:', response.status) // Debug log

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        
        // Try fallback model jika model utama gagal
        if (selectedModel.id !== aiModels[0].id) {
          console.log('Trying fallback model...')
          const fallbackRequestBody = {
            ...requestBody,
            model: aiModels[0].id, // Use first model as fallback
          }
          
          const fallbackResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
              "X-Title": "KAI Virtual Assistant",
            },
            body: JSON.stringify(fallbackRequestBody),
          })
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            if (fallbackData.choices && fallbackData.choices.length > 0 && fallbackData.choices[0]?.message?.content) {
              const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                content: `[Using fallback model: ${aiModels[0].name}]\n\n${fallbackData.choices[0].message.content}`,
                isUser: false,
                timestamp: new Date(),
              }

              setIsThinking(false)
              setIsTyping(true)
              setTypingMessageId(aiResponse.id)
              setMessages((prev) => [...prev, aiResponse])
              return
            }
          }
        }
        
        throw new Error(`HTTP ${response.status}: Model "${selectedModel.id}" tidak tersedia atau tidak valid`)
      }

      const data = await response.json()
      console.log('API Response:', data) // Debug log

      if (data.choices && data.choices.length > 0 && data.choices[0]?.message?.content) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: data.choices[0].message.content,
          isUser: false,
          timestamp: new Date(),
        }

        setIsThinking(false)
        setIsTyping(true)
        setTypingMessageId(aiResponse.id)
        setMessages((prev) => [...prev, aiResponse])
      } else if (data.error) {
        console.error('API Error:', data.error)
        throw new Error(data.error.message || 'API Error occurred')
      } else {
        console.error('Unexpected API response structure:', data)
        throw new Error("Struktur response API tidak sesuai yang diharapkan")
      }
    } catch (error) {
      console.error("Error fetching from OpenRouter:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error 
          ? `Maaf, terjadi kesalahan: ${error.message}. Silakan coba model lain atau hubungi tim support.`
          : "Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.",
        isUser: false,
        timestamp: new Date(),
      }
      setIsThinking(false)
      setIsTyping(true)
      setTypingMessageId(errorMessage.id)
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleTypingComplete = () => {
    setIsTyping(false)
    setTypingMessageId(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  const selectRecommendation = (recommendation: AgentRecommendation) => {
    setInputValue(`${recommendation.title} - ${recommendation.description}`)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    if (diffInMinutes < 1) return "baru saja"
    return `${diffInMinutes} mnt`
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  return (
    <TooltipProvider>
      <div className="w-full h-[600px] flex flex-col bg-background rounded-lg border border-border overflow-hidden relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#003D79] rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">KAI Virtual Assistant</h3>
              <p className="text-xs text-muted-foreground">Didukung oleh {selectedModel.name}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {isInitialState ? (
            <div className="h-full flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-background to-muted/20 overflow-y-auto">
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                  Selamat datang di KAI Asisten Virtual 🚆
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Saya siap membantu Anda memesan tiket, mengecek jadwal, hingga layanan pelanggan.
                </p>
              </motion.div>

              {/* Rekomendasi */}
              <motion.div
                className="w-full mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-sm font-medium text-foreground mb-4">Pilihan cepat</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agentRecommendations.map((agent, index) => (
                    <motion.button
                      key={agent.id}
                      onClick={() => selectRecommendation(agent)}
                      className="p-4 bg-card hover:bg-accent rounded-lg text-left transition-colors duration-200 border border-border"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {agent.icon}
                        <h4 className="font-medium text-foreground text-sm">{agent.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{agent.description}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            /* Chat window */
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/10">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-3", message.isUser ? "justify-end" : "justify-start")}
                >
                  {!message.isUser && (
                    <div className="w-8 h-8 bg-[#003D79] rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] p-3 relative group",
                      message.isUser
                        ? "bg-[#003D79] text-white rounded-bl-xl rounded-br-xl rounded-tl-xl"
                        : "rounded-bl-xl rounded-br-xl rounded-tr-xl bg-card text-foreground border border-border",
                    )}
                  >
                    <p className="text-sm leading-relaxed">
                      {!message.isUser && typingMessageId === message.id ? (
                        <TypingText text={message.content} onComplete={handleTypingComplete} />
                      ) : (
                        message.content
                      )}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                      {!message.isUser && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <ThumbsUp className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Jawaban membantu</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <ThumbsDown className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Jawaban kurang tepat</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => copyMessage(message.content)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Salin pesan</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <RotateCcw className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ulangi jawaban</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 bg-[#003D79] rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-card text-foreground border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150" />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-300" />
                      </div>
                      <span className="text-sm text-muted-foreground">KAI Asisten sedang berpikir...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="h-8 text-xs"
              >
                <span>{selectedModel.name}</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
              <AnimatePresence>
                {showModelDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-full mb-2 left-0 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[200px] z-20"
                  >
                    {aiModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model)
                          setShowModelDropdown(false)
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-accent transition-colors duration-200 text-sm"
                      >
                        <div className="font-medium text-foreground">{model.name}</div>
                        <div className="text-xs text-muted-foreground">{model.provider}</div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isInitialState ? "Tanyakan seputar layanan KAI..." : "Ketik pesan Anda..."}
                className="min-h-[44px] max-h-[120px] resize-none pr-12"
                rows={1}
                disabled={isThinking || isTyping}
              />
            </div>
            <div className="flex items-center gap-1">
              <input ref={fileInputRef} type="file" className="hidden" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleRecording}
                    className={cn("h-10 w-10 p-0", isRecording && "text-red-500 bg-red-100 hover:bg-red-200")}
                    disabled={isThinking || isTyping}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isRecording ? "Stop rekaman" : "Input suara"}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isThinking || isTyping}
                    size="sm"
                    className="h-10 w-10 p-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Kirim pesan</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}