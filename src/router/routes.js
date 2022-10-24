import Layout from '@/layout'
//引入vue-router插件
import Router from 'vue-router'
//安装插件
// Vue.use(Router)

// 权限管理
// const User = () => import('@/views/acl/user/list')







/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/* 
常量路由
包括登陆/404/首页
*/
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard'),
      meta: { title: '首页', icon: 'dashboard' }
    }]
  },
];
// 异步路由：对外暴露 将来可以在别的地方使用
   // 权限管理
  export const asyncRoutes=[
    {
    name:'Acl',
    path:'/acl',
    component:Layout,
    redirect:'/acl/user/list',
    meta:{
      title:'权限管理',
      icon:"el-icon-lock"
    },
    children:[
      {
        name:'User',
        path:'user/list',
        component:()=>import('@/views/apl/user/list.vue'),
        meta:{
          title:"用户管理",
        },
      },
    ]
  },
  // 商品管理
  {
    name:'Product',
    path:'/product',
    component:Layout,
    redirect:'/product/attr/list',
    meta:{
      title:'商品管理',
      icon:'shop'
    },
    children:[
      {
        name:'Trademark',
        path:'/product/trademark/list',
        component:()=>import('@/views/product/trademark/list'),
        meta:{
          title:'品牌管理',
        }
      },
    ]
  }
]

// 任意路由
export const anyRoute = { path: '*', redirect: '/404', hidden: true }


const createRouter =()=>new Router({
  // 跳转之后页面跳到最上面
  routes:constantRoutes //常量路由
})
const router = createRouter()

export function resetRouter(){
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export default router