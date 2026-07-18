import { faker } from '@faker-js/faker'
import type { CartItemResponse, CartResponse } from '~/shared/lib/cart'

export function createCartItem(overrides: Partial<CartItemResponse> = {}): CartItemResponse {
  const price = faker.number.int({ min: 50_000, max: 500_000 })
  const quantity = faker.number.int({ min: 1, max: 5 })

  return {
    cartItemId: faker.string.uuid(),
    productId: faker.string.uuid(),
    productName: faker.commerce.productName(),
    imageUrl: `https://placehold.co/300x300?text=${encodeURIComponent(faker.commerce.product())}`,
    price,
    quantity,
    subtotal: price * quantity,
    ...overrides,
  }
}

export function createCart(overrides: Partial<CartResponse> = {}): CartResponse {
  const itemCount = faker.number.int({ min: 1, max: 4 })

  return {
    userId: faker.string.uuid(),
    cartItems: Array.from({ length: itemCount }, () => createCartItem()),
    ...overrides,
  }
}
