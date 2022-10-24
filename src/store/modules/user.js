import { login as loginAPI } from '@/api'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router from '@/router'
import { constantRoutes, asyncRoutes, anyRoute } from '@/router/routes'
import { cloneDeep } from 'lodash'
import { resetRouter } from '@/router/index'
/**
 * 递归过滤异步路由表，返回符合用户菜单权限的路由表
 * @param asyncRoutes
 * @param routeNames
 */

function filterAsyncRoutes(asyncRoutes, routeNames) {
  //  console.log(routeNames)
  return asyncRoutes.filter(item => {
    if (routeNames.includes(item.name)) {
      if (item.children && item.children > 0) {
        item.children = filterAsyncRoutes(item.children, routeNames)

      }
      return true
    }
  })
}


const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',

    roles: [],
    buttons: [],
    routes: [], // 本用户所有的路由,包括了固定的路由和下面的addRouters
    asyncRoutes: [] // 本用户的角色赋予的新增的动态路由
  }
}

const state = getDefaultState()

const mutations = {
  SET_USER: (state, userInfo) => {
    state.name = userInfo.name // 用户名
    state.avatar = userInfo.avatar // 头像
    state.roles = userInfo.roles // 角色列表
    state.buttons = userInfo.buttons // 按钮权限列表

    // console.log(router.matcher.addRoutes([...state.asyncRoutes,...anyRoute]))
    // console.log(state.asyncRoutes)
    // console.log(anyRoute)
    // router.addRoute([...state.asyncRoutes,...anyRoute])
    // router.addRoute([...anyRoute])
    // console.log(route.getRoutes())

  },

  SET_TOKEN(state, token) {
    state.token = token
  },

  RESET_USER(state) {
    Object.assign(state, getDefaultState())
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      loginAPI.login(username, password)
        .then(result => {
          const { data } = result
          commit('SET_TOKEN', data.token)
          setToken(data.token)
          resolve()
        }).catch(error => {
          reject(error)
        })
    })
  },

  // 获取用户信息
  async getInfo({ commit, state }) {
    const { data } = await loginAPI.getInfo()
    commit('SET_USER', data)
    // 这里写代码
    state.asyncRoutes = filterAsyncRoutes(cloneDeep(asyncRoutes), data.routes)

    state.routes = constantRoutes.concat(state.asyncRoutes, anyRoute)
    actions.gitasyncRoutes(state.asyncRoutes)
  },

  /* 
  重置用户信息
  */
  async resetUser({ commit, state }) {
    // 如果当前是登陆的, 请求退出登陆
    if (state.name) {
      await loginAPI.logout()
    }
    // 删除local中保存的token
    removeToken()
    resetRouter()
    // 提交重置用户信息的mutation
    commit('RESET_USER')
  },
  gitasyncRoutes(routes) {
    routes.forEach(element => {
      // console.log(element)
      router.addRoute(element)
    });
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}