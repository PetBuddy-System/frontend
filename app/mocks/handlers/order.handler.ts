import { http, HttpResponse } from 'msw'
import { env } from '~/shared/config/env'

const BASE = env.API_URL || ''
const LOCAL_STORAGE_ORDERS_KEY = 'petbuddy_mock_orders_db'

export interface MockOrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

export interface MockOrder {
  orderId: number
  orderCode: string
  status: string
  finalAmount: number
  createdAt: string
  userName: string
  phoneNumber: string
  address: string
  note?: string
  voucherCode?: string
  items: MockOrderItem[]
  paymentMethod?: string
  paymentStatus?: string
}

const INITIAL_ORDERS: MockOrder[] = [
  {
    orderId: 2048,
    orderCode: 'PET-2048',
    status: 'PENDING',
    finalAmount: 1250000,
    createdAt: '2024-10-25T14:30:00.000Z',
    userName: 'Nguyễn Hoàng Nam',
    phoneNumber: '0901234567',
    address: '123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    paymentMethod: 'CARD',
    paymentStatus: 'PROCESSING',
    items: [
      {
        productId: 'prod-1',
        name: 'Sữa tắm Olive Essence (Lông nâu)',
        price: 250000,
        quantity: 1,
        imageUrl: 'https://lh3.googleusercontent.com/aida/ADBb0uh6WztLsYERJyTaVYarWvnGp7PviF99OFqmiQwLP1f4tKtx45N_yHkRFHRtfl8FMOmuJnU1DAy1qxWM49q2mu6G00N36QX-lk0RNB87VcKiyvkK2b4tJB5o1ldxwKCNdzLWi878nkSVQJ00oROLzqE3EyHH-Q1bBSzi67sW1gVLLsq6gZPdSQoba3UWhihAiRHva6cJTS0vOcsHMVghw205rxK8XAhnMWn25w9LTKA2deXxbwotRK2GUG0'
      },
      {
        productId: 'prod-2',
        name: 'Thức ăn hạt Royal Canin (Medium Adult)',
        price: 500000,
        quantity: 2,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjZgGezGzKb8CJs5q-9lrcFr5_7fo7bk8DlMU8iJwhQqmcxRPWnIiMrOxNnewcXbfFu3F2N0YIM3soj0TWqqG3qC2SO6efI_uYWn3VdjmLDx0AS261VBoNGTGhgDyBPuITl_4esVLpatKrtm-msM2dmC98EaeE4Gv7GV4sbYeirdnKFRwp6x-Tr6zaC4K1eGIYCI_CQJduR_GHvqiZrUNiAQANLbxXB9U-gsy1Hf8jM9zJDemFqUmzyYeWdzJQ5eJcndmPd_Bt2f0'
      }
    ]
  },
  {
    orderId: 2047,
    orderCode: 'PET-2047',
    status: 'CONFIRMED',
    finalAmount: 450000,
    createdAt: '2024-10-25T13:15:00.000Z',
    userName: 'Lê Thu Trang',
    phoneNumber: '0912345678',
    address: '456 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    paymentMethod: 'CASH',
    paymentStatus: 'PENDING',
    items: [
      {
        productId: 'prod-3',
        name: 'Thức ăn hạt cao cấp cho chó trưởng thành',
        price: 450000,
        quantity: 1,
        imageUrl: 'https://lh3.googleusercontent.com/aida/ADBb0uifyciLtOf41cCMEjWdvIny__fSd_mCekw3D66AomlUIUDWxAl10w6qXwjx5sjucTPqsrDUaCjs5nlzG1AaNMwDzbTXZzCbNWf4n4P0ABkDTjFl5k96tQcB_Xr8IsHeNBWlyK57S6JUw-g3jMLFAvkiKf68zt4b-J2CKek0ib842v4nMCMu3HWT3JpPLmy9v-yegvMU6gQ5kkmk2BmN9z8DwBT_ypTYfotaAknGFH1YtoCBfYFTaRy2vg'
      }
    ]
  },
  {
    orderId: 2046,
    orderCode: 'PET-2046',
    status: 'PICKING',
    finalAmount: 2800000,
    createdAt: '2024-10-25T11:45:00.000Z',
    userName: 'Phạm Văn Mạnh',
    phoneNumber: '0987654321',
    address: '789 Đường Láng, Quận Đống Đa, Hà Nội',
    paymentMethod: 'CASH',
    paymentStatus: 'PENDING',
    items: [
      {
        productId: 'prod-4',
        name: 'Cát đậu nành Cature Tofu dành cho mèo',
        price: 185000,
        quantity: 15,
        imageUrl: 'https://lh3.googleusercontent.com/aida/ADBb0uio3yhORq1HxGnDHRDl3K1tbAslOGzxMCESj2lUcheAh1b-83fsuGGfcUj3g96-5sFYzgewrKvc0Hc5935JsAEUPchtsgUSZB8dJDd91s1ERQ5iGrFrnJFh5aYAVASMnFuxVE8XapXYUdL_9ke1o613b3bpD8VaI3reVeT7aYSNMquvqJEtNJgtQevBwtdGNC9EMnBCXPVGgf_Q7mvwLoKybk5d5ZUya2vd3vPv95pO-qe74DBdMbrVrxs'
      },
      {
        productId: 'prod-5',
        name: 'Đồ chơi dây thừng cho thú cưng',
        price: 25000,
        quantity: 1,
        imageUrl: 'https://lh3.googleusercontent.com/aida/ADBb0uifyciLtOf41cCMEjWdvIny__fSd_mCekw3D66AomlUIUDWxAl10w6qXwjx5sjucTPqsrDUaCjs5nlzG1AaNMwDzbTXZzCbNWf4n4P0ABkDTjFl5k96tQcB_Xr8IsHeNBWlyK57S6JUw-g3jMLFAvkiKf68zt4b-J2CKek0ib842v4nMCMu3HWT3JpPLmy9v-yegvMU6gQ5kkmk2BmN9z8DwBT_ypTYfotaAknGFH1YtoCBfYFTaRy2vg'
      }
    ]
  },
  {
    orderId: 2045,
    orderCode: 'PET-2045',
    status: 'SHIPPING',
    finalAmount: 150000,
    createdAt: '2024-10-24T17:20:00.000Z',
    userName: 'Trần Diệu Linh',
    phoneNumber: '0976543210',
    address: '12 Đường Trần Phú, Quận Hải Châu, Đà Nẵng',
    paymentMethod: 'CARD',
    paymentStatus: 'PAID',
    items: [
      {
        productId: 'prod-6',
        name: 'Sữa tắm Hello cho chó mèo 280g',
        price: 150000,
        quantity: 1,
        imageUrl: 'https://lh3.googleusercontent.com/aida/ADBb0uiD2iNUbQz2Hs_xHergS9X6TBN_RLOdfzCsTQyFr6mPAI-q3PGlxKrEMWRS2mZ6NW5BIkBX-Zwmjrxk3CaHaHVNRCBreBxbANzRZjr6NDa5HAh66eUX-SlKemHGRcmR_oQWLH6UM8Cx6etWFvrzC_Zx7Ik9t1KFjGCBvXF-f5CrDF0NKIcL2T-AIK1gNaPoq4OK1LWnzv-OI2BejbgO7sGLwh9HNHuYMAvDK00LoTsZwkVJulKsabSdbqs'
      }
    ]
  },
  {
    orderId: 2044,
    orderCode: 'PET-2044',
    status: 'COMPLETED',
    finalAmount: 670000,
    createdAt: '2024-10-24T15:10:00.000Z',
    userName: 'Hoàng Thanh Tùng',
    phoneNumber: '0965432109',
    address: '45 Đường Cách Mạng Tháng Tám, Quận 3, TP. Hồ Chí Minh',
    paymentMethod: 'CARD',
    paymentStatus: 'PAID',
    items: [
      {
        productId: 'prod-7',
        name: 'Sữa tắm Hello cho chó mèo 280g',
        price: 120000,
        quantity: 2,
        imageUrl: 'https://lh3.googleusercontent.com/aida/ADBb0uiD2iNUbQz2Hs_xHergS9X6TBN_RLOdfzCsTQyFr6mPAI-q3PGlxKrEMWRS2mZ6NW5BIkBX-Zwmjrxk3CaHaHVNRCBreBxbANzRZjr6NDa5HAh66eUX-SlKemHGRcmR_oQWLH6UM8Cx6etWFvrzC_Zx7Ik9t1KFjGCBvXF-f5CrDF0NKIcL2T-AIK1gNaPoq4OK1LWnzv-OI2BejbgO7sGLwh9HNHuYMAvDK00LoTsZwkVJulKsabSdbqs'
      },
      {
        productId: 'prod-3',
        name: 'Thức ăn hạt cao cấp cho chó trưởng thành',
        price: 430000,
        quantity: 1,
        imageUrl: 'https://lh3.googleusercontent.com/aida/ADBb0uifyciLtOf41cCMEjWdvIny__fSd_mCekw3D66AomlUIUDWxAl10w6qXwjx5sjucTPqsrDUaCjs5nlzG1AaNMwDzbTXZzCbNWf4n4P0ABkDTjFl5k96tQcB_Xr8IsHeNBWlyK57S6JUw-g3jMLFAvkiKf68zt4b-J2CKek0ib842v4nMCMu3HWT3JpPLmy9v-yegvMU6gQ5kkmk2BmN9z8DwBT_ypTYfotaAknGFH1YtoCBfYFTaRy2vg'
      }
    ]
  },
  {
    orderId: 2043,
    orderCode: 'PET-2043',
    status: 'CANCELED',
    finalAmount: 50000,
    createdAt: '2024-10-24T09:00:00.000Z',
    userName: 'Đỗ Bảo Ngọc',
    phoneNumber: '0954321098',
    address: '89 Đường Hoàng Diệu, Quận Phú Nhuận, TP. Hồ Chí Minh',
    paymentMethod: 'CARD',
    paymentStatus: 'FAILED',
    items: [
      {
        productId: 'prod-5',
        name: 'Đồ chơi dây thừng cho thú cưng',
        price: 50000,
        quantity: 1,
        imageUrl: 'https://lh3.googleusercontent.com/aida/ADBb0uifyciLtOf41cCMEjWdvIny__fSd_mCekw3D66AomlUIUDWxAl10w6qXwjx5sjucTPqsrDUaCjs5nlzG1AaNMwDzbTXZzCbNWf4n4P0ABkDTjFl5k96tQcB_Xr8IsHeNBWlyK57S6JUw-g3jMLFAvkiKf68zt4b-J2CKek0ib842v4nMCMu3HWT3JpPLmy9v-yegvMU6gQ5kkmk2BmN9z8DwBT_ypTYfotaAknGFH1YtoCBfYFTaRy2vg'
      }
    ]
  }
]

