// features/products/components/cart/cart-api.ts
import axios from 'axios'
import { STORAGE_KEYS } from '~/shared/config/site'
import { readStorage } from '~/shared/lib/storage'

const cartApi = axios.create({
  baseURL: 'http://localhost:8080/pet-buddy/api',
})

cartApi.interceptors.request.use((config) => {
  const token = readStorage(STORAGE_KEYS.accessToken)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const getCartItems = () => cartApi.get('/cart/items')
export const addCartItem = (data: unknown) => cartApi.post('/cart/items', data)
export const removeCartItem = (id: string) => cartApi.delete(`/cart/items/${id}`)

export default cartApi