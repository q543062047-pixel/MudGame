import { createRouter, createWebHistory } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/create',
    name: 'Create',
    component: () => import('@/views/CreateView.vue')
  },
  {
    path: '/game',
    name: 'Game',
    component: () => import('@/views/GameView.vue'),
    beforeEnter: () => {
      const store = useGameStore()
      if (!store.player.name) return { name: 'Create' }
    }
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})