export function getStoredOrders(): MockOrder[] {
  if (typeof window === 'undefined') return INITIAL_ORDERS
  const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY)
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(INITIAL_ORDERS))
    return INITIAL_ORDERS
  }
  try {
    return JSON.parse(raw) as MockOrder[]
  } catch {
    return INITIAL_ORDERS
  }
}

export function saveOrders(orders: MockOrder[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders))
  }
}

export const orderHandlers = [
  // POST /api/orders
  http.post(`${BASE}/api/orders`, async ({ request }) => {
    try {
      const body = (await request.json()) as {
        userName: string
        phoneNumber: string
        address: string
        note?: string
        voucherCode?: string
        items?: { productId: string; price: number; quantity: number }[]
        paymentMethod?: 'CASH' | 'CARD'
      }

      const orders = getStoredOrders()
      const newId = orders.length > 0 ? Math.max(...orders.map((o) => o.orderId)) + 1 : 2001
      const orderCode = `PET-${newId}`

      // For mock items, we need name and image. If not provided, fallback to dummy items.
      const items: MockOrderItem[] = (body.items || [
        { productId: 'prod-1', price: 250000, quantity: 1 }
      ]).map((item, idx) => ({
        productId: item.productId,
        name: `Sản phẩm PetCare #${idx + 1}`,
        price: item.price,
        quantity: item.quantity,
        imageUrl: 'https://placehold.co/300x300?text=PetBuddy'
      }))

      // Calculate finalAmount
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const shippingFee = subtotal > 500000 ? 0 : 30000
      const discount = body.voucherCode ? 50000 : 0
      const finalAmount = Math.max(0, subtotal + shippingFee - discount)

      const payMethod = body.paymentMethod || 'CASH'
      // Nếu là thẻ (Stripe), ban đầu trạng thái thanh toán là PROCESSING
      const payStatus = payMethod === 'CARD' ? 'PROCESSING' : 'PENDING'

      const newOrder: MockOrder = {
        orderId: newId,
        orderCode,
        status: 'PENDING',
        finalAmount,
        createdAt: new Date().toISOString(),
        userName: body.userName,
        phoneNumber: body.phoneNumber,
        address: body.address,
        note: body.note,
        voucherCode: body.voucherCode,
        paymentMethod: payMethod,
        paymentStatus: payStatus,
        items
      }

      orders.unshift(newOrder) // Add to top
      saveOrders(orders)

      return HttpResponse.json({
        code: 200,
        message: 'Tạo đơn hàng thành công',
        success: true,
        data: {
          orderId: newOrder.orderId,
          orderCode: newOrder.orderCode,
          status: newOrder.status,
          finalAmount: newOrder.finalAmount,
          createdAt: newOrder.createdAt
        },
        timestamp: new Date().toISOString()
      })
    } catch (err: unknown) {
      return HttpResponse.json({
        code: 400,
        message: err instanceof Error ? err.message : 'Lỗi tạo đơn hàng',
        success: false,
        data: null,
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }
  }),

  // GET /api/orders (Customer's own orders)
  http.get(`${BASE}/api/orders`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)

    const orders = getStoredOrders()

    const start = page * size
    const end = start + size
    const pageOrders = orders.slice(start, end).map(o => ({
      orderId: o.orderId,
      orderCode: o.orderCode,
      status: o.status,
      finalAmount: o.finalAmount,
      createdAt: o.createdAt,
      items: o.items // Include items so the customer order history card can draw them!
    }))

    return HttpResponse.json({
      code: 200,
      message: 'Lấy đơn hàng thành công',
      success: true,
      data: {
        totalElements: orders.length,
        totalPages: Math.ceil(orders.length / size),
        first: page === 0,
        last: end >= orders.length,
        size,
        number: page,
        numberOfElements: pageOrders.length,
        empty: pageOrders.length === 0,
        content: pageOrders
      },
      timestamp: new Date().toISOString()
    })
  }),

  // GET /api/orders/all (Staff's orders list)
  http.get(`${BASE}/api/orders/all`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)

    const orders = getStoredOrders()

    const start = page * size
    const end = start + size
    const pageOrders = orders.slice(start, end).map(o => ({
      orderId: o.orderId,
      orderCode: o.orderCode,
      recipientName: o.userName,
      phoneNumber: o.phoneNumber,
      address: o.address,
      status: o.status,
      totalAmount: o.finalAmount, // Set totalAmount to the finalAmount (reduced/final price)
      createdAt: o.createdAt,
      paymentMethod: o.paymentMethod || 'CASH',
      paymentStatus: o.paymentStatus || 'PENDING'
    }))

    return HttpResponse.json({
      code: 200,
      message: 'Lấy danh sách đơn hàng thành công',
      success: true,
      data: {
        totalElements: orders.length,
        totalPages: Math.ceil(orders.length / size),
        first: page === 0,
        last: end >= orders.length,
        size,
        number: page,
        numberOfElements: pageOrders.length,
        empty: pageOrders.length === 0,
        content: pageOrders
      },
      timestamp: new Date().toISOString()
    })
  }),

  // GET /api/orders/:id
  http.get(`${BASE}/api/orders/:id`, ({ params }) => {
    const orderId = Number(params.id)
    const orders = getStoredOrders()
    const order = orders.find((o) => o.orderId === orderId)

    if (!order) {
      return HttpResponse.json({
        code: 404,
        message: 'Không tìm thấy đơn hàng',
        success: false,
        data: null,
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    return HttpResponse.json({
      code: 200,
      message: 'Lấy chi tiết đơn hàng thành công',
      success: true,
      data: {
        orderId: order.orderId,
        orderCode: order.orderCode,
        status: order.status,
        finalAmount: order.finalAmount,
        createdAt: order.createdAt,
        updatedAt: order.createdAt,
        // shipping / recipient info (extra fields not in Java DTO but needed for UI)
        userName: order.userName,
        recipientName: order.userName,
        phoneNumber: order.phoneNumber,
        address: order.address,
        note: order.note,
        voucherCode: order.voucherCode,
        paymentMethod: order.paymentMethod || 'CASH',
        paymentStatus: order.paymentStatus || 'PENDING',
        // Java-compatible orderDetails list
        orderDetails: order.items.map((item, idx) => ({
          orderDetailId: order.orderId * 100 + idx,
          productId: item.productId,
          productName: item.name,
          productImage: item.imageUrl,
          unitPrice: item.price,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          createdAt: order.createdAt
        }))
      },
      timestamp: new Date().toISOString()
    })
  }),

  http.patch(`${BASE}/api/orders/:id/status`, ({ params, request }) => {
    const orderId = Number(params.id)
    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    if (!status) {
      return HttpResponse.json({
        code: 400,
        message: 'Trạng thái không hợp lệ',
        success: false,
        data: null,
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    const orders = getStoredOrders()
    const orderIndex = orders.findIndex((o) => o.orderId === orderId)

    if (orderIndex === -1) {
      return HttpResponse.json({
        code: 404,
        message: 'Không tìm thấy đơn hàng',
        success: false,
        data: null,
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    const nextStatus = status.toUpperCase()
    orders[orderIndex].status = nextStatus

    // CASH: when staff confirms delivered (DELIVERED), payment status automatically updates to PAID
    if (orders[orderIndex].paymentMethod === 'CASH' && nextStatus === 'DELIVERED') {
      orders[orderIndex].paymentStatus = 'PAID'
    }

    // If staff cancels the order (CANCELED), payment status becomes CANCELLED
    if (nextStatus === 'CANCELED') {
      orders[orderIndex].paymentStatus = 'CANCELLED'
    }

    saveOrders(orders)

    return HttpResponse.json({
      code: 200,
      message: 'Cập nhật trạng thái thành công',
      success: true,
      data: null,
      timestamp: new Date().toISOString()
    })
  }),

  // GET /api/orders/:id/picking-list
  http.get(`${BASE}/api/orders/:id/picking-list`, ({ params }) => {
    const orderId = Number(params.id)
    const orders = getStoredOrders()
    const order = orders.find((o) => o.orderId === orderId)

    if (!order) {
      return HttpResponse.json({
        code: 404,
        message: 'Không tìm thấy đơn hàng',
        success: false,
        data: null,
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }

    // Generate picking items from order items
    const pickingList = order.items.map((item, idx) => {
      // Expiry dates are 1-2 years in the future
      const expiry = new Date()
      expiry.setFullYear(expiry.getFullYear() + 1 + (idx % 2))
      const expiryDateStr = expiry.toISOString().split('T')[0]

      return {
        productId: item.productId,
        name: item.name,
        expiryDate: expiryDateStr,
        quantityToPick: item.quantity,
        imageUrl: item.imageUrl // Add this so frontend can display the product image
      }
    })

    return HttpResponse.json({
      code: 200,
      message: 'Lấy sản phẩm cần lấy thành công',
      success: true,
      data: pickingList,
      timestamp: new Date().toISOString()
    })
  })
]
