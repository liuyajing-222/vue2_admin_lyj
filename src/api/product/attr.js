import request from '@/utils/request'
//一级分类
export const reqCategory1Data = () => request.get(`/admin/product/getCategory1`)
//二级分类
export const reqCategory2Data = (category1Id) => request.get(`/admin/product/getCategory2/` + category1Id)
//三级分类
export const reqCategory3Data = (category2Id) => request.get(`/admin/product/getCategory3/` + category2Id)
//获取某一个三级分类下全部的商品属性
export const reqAttrData = (category1Id, category2Id, category3Id) => request.get(`/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`)

//添加|修改
export const reqAddOrUpdateAttr = (data) => request.post(`/admin/product/saveAttrInfo`, data)

// 删除
export const reqDeleteAttrById = (attrId)=>request({url:`/admin/product/deleteAttr/${attrId}`,method:'delete'});