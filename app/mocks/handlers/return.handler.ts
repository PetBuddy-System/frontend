import { http, HttpResponse } from 'msw'
import { env } from '~/shared/config/env'
import { getStoredOrders } from './order.handler'

const BASE = env.API_URL || ''
const LOCAL_STORAGE_RETURNS_KEY = 'petbuddy_mock_returns_db'

export interface MockReturnRequest {
  returnRequestId: number
  returnCode: string
  orderId: number
  orderCode: string
  type: string
  reason: string
  description?: string
  status: string
  refundMethod: string
  refundStatus?: string
  refundAmount: number
  bankName?: string | null
  bankAccountNumber?: string | null
  bankAccountHolder?: string | null
  createdAt: string
  returnItems: {
    returnItemId: number
    orderDetailId?: number
    productName: string
    productImage?: string | null
    quantity: number
    refundAmount: number
  }[]
  mediaFiles: any[]
  requestedBy?: any
  processedBy?: any
  coordinator?: any
  shipper?: any
  processedAt?: string | null
  approvedAt?: string | null
  pickedUpAt?: string | null
  returnedToStoreAt: string | null
  completedAt: string | null
  restockedAt: string | null
  staffNote: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  updatedAt?: string
}

const INITIAL_RETURNS: MockReturnRequest[] = [
  {
    returnRequestId: 1,
    returnCode: 'RTNCE45C8',
    orderId: 4,
    orderCode: 'OD391007',
    type: 'RETURN',
    reason: 'WRONG_PRODUCT',
    description: 'Sản phẩm không đúng với mô tả trên website',
    status: 'PENDING',
    refundMethod: 'STRIPE_PAYMENT',
    refundStatus: 'PENDING',
    refundAmount: 308000,
    createdAt: '2026-07-11T12:31:58.680Z',
    requestedBy: {
      userId: '96e782a8-13d8-48d0-a0af-0398f22e7504',
      fullName: 'Nguyễn Văn Khách',
      email: 'user@gmail.com'
    },
    processedBy: null,
    address: '123 Đường Sư Vạn Hạnh, Phường 12, Quận 10, TP.HCM',
    latitude: 10.7769,
    longitude: 106.7009,
    returnItems: [
      {
        returnItemId: 1,
        orderDetailId: 11,
        productName: 'Beaphar Top 10 Dog Vitamins 180 Tablets',
        quantity: 1,
        refundAmount: 196000
      },
      {
        returnItemId: 2,
        orderDetailId: 13,
        productName: 'Petstages Dogwood Stick',
        quantity: 1,
        refundAmount: 112000
      }
    ],
    mediaFiles: [
      {
        mediaFileId: 88,
        fileUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400&auto=format&fit=crop',
        fileType: 'IMAGE'
      }
    ]
  },
  {
    returnRequestId: 2,
    returnCode: 'RTNA1B2C3',
    orderId: 5,
    orderCode: 'OD391008',
    type: 'EXCHANGE',
    reason: 'DAMAGED',
    description: 'Bao bì bị rách và đổ ra ngoài',
    status: 'APPROVED',
    refundMethod: 'BANK_TRANSFER',
    refundStatus: 'SUCCESS',
    refundAmount: 150000,
    createdAt: '2026-07-10T09:15:30.000Z',
    requestedBy: {
      userId: 'c5210815-58a4-4f81-a75d-69b7654a9b51',
      fullName: 'Trần Thị Hằng',
      email: 'hang.tran@gmail.com'
    },
    processedBy: {
      userId: '34d8ed7a-81af-456e-914d-f2decfd61d10',
      fullName: 'Cashier Staff',
      email: 'staff2@gmail.com',
      role: 'STAFF'
    },
    processedAt: '2026-07-10T11:20:00.000Z',
    staffNote: 'Đã duyệt yêu cầu và chuẩn bị gửi hàng đổi mới',
    address: '789 Đường Lê Lợi, Quận 1, TP.HCM',
    latitude: 10.7725,
    longitude: 106.6983,
    returnItems: [
      {
        returnItemId: 3,
        orderDetailId: 14,
        productName: 'Hạt Royal Canin Poodle Puppy 1.5kg',
        quantity: 1,
        refundAmount: 150000
      }
    ],
    mediaFiles: []
  },
  {
    returnRequestId: 3,
    returnCode: 'RTND4E5F6',
    orderId: 6,
    orderCode: 'OD391009',
    type: 'WARRANTY',
    reason: 'OTHER',
    description: 'Máy cho ăn tự động không lên nguồn dù đã cắm điện',
    status: 'COMPLETED',
    refundMethod: 'STRIPE_PAYMENT',
    refundStatus: 'SUCCESS',
    refundAmount: 1200000,
    createdAt: '2026-07-08T15:45:00.000Z',
    requestedBy: {
      userId: 'fa720e1a-c15d-45db-b9bb-20e89e0839e9',
      fullName: 'Lê Hoàng Sơn',
      email: 'son.le@gmail.com'
    },
    processedBy: {
      userId: '34d8ed7a-81af-456e-914d-f2decfd61d10',
      fullName: 'Cashier Staff',
      email: 'staff2@gmail.com',
      role: 'STAFF'
    },
    processedAt: '2026-07-09T09:00:00.000Z',
    completedAt: '2026-07-09T10:00:00.000Z',
    staffNote: 'Nhận bảo hành, đã kiểm tra lỗi bo mạch và hoàn tất hoàn tiền',
    returnedToStoreAt: '2023-11-04T16:00:00.000Z',
    address: '456 Phố Vọng, Hai Bà Trưng, Hà Nội',
    latitude: 21.0031,
    longitude: 105.8458,
    returnItems: [
      {
        returnItemId: 4,
        orderDetailId: 18,
        productName: 'Máy Cho Ăn Tự Động Smart Pet Feeder',
        quantity: 1,
        refundAmount: 1200000
      }
    ],
    mediaFiles: [
      {
        mediaFileId: 89,
        fileUrl: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=400&auto=format&fit=crop',
        fileType: 'IMAGE'
      }
    ]
  },
  {
    returnRequestId: 4,
    returnCode: 'RTNR9S8T7',
    orderId: 7,
    orderCode: 'OD391010',
    type: 'RETURN',
    reason: 'CUSTOMER_CHANGED_MIND',
    description: 'Tôi mua nhầm kích thước đai dắt, muốn trả hàng',
    status: 'REJECTED',
    refundMethod: 'STRIPE_PAYMENT',
    refundStatus: 'FAILED',
    refundAmount: 250000,
    createdAt: '2026-07-05T08:30:00.000Z',
    requestedBy: {
      userId: 'a429bbd1-678b-4b2a-ae6b-1981cc13ee2e',
      fullName: 'Phạm Minh Đức',
      email: 'duc.pham@gmail.com'
    },
    processedBy: {
      userId: '34d8ed7a-81af-456e-914d-f2decfd61d10',
      fullName: 'Cashier Staff',
      email: 'staff2@gmail.com',
      role: 'STAFF'
    },
    processedAt: '2026-07-05T14:22:00.000Z',
    staffNote: 'Không chấp nhận đổi trả do khách đổi ý mua hàng sau khi đã bóc tem niêm phong sản phẩm',
    returnItems: [
      {
        returnItemId: 5,
        orderDetailId: 21,
        productName: 'Đai Dắt Chó Đi Dạo Phản Quang Hỗ Trợ Lực',
        quantity: 1,
        refundAmount: 250000
      }
    ],
    mediaFiles: []
  }
]

