import { http, HttpResponse } from 'msw'
import { env } from '~/shared/config/env'

const BASE = env.API_URL || ''
const LOCAL_STORAGE_REVIEWS_KEY = 'petbuddy_mock_reviews_db'

export interface MockReview {
  reviewId: string
  productId: string
  productName: string
  userId: string
  fullName: string
  avatar: string | null
  rating: number
  content: string
  anonymous: boolean
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED' | 'HIDDEN'
  createdAt: string
  updatedAt: string
}

// Initial reviews database
const INITIAL_REVIEWS: MockReview[] = [
  {
    reviewId: 'review-init-1',
    productId: '10dc62d0-35fa-4eda-9f2b-dc1b4bdc4e54',
    productName: 'Thức ăn hạt Royal Canin Poodle Adult 1.5kg',
    userId: 'user-id-1',
    fullName: 'Nguyễn Văn Minh',
    avatar: null,
    rating: 5,
    content:
      'Sản phẩm hạt rất thơm ngon, cún nhà mình ăn rất hợp, không bị đi ngoài hay dị ứng gì. Lông bóng mượt hẳn ra.',
    anonymous: true,
    status: 'ACTIVE',
    createdAt: '2026-07-10T12:00:00.000Z',
    updatedAt: '2026-07-10T12:00:00.000Z'
  },
  {
    reviewId: 'review-init-2',
    productId: '10dc62d0-35fa-4eda-9f2b-dc1b4bdc4e54',
    productName: 'Thức ăn hạt Royal Canin Poodle Adult 1.5kg',
    userId: 'user-id-2',
    fullName: 'Lê Thị Thuỷ',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    rating: 4,
    content: 'Hạt hơi nhỏ nhưng Poodle nhà mình nhai tốt. Đóng gói cẩn thận, giao hàng nhanh.',
    anonymous: false,
    status: 'ACTIVE',
    createdAt: '2026-07-09T08:30:00.000Z',
    updatedAt: '2026-07-09T08:30:00.000Z'
  },
  {
    reviewId: 'review-init-3',
    productId: '10dc62d0-35fa-4eda-9f2b-dc1b4bdc4e54',
    productName: 'Thức ăn hạt Royal Canin Poodle Adult 1.5kg',
    userId: 'user-id-3',
    fullName: 'Trần Minh Hoàng',
    avatar: null,
    rating: 5,
    content: 'Sản phẩm chính hãng, tem mác đầy đủ. Giao hàng cực kỳ nhanh, đóng gói rất cẩn thận có xốp chống sốc.',
    anonymous: false,
    status: 'ACTIVE',
    createdAt: '2026-07-08T15:20:00.000Z',
    updatedAt: '2026-07-08T15:20:00.000Z'
  }
]

function getStoredReviews(): MockReview[] {
  if (typeof window === 'undefined') return INITIAL_REVIEWS
  const raw = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY)
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(INITIAL_REVIEWS))
    return INITIAL_REVIEWS
  }
  try {
    return JSON.parse(raw) as MockReview[]
  } catch {
    return INITIAL_REVIEWS
  }
}

function saveReviews(reviews: MockReview[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(reviews))
  }
}

function getLoggedInUser(request: Request) {
  if (typeof window === 'undefined') return null
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return null

  // Đọc thông tin user đang lưu trong localStorage
  const rawUser = localStorage.getItem('petbuddy-user')
  if (!rawUser) return null
  try {
    return JSON.parse(rawUser) as {
      userId: string
      email: string
      fullName: string
      role: string
      avatarUrl?: string
    }
  } catch {
    return null
  }
}

