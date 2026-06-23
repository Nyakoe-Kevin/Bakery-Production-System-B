import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('sanctum_token') || null)

  function setUser(u, t) {
    user.value = u
    token.value = t
    if (t) localStorage.setItem('sanctum_token', t)
    else localStorage.removeItem('sanctum_token')
  }

  async function login(credentials) {
    const res = await api.post('/login', credentials)
    setUser(res.data.user, res.data.token)
    return res.data
  }

  async function logout() {
    try {
      await api.post('/logout')
    } catch (e) {
      // ignore
    }
    setUser(null, null)
  }

  return { user, token, setUser, login, logout }
})
