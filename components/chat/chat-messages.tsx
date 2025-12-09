import React, { useRef, useEffect } from 'react'
import { Message, MessageContent } from '@/components/ai-elements/message'
import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation'
import { Loader } from '@/components/ai-elements/loader'
import { MessageRenderer } from '@/components/message-renderer'
import { sharedComponents } from '@/components/shared-components'
import { StreamingMessage } from '@v0-sdk/react'

interface ChatMessage {
  type: 'user' | 'assistant'
  content: string | any
  isStreaming?: boolean
  stream?: ReadableStream<Uint8Array> | null
}

interface Chat {
  id: string
  demo?: string
  url?: string
}

interface ChatMessagesProps {
  chatHistory: ChatMessage[]
  isLoading: boolean
  currentChat: Chat | null
  onStreamingComplete: (finalContent: any) => void
  onChatData: (chatData: any) => void
  onStreamingStarted?: () => void
}

export function ChatMessages({
  chatHistory,
  isLoading,
  currentChat,
  onStreamingComplete,
  onChatData,
  onStreamingStarted,
}: ChatMessagesProps) {
  const streamingStartedRef = useRef(false)

  // Reset the streaming started flag when a new message starts loading
  useEffect(() => {
    if (isLoading) {
      streamingStartedRef.current = false
    }
  }, [isLoading])

  if (chatHistory.length === 0) {
    return (
      <Conversation>
        <ConversationContent>
          <div>
            {/* Empty conversation - messages will appear here when they load */}
          </div>
        </ConversationContent>
      </Conversation>
    )
  }

  return (
    <>
      <Conversation>
        <ConversationContent>
          {chatHistory.map((msg, index) => (
            <Message from={msg.type} key={index}>
              {msg.isStreaming && msg.stream ? (
                <StreamingMessage
                  stream={msg.stream}
                  messageId={`msg-${index}`}
                  role={msg.type}
                  onComplete={onStreamingComplete}
                  onChatData={onChatData}
                  onChunk={(chunk) => {
                    // Hide external loader once we start receiving content (only once)
                    if (onStreamingStarted && !streamingStartedRef.current) {
                      streamingStartedRef.current = true
                      onStreamingStarted()
                    }
                  }}
                  onError={(error) => console.error('Streaming error:', error)}
                  components={sharedComponents}
                  showLoadingIndicator={false}
                />
              ) : (
                <MessageRenderer
                  content={msg.content}
                  role={msg.type}
                  messageId={`msg-${index}`}
                />
              )}
            </Message>
          ))}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <div className="relative">
                <Loader size={24} className="text-blue-600 dark:text-blue-400" />
                <div className="absolute inset-0 animate-ping opacity-20">
                  <Loader size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 font-medium animate-pulse">
                Generating your design...
              </p>
            </div>
          )}
        </ConversationContent>
      </Conversation>
    </>
  )
}
