
//品牌管理接口
import request from '../../utils/request';


// 请求地址
export const reqTradeMarkList = (page, limit) => request({ url: `/admin/product/baseTrademark/${page}/${limit}`, method: 'get' })

// 修改和添加地址
export const reqAddOrUpdateTradeMark = (data) => {
  if (data.id) {
    return request({ url: `/admin/product/baseTrademark/update`, method: 'put', data })
  } else {
    // console.log(123)
    return request({ url: `/admin/product/baseTrademark/save`, method: 'post', data })
  }
}

// 删除地址
export const reqDeleteTradeMark = (id) => request.delete(`/admin/product/baseTrademark/remove/${id}`)