export function getStoredReturns(): MockReturnRequest[] {
  if (typeof window === 'undefined') return INITIAL_RETURNS
  const raw = localStorage.getItem(LOCAL_STORAGE_RETURNS_KEY)
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_RETURNS_KEY, JSON.stringify(INITIAL_RETURNS))
    return INITIAL_RETURNS
  }
  try {
    return JSON.parse(raw) as MockReturnRequest[]
  } catch {
    return INITIAL_RETURNS
  }
}

export function saveReturns(returns: MockReturnRequest[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_RETURNS_KEY, JSON.stringify(returns))
  }
}

export const returnHandlers = [
  // 1. TÍNH TIỀN HOÀN: POST /api/returns/calculate-refund
  http.post(`${BASE}/api/returns/calculate-refund`, async ({ request }) => {
    try {
      const body = (await request.json()) as {
        orderId: number
        reason: string
        items: { orderDetailId: number; quantity: number }[]
      }

      const orders = getStoredOrders()
      const order = orders.find((o) => o.orderId === body.orderId)

      let totalRefundAmount = 0
      const refundItems = body.items.map((item) => {
        // Find matching item in mock order
        // We map orderDetailId to order.items[index]
        const orderItemIndex = item.orderDetailId >= 100 ? item.orderDetailId - 100 : item.orderDetailId
        const orderItem = order?.items[orderItemIndex] || order?.items[0]

        const unitPrice = orderItem ? orderItem.price : 150000
        const refundAmount = unitPrice * item.quantity
        totalRefundAmount += refundAmount

        return {
          orderDetailId: item.orderDetailId,
          productName: orderItem ? orderItem.name : 'Sản phẩm hoàn trả',
          quantity: item.quantity,
          refundAmount
        }
      })

      return HttpResponse.json({
        code: 200,
        message: 'Tính phí hoàn trả thành công',
        success: true,
        data: {
          totalRefundAmount,
          items: refundItems
        },
        timestamp: new Date().toISOString()
      })
    } catch (err: unknown) {
      return HttpResponse.json(
        {
          code: 400,
          message: err instanceof Error ? err.message : 'Lỗi tính tiền hoàn trả',
          success: false,
          data: null,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
  }),

  // 2. TẠO YÊU CẦU HOÀN: POST /api/returns
  http.post(`${BASE}/api/returns`, async ({ request }) => {
    try {
      const body = (await request.json()) as {
        orderId: number
        type: string
        reason: string
        description: string
        refundMethod: string
        bankName?: string
        bankAccountNumber?: string
        bankAccountHolder?: string
        items: { orderDetailId: number; quantity: number }[]
      }

      const orders = getStoredOrders()
      const order = orders.find((o) => o.orderId === body.orderId)
      const orderCode = order ? order.orderCode : `PET-${body.orderId}`

      const returns = getStoredReturns()
      const nextId = returns.length > 0 ? Math.max(...returns.map((r) => r.returnRequestId)) + 1 : 1
      const returnCode = `RTN${Math.random().toString(36).substring(2, 8).toUpperCase()}`

      let totalRefundAmount = 0
      const returnItems = body.items.map((item, idx) => {
        const orderItemIndex = item.orderDetailId >= 100 ? item.orderDetailId - 100 : item.orderDetailId
        const orderItem = order?.items[orderItemIndex] || order?.items[0]

        const unitPrice = orderItem ? orderItem.price : 150000
        const refundAmount = unitPrice * item.quantity
        totalRefundAmount += refundAmount

        return {
          returnItemId: idx + 1,
          productName: orderItem ? orderItem.name : 'Sản phẩm hoàn trả',
          quantity: item.quantity,
          refundAmount
        }
      })

      const newReturn: MockReturnRequest = {
        returnRequestId: nextId,
        returnCode,
        orderId: body.orderId,
        orderCode,
        type: body.type,
        reason: body.reason,
        description: body.description,
        status: 'PENDING',
        refundMethod: body.refundMethod,
        refundStatus: 'PENDING',
        refundAmount: totalRefundAmount,
        bankName: body.bankName || null,
        bankAccountNumber: body.bankAccountNumber || null,
        bankAccountHolder: body.bankAccountHolder || null,
        createdAt: new Date().toISOString(),
        returnItems,
        mediaFiles: []
      }

      returns.unshift(newReturn)
      saveReturns(returns)

      return HttpResponse.json({
        code: 200,
        message: 'Tạo yêu cầu hoàn trả thành công',
        success: true,
        data: newReturn,
        timestamp: new Date().toISOString()
      })
    } catch (err: unknown) {
      return HttpResponse.json(
        {
          code: 400,
          message: err instanceof Error ? err.message : 'Lỗi tạo yêu cầu hoàn trả',
          success: false,
          data: null,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
  }),

  // 3. UPLOAD ẢNH: POST /api/returns/{returnId}/media
  http.post(`${BASE}/api/returns/:returnId/media`, async ({ params, request }) => {
    try {
      const returnId = Number(params.returnId)
      const returns = getStoredReturns()
      const returnReq = returns.find((r) => r.returnRequestId === returnId)

      if (!returnReq) {
        return HttpResponse.json(
          {
            code: 404,
            message: 'Không tìm thấy yêu cầu hoàn trả',
            success: false,
            data: null,
            timestamp: new Date().toISOString()
          },
          { status: 404 }
        )
      }

      // Read form data to mock uploads
      const formData = await request.formData()
      const files = formData.getAll('files') as File[]

      // Generate mock URLs for uploaded files
      const newMediaFiles = files.map(() => {
        // Just mock some object urls or standard placeholders
        return `https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=300&auto=format&fit=crop`
      })

      returnReq.mediaFiles = [...returnReq.mediaFiles, ...newMediaFiles]
      saveReturns(returns)

      return HttpResponse.json({
        code: 200,
        message: 'Tải ảnh lên thành công',
        success: true,
        data: newMediaFiles,
        timestamp: new Date().toISOString()
      })
    } catch (err: unknown) {
      return HttpResponse.json(
        {
          code: 400,
          message: err instanceof Error ? err.message : 'Lỗi tải ảnh lên',
          success: false,
          data: null,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
  }),

  // 4. DANH SÁCH RETURN CỦA TÔI: GET /api/returns/my?page=0&size=10
  http.get(`${BASE}/api/returns/my`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)

    const returns = getStoredReturns()
    const start = page * size
    const end = start + size
    const pageReturns = returns.slice(start, end)

    return HttpResponse.json({
      code: 200,
      message: 'Lấy danh sách yêu cầu đổi trả thành công',
      success: true,
      data: {
        totalElements: returns.length,
        totalPages: Math.ceil(returns.length / size),
        first: page === 0,
        last: end >= returns.length,
        size,
        number: page,
        numberOfElements: pageReturns.length,
        empty: pageReturns.length === 0,
        content: pageReturns
      },
      timestamp: new Date().toISOString()
    })
  }),

  // 5. CHI TIẾT RETURN: GET /api/returns/{returnId}
  http.get(`${BASE}/api/returns/:returnId`, ({ params }) => {
    const returnId = Number(params.returnId)
    const returns = getStoredReturns()
    const returnReq = returns.find((r) => r.returnRequestId === returnId)

    if (!returnReq) {
      return HttpResponse.json(
        {
          code: 404,
          message: 'Không tìm thấy yêu cầu hoàn trả',
          success: false,
          data: null,
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      code: 200,
      message: 'Lấy chi tiết yêu cầu đổi trả thành công',
      success: true,
      data: returnReq,
      timestamp: new Date().toISOString()
    })
  }),

  // 6. HỦY RETURN: PATCH /api/returns/{returnId}/cancel
  http.patch(`${BASE}/api/returns/:returnId/cancel`, ({ params }) => {
    const returnId = Number(params.returnId)
    const returns = getStoredReturns()
    const index = returns.findIndex((r) => r.returnRequestId === returnId)

    if (index === -1) {
      return HttpResponse.json(
        {
          code: 404,
          message: 'Không tìm thấy yêu cầu hoàn trả',
          success: false,
          data: null,
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      )
    }

    const returnReq = returns[index]

    if (returnReq.status !== 'PENDING') {
      return HttpResponse.json(
        {
          code: 400,
          message: 'Chỉ có thể hủy yêu cầu ở trạng thái CHỜ DUYỆT (PENDING)',
          success: false,
          data: null,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    returnReq.status = 'CANCELLED'
    returns[index] = returnReq
    saveReturns(returns)

    return HttpResponse.json({
      code: 200,
      message: 'Hủy yêu cầu đổi trả thành công',
      success: true,
      data: returnReq,
      timestamp: new Date().toISOString()
    })
  }),

  // 7. DANH SÁCH RETURN CHO STAFF: GET /api/management/returns
  http.get(`${BASE}/api/management/returns`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const status = url.searchParams.get('status')
    const orderCode = url.searchParams.get('orderCode')
    const returnCode = url.searchParams.get('returnCode')
    const refundMethod = url.searchParams.get('refundMethod')
    const type = url.searchParams.get('type')
    const fromDate = url.searchParams.get('fromDate')
    const toDate = url.searchParams.get('toDate')
    const keyword = url.searchParams.get('keyword')?.toLowerCase()

    let returns = getStoredReturns()

    // Apply filters
    if (status && status !== 'ALL') {
      returns = returns.filter((r) => r.status === status)
    }
    if (orderCode) {
      returns = returns.filter((r) => r.orderCode.toLowerCase().includes(orderCode.toLowerCase()))
    }
    if (returnCode) {
      returns = returns.filter((r) => r.returnCode.toLowerCase().includes(returnCode.toLowerCase()))
    }
    if (refundMethod) {
      returns = returns.filter((r) => r.refundMethod === refundMethod)
    }
    if (type) {
      returns = returns.filter((r) => r.type === type)
    }
    if (fromDate) {
      returns = returns.filter((r) => new Date(r.createdAt.split('T')[0]) >= new Date(fromDate))
    }
    if (toDate) {
      returns = returns.filter((r) => new Date(r.createdAt.split('T')[0]) <= new Date(toDate))
    }
    if (keyword) {
      returns = returns.filter((r) => {
        const customerName = r.requestedBy?.fullName?.toLowerCase() || ''
        const customerEmail = r.requestedBy?.email?.toLowerCase() || ''
        const rCode = r.returnCode.toLowerCase()
        const oCode = r.orderCode.toLowerCase()
        return customerName.includes(keyword) || customerEmail.includes(keyword) || rCode.includes(keyword) || oCode.includes(keyword)
      })
    }

    // Pagination
    const start = page * size
    const end = start + size
    const pageReturns = returns.slice(start, end)

    // Ensure formats
    const formattedReturns = pageReturns.map(r => {
      const mediaMapped = r.mediaFiles.map((m, idx) => {
        if (typeof m === 'string') {
          return { mediaFileId: 100 + idx, fileUrl: m, fileType: 'IMAGE' }
        }
        return m
      })
      return {
        ...r,
        requestedBy: r.requestedBy || {
          userId: '96e782a8-13d8-48d0-a0af-0398f22e7504',
          fullName: 'Khách Hàng Mock',
          email: 'customer@petbuddy.vn'
        },
        mediaFiles: mediaMapped,
        returnItems: r.returnItems.map((item, idx) => ({
          ...item,
          orderDetailId: item.orderDetailId || (11 + idx),
          productImage: item.productImage || null
        }))
      }
    })

    return HttpResponse.json({
      code: 1000,
      success: true,
      message: 'All return requests retrieved successfully',
      data: {
        content: formattedReturns,
        pageable: {
          pageNumber: page,
          pageSize: size
        },
        totalElements: returns.length,
        totalPages: Math.ceil(returns.length / size),
        number: page,
        size,
        first: page === 0,
        last: end >= returns.length,
        empty: formattedReturns.length === 0
      },
      timestamp: new Date().toISOString()
    })
  }),

  // 8. CHI TIẾT RETURN CHO STAFF: GET /api/management/returns/{returnId}
  http.get(`${BASE}/api/management/returns/:returnId`, ({ params }) => {
    const returnId = Number(params.returnId)
    const returns = getStoredReturns()
    const returnReq = returns.find((r) => r.returnRequestId === returnId)

    if (!returnReq) {
      return HttpResponse.json(
        {
          code: 1001,
          message: 'Không tìm thấy yêu cầu hoàn trả',
          success: false,
          data: null,
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      )
    }

    const mediaMapped = returnReq.mediaFiles.map((m, idx) => {
      if (typeof m === 'string') {
        return { mediaFileId: 100 + idx, fileUrl: m, fileType: 'IMAGE' }
      }
      return m
    })

    const detailed = {
      ...returnReq,
      requestedBy: returnReq.requestedBy || {
        userId: '96e782a8-13d8-48d0-a0af-0398f22e7504',
        fullName: 'Khách Hàng Mock',
        email: 'customer@petbuddy.vn'
      },
      mediaFiles: mediaMapped,
      returnItems: returnReq.returnItems.map((item, idx) => ({
        ...item,
        orderDetailId: item.orderDetailId || (11 + idx),
        productImage: item.productImage || null
      }))
    }

    return HttpResponse.json({
      code: 1000,
      success: true,
      message: 'Return request retrieved successfully',
      data: detailed,
      timestamp: new Date().toISOString()
    })
  }),

  // 9. DUYỆT / TỪ CHỐI / HOÀN THÀNH: PATCH /api/management/returns/{returnId}/status
  http.patch(`${BASE}/api/management/returns/:returnId/status`, async ({ params, request }) => {
    try {
      const returnId = Number(params.returnId)
      const body = (await request.json()) as { status: string; staffNote: string }
      const returns = getStoredReturns()
      const idx = returns.findIndex((r) => r.returnRequestId === returnId)

      if (idx === -1) {
        return HttpResponse.json(
          {
            code: 1001,
            message: 'Không tìm thấy yêu cầu hoàn trả',
            success: false,
            data: null,
            timestamp: new Date().toISOString()
          },
          { status: 404 }
        )
      }

      const returnReq = returns[idx]
      returnReq.status = body.status
      returnReq.staffNote = body.staffNote
      returnReq.processedAt = new Date().toISOString()
      returnReq.updatedAt = new Date().toISOString()

      // Assign mock staff who processed this
      returnReq.processedBy = {
        userId: '34d8ed7a-81af-456e-914d-f2decfd61d10',
        email: 'staff2@gmail.com',
        fullName: 'Cashier Staff',
        role: 'STAFF',
        staffTask: 'CASHIER',
        status: 'ACTIVE'
      }

      if (body.status === 'COMPLETED') {
        returnReq.completedAt = new Date().toISOString()
        returnReq.refundStatus = 'SUCCESS'
      } else if (body.status === 'APPROVED') {
        returnReq.refundStatus = 'SUCCESS'
      } else if (body.status === 'REJECTED') {
        returnReq.refundStatus = 'FAILED'
      }

      returns[idx] = returnReq
      saveReturns(returns)

      return HttpResponse.json({
        code: 1000,
        success: true,
        message: 'Return request status updated successfully',
        data: {
          returnRequestId: returnReq.returnRequestId,
          returnCode: returnReq.returnCode,
          status: returnReq.status,
          refundStatus: returnReq.refundStatus,
          staffNote: returnReq.staffNote,
          processedBy: returnReq.processedBy,
          processedAt: returnReq.processedAt,
          updatedAt: returnReq.updatedAt
        },
        timestamp: new Date().toISOString()
      })
    } catch (err: unknown) {
      return HttpResponse.json(
        {
          code: 1001,
          message: err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái',
          success: false,
          data: null,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
  })
]
