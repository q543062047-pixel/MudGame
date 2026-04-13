import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import GameViewNode from '@/views/GameViewNode.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/game', component: GameViewNode }  // 使用节点式地图
  ]
})

export default router
