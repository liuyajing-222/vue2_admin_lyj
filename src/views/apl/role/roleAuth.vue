<template>
    <div>
      <el-input disabled :value="$route.query.roleName"></el-input>
      <el-tree :data="allPermissions" :props="defaultProps" style="margin: 20px 0" ref="tree" node-key="id" show-checkbox default-expand-all />
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="$router.push('/role')">取消</el-button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'RoleAuth',
    data() {
      return {
        defaultProps: {//容器
          children: 'children',//指定子树为节点对象的某个属性值
          label: 'name'//指定节点标签为节点对象的某个属性值
        },
        allPermissions: []//获取所有数据
      }
    },
    methods: {
      //刷新获取列表数据
      async getRoleAuth() {
        let result = await this.$API.permission.getPermissionList()
        console.log(result);
        //获取全部数据树形控件展示
        this.allPermissions = result.data.children
        console.log(this.allPermissions);
        // 获取选中数据中的选中状态遍历
        const checkedIds = this.getCheckedIds(allPermissions)
        //setCheckedKeys通过kes设置获取选中的数据，必有keys
        this.$ref.tree.setCheckedKeys(checkedIds)
  
      },
      //得到选中的数据列表
      //递归+reduce遍历数组中的所有数据，拿到所有符合条件的数据
      getCheckedIds(aunt,RoleArr=[]){
        return aunt.reduce((pre,item)=>{
          //判断item中的select的状态和多层次的嵌套内容筛选出符合条件的数据push到一个新数组中
          if(item.select && item.level===4){
  
            pre.push(item.id)
          }else if(item.children){
            this.getCheckedIds(item.children,RoleArr)
          }
        return RoleArr
        },RoleArr)
      },
      //点击保存按钮的事件回调
      async save(){
        var ids = this.$refs.tree.getCheckedKeys().join(",")
        //发请求
        let result = await this.$API.permission.doAssign(this.$route.params.id,ids)
        console.log(result);
        this.$router.replace('/role',()=>{
          if(roles.includes(roleName)){
          }
        })
      }
    },
    mounted() {
      this.getRoleAuth()
    },
  }
  </script>
  
  <style lang="scss" scoped>
  
  </style>