export const productReviewHandlers = [
  // GET /api/products/{productId}/reviews
  http.get(`${BASE}/api/products/:productId/reviews`, ({ params, request }) => {
    const { productId } = params as { productId: string }
    const url = new URL(request.url)
    const ratingQuery = url.searchParams.get('rating')
    const page = parseInt(url.searchParams.get('page') || '0', 10)
    const size = parseInt(url.searchParams.get('size') || '10', 10)
    const sortBy = url.searchParams.get('sortBy') || 'createdAt'
    const sortDirection = url.searchParams.get('sortDirection') || 'desc'

    let reviews = getStoredReviews().filter((r) => r.productId === productId && r.status === 'ACTIVE')

    // Filter by rating
    if (ratingQuery) {
      const ratingVal = parseInt(ratingQuery, 10)
      if (!isNaN(ratingVal)) {
        reviews = reviews.filter((r) => r.rating === ratingVal)
      }
    }

    // Sort
    reviews.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else if (sortBy === 'rating') {
        comparison = a.rating - b.rating
      }

      return sortDirection === 'desc' ? -comparison : comparison
    })

    // Paginate
    const totalElements = reviews.length
    const totalPages = Math.ceil(totalElements / size)
    const start = page * size
    const end = start + size
    const paginatedReviews = reviews.slice(start, end)

    return HttpResponse.json({
      code: 1000,
      data: {
        content: paginatedReviews,
        pageable: {
          pageNumber: page,
          pageSize: size
        },
        totalElements,
        totalPages,
        size,
        number: page,
        empty: paginatedReviews.length === 0
      },
      message: 'successfully',
      success: true,
      timestamp: new Date().toISOString()
    })
  }),

  // GET /api/products/{productId}/reviews/me
  http.get(`${BASE}/api/products/:productId/reviews/me`, ({ params, request }) => {
    const { productId } = params as { productId: string }
    const user = getLoggedInUser(request)

    if (!user) {
      // User not logged in, return null data
      return HttpResponse.json({
        code: 1000,
        data: null,
        message: 'Not authenticated',
        success: true,
        timestamp: new Date().toISOString()
      })
    }

    const reviews = getStoredReviews()
    const myReview = reviews.find((r) => r.productId === productId && r.userId === user.userId && r.status === 'ACTIVE')

    return HttpResponse.json({
      code: 1000,
      data: myReview || null,
      message: 'successfully',
      success: true,
      timestamp: new Date().toISOString()
    })
  }),

  // POST /api/products/{productId}/reviews
  http.post(`${BASE}/api/products/:productId/reviews`, async ({ params, request }) => {
    const { productId } = params as { productId: string }
    const user = getLoggedInUser(request)

    if (!user) {
      return HttpResponse.json(
        { code: 4001, message: 'Bạn cần đăng nhập để đánh giá', success: false },
        { status: 401 }
      )
    }

    const body = (await request.json()) as {
      rating: number
      content: string
      anonymous: boolean
    }

    const reviews = getStoredReviews()

    // Check if user already reviewed
    const existing = reviews.find((r) => r.productId === productId && r.userId === user.userId && r.status === 'ACTIVE')
    if (existing) {
      return HttpResponse.json(
        { code: 4002, message: 'Bạn đã đánh giá sản phẩm này rồi', success: false },
        { status: 400 }
      )
    }

    const newReview: MockReview = {
      reviewId: crypto.randomUUID(),
      productId,
      productName: 'Royal Canin Poodle Adult 1.5kg',
      userId: user.userId,
      fullName: user.fullName,
      avatar: user.avatarUrl || null,
      rating: body.rating,
      content: body.content,
      anonymous: body.anonymous,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    reviews.unshift(newReview)
    saveReviews(reviews)

    return HttpResponse.json({
      code: 1000,
      data: newReview,
      message: 'successfully',
      success: true,
      timestamp: new Date().toISOString()
    })
  }),

  // PUT /api/reviews/{reviewId}
  http.put(`${BASE}/api/reviews/:reviewId`, async ({ params, request }) => {
    const { reviewId } = params as { reviewId: string }
    const user = getLoggedInUser(request)

    if (!user) {
      return HttpResponse.json(
        { code: 4001, message: 'Bạn cần đăng nhập để sửa đánh giá', success: false },
        { status: 401 }
      )
    }

    const body = (await request.json()) as {
      rating: number
      content: string
      anonymous: boolean
    }

    const reviews = getStoredReviews()
    const reviewIdx = reviews.findIndex((r) => r.reviewId === reviewId && r.status === 'ACTIVE')

    if (reviewIdx === -1) {
      return HttpResponse.json({ code: 4003, message: 'Không tìm thấy đánh giá', success: false }, { status: 404 })
    }

    const review = reviews[reviewIdx]

    // Check ownership
    if (review.userId !== user.userId) {
      return HttpResponse.json(
        { code: 4004, message: 'Bạn không có quyền sửa đánh giá này', success: false },
        { status: 403 }
      )
    }

    const updatedReview: MockReview = {
      ...review,
      rating: body.rating,
      content: body.content,
      anonymous: body.anonymous,
      updatedAt: new Date().toISOString()
    }

    reviews[reviewIdx] = updatedReview
    saveReviews(reviews)

    return HttpResponse.json({
      code: 1000,
      data: updatedReview,
      message: 'successfully',
      success: true,
      timestamp: new Date().toISOString()
    })
  }),

  // DELETE /api/reviews/{reviewId}
  http.delete(`${BASE}/api/reviews/:reviewId`, ({ params, request }) => {
    const { reviewId } = params as { reviewId: string }
    const user = getLoggedInUser(request)

    if (!user) {
      return HttpResponse.json(
        { code: 4001, message: 'Bạn cần đăng nhập để xóa đánh giá', success: false },
        { status: 401 }
      )
    }

    const reviews = getStoredReviews()
    const reviewIdx = reviews.findIndex((r) => r.reviewId === reviewId && r.status !== 'DELETED')

    if (reviewIdx === -1) {
      return HttpResponse.json({ code: 4003, message: 'Không tìm thấy đánh giá', success: false }, { status: 404 })
    }

    const review = reviews[reviewIdx]

    // Check ownership or Manager/Admin role
    const isOwner = review.userId === user.userId
    const isManagerOrAdmin = user.role === 'MANAGER' || user.role === 'ADMIN'

    if (!isOwner && !isManagerOrAdmin) {
      return HttpResponse.json(
        { code: 4004, message: 'Bạn không có quyền xóa đánh giá này', success: false },
        { status: 403 }
      )
    }

    // Soft delete or hard delete - let's soft delete by changing status
    reviews[reviewIdx].status = 'DELETED'
    saveReviews(reviews)

    return HttpResponse.json({
      code: 1000,
      message: 'successfully',
      success: true,
      timestamp: new Date().toISOString()
    })
  }),

  // GET /api/management/reviews
  http.get(`${BASE}/api/management/reviews`, ({ request }) => {
    const url = new URL(request.url)
    const keyword = url.searchParams.get('keyword')
    const ratingQuery = url.searchParams.get('rating')
    const statusQuery = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '0', 10)
    const size = parseInt(url.searchParams.get('size') || '10', 10)
    const sortBy = url.searchParams.get('sortBy') || 'createdAt'
    const sortDirection = url.searchParams.get('sortDirection') || 'desc'

    let reviews = getStoredReviews().filter((r) => r.status !== 'DELETED')

    // Filter by keyword
    if (keyword) {
      const kw = keyword.toLowerCase()
      reviews = reviews.filter(
        (r) =>
          r.productName.toLowerCase().includes(kw) ||
          r.content.toLowerCase().includes(kw) ||
          r.fullName.toLowerCase().includes(kw)
      )
    }

    // Filter by rating
    if (ratingQuery) {
      const ratingVal = parseInt(ratingQuery, 10)
      if (!isNaN(ratingVal)) {
        reviews = reviews.filter((r) => r.rating === ratingVal)
      }
    }

    // Filter by status
    if (statusQuery) {
      reviews = reviews.filter((r) => r.status === statusQuery)
    }

    // Sort
    reviews.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else if (sortBy === 'rating') {
        comparison = a.rating - b.rating
      }

      return sortDirection === 'desc' ? -comparison : comparison
    })

    // Paginate
    const totalElements = reviews.length
    const totalPages = Math.ceil(totalElements / size)
    const start = page * size
    const end = start + size
    const paginatedReviews = reviews.slice(start, end)

    // Map to manager structure
    const content = paginatedReviews.map((r) => ({
      reviewId: r.reviewId,
      rating: r.rating,
      content: r.content,
      anonymous: r.anonymous,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      deletedAt: null,
      productId: r.productId,
      productCode: `PRD${r.productId.substring(0, 6).toUpperCase()}`,
      productName: r.productName,
      userId: r.userId,
      userEmail: `${r.fullName
        .toLowerCase()
        .replace(/\s/g, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')}@gmail.com`,
      userFullName: r.fullName,
      userAvatar: r.avatar
    }))

    return HttpResponse.json({
      code: 1000,
      data: {
        content,
        pageable: {
          pageNumber: page,
          pageSize: size
        },
        totalElements,
        totalPages,
        size,
        number: page,
        empty: content.length === 0
      },
      message: 'successfully',
      success: true,
      timestamp: new Date().toISOString()
    })
  }),

  // GET /api/management/reviews/{reviewId}
  http.get(`${BASE}/api/management/reviews/:reviewId`, ({ params }) => {
    const { reviewId } = params as { reviewId: string }
    const reviews = getStoredReviews()
    const r = reviews.find((x) => x.reviewId === reviewId && x.status !== 'DELETED')

    if (!r) {
      return HttpResponse.json({ code: 4003, message: 'Không tìm thấy đánh giá', success: false }, { status: 404 })
    }

    const detail = {
      reviewId: r.reviewId,
      rating: r.rating,
      content: r.content,
      anonymous: r.anonymous,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      deletedAt: null,
      productId: r.productId,
      productCode: `PRD${r.productId.substring(0, 6).toUpperCase()}`,
      productName: r.productName,
      userId: r.userId,
      userEmail: `${r.fullName
        .toLowerCase()
        .replace(/\s/g, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')}@gmail.com`,
      userFullName: r.fullName,
      userAvatar: r.avatar
    }

    return HttpResponse.json({
      code: 1000,
      data: detail,
      message: 'successfully',
      success: true,
      timestamp: new Date().toISOString()
    })
  }),

  // PATCH /api/management/reviews/{reviewId}/status
  http.patch(`${BASE}/api/management/reviews/:reviewId/status`, async ({ params, request }) => {
    const { reviewId } = params as { reviewId: string }
    const body = (await request.json()) as { status: 'ACTIVE' | 'HIDDEN' }

    const reviews = getStoredReviews()
    const reviewIdx = reviews.findIndex((r) => r.reviewId === reviewId && r.status !== 'DELETED')

    if (reviewIdx === -1) {
      return HttpResponse.json({ code: 4003, message: 'Không tìm thấy đánh giá', success: false }, { status: 404 })
    }

    reviews[reviewIdx].status = body.status
    reviews[reviewIdx].updatedAt = new Date().toISOString()
    saveReviews(reviews)

    return HttpResponse.json({
      code: 1000,
      message: 'successfully',
      success: true,
      timestamp: new Date().toISOString()
    })
  })
]
