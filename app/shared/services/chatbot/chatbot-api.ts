import { axiosInstance } from '~/api/mutator/custom-fetch'

export type ChatbotMessageRole = 'USER' | 'ASSISTANT'

export interface ChatbotMediaFile {
  mediaFileId: number
  fileUrl: string
  fileKey?: string
  fileSize?: number
  fileType?: 'IMAGE' | 'VIDEO' | 'PDF'
  mediaPurpose?: string
  mediaStatus?: string
}

export interface ChatbotMessage {
  conversationMessageId: string
  role: ChatbotMessageRole
  content: string
  mediaFiles?: ChatbotMediaFile[]
  createdAt?: string
}

export interface ChatbotConversationSummary {
  conversationId: string
  title: string
  createdAt?: string
  updatedAt?: string
}

export interface ChatbotConversationDetail {
  conversationId: string
  title: string
  messages: ChatbotMessage[]
}

export interface ChatbotChatResponse {
  conversationId: string
  answer: string
  mediaFiles?: ChatbotMediaFile[]
}

export interface ChatbotConversationPage {
  totalPages: number
  totalElements: number
  size: number
  content: ChatbotConversationSummary[]
  number: number
  first: boolean
  last: boolean
  numberOfElements: number
  empty: boolean
}

interface ApiResponse<T> {
  code: number
  message: string
  success: boolean
  data: T
  timestamp: string
}

const CHATBOT_BASE_URL = '/api/chatbot'

export const chatbotApi = {
  async chat(params: { conversationId?: string; message?: string; images?: File[] }) {
    const formData = new FormData()

    params.images?.forEach((image) => {
      formData.append('images', image)
    })

    const response = await axiosInstance.post<ApiResponse<ChatbotChatResponse>>(`${CHATBOT_BASE_URL}/chat`, formData, {
      params: {
        conversationId: params.conversationId || undefined,
        message: params.message?.trim() || undefined
      }
    })

    return response.data
  },

  async getConversations(params: { page?: number; size?: number } = {}) {
    const response = await axiosInstance.get<ApiResponse<ChatbotConversationPage>>(
      `${CHATBOT_BASE_URL}/conversations`,
      {
        params: {
          page: params.page ?? 1,
          size: params.size ?? 20
        }
      }
    )

    return response.data
  },

  async getConversation(conversationId: string) {
    const response = await axiosInstance.get<ApiResponse<ChatbotConversationDetail>>(
      `${CHATBOT_BASE_URL}/conversations/${conversationId}`
    )

    return response.data
  }
}
