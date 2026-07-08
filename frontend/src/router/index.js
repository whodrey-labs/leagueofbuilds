import { createRouter, createWebHistory } from 'vue-router'
import BuildTesterView from '../views/BuildTesterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'build-tester',
      component: BuildTesterView,
    },
  ],
})

export default router
