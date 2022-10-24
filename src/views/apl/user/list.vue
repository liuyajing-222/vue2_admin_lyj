<template>
    <div class="app-container">
        <el-form :inline="true" class="demo-form-inline">
            <el-form-item>
                <el-input v-model="tempSearchObj.username" placeholder="用户名">
                </el-input>
            </el-form-item>
            <el-button type="primary" @click="search">查询</el-button>
            <el-button @click="resetSearch">清空</el-button>
        </el-form>
        <div>
            <el-button type="primary" @click="addUsers">添加</el-button>
            <el-button type="danger" :disabled="selectedIds.length === 0" @click="revomveUsers">批量删除</el-button>
        </div>
        <template>
            <el-table style="width: 100%" max-height="250" :data="users" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55">
                </el-table-column>
                <el-table-column fixed type="index" label="序号" width="100">
                </el-table-column>
                <el-table-column label="用户名" width="120" prop="username">
                </el-table-column>
                <el-table-column prop="nickName" label="用户昵称" width="120">
                </el-table-column>
                <el-table-column prop="roleName" label="角色列表" width="120">
                </el-table-column>
                <el-table-column prop="gmtCreate" label="创建时间" width="150">
                </el-table-column>
                <el-table-column prop="gmtModified" label="更新时间" width="150">
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="300">
                    <template slot-scope="{row,$index}">
                        <el-button type="info" size="small" icon="el-icon-user-solid" title="分配角色"
                            @click="solidHandler(row)" />
                        <el-button type="primary" size="small" icon="el-icon-edit" title="修改用户"
                            @click="editUsers(row)" />
                        <el-button type="danger" size="small" icon="el-icon-delete" title="删除"
                            @click="deleteHandler(row.id)" />
                    </template>
                </el-table-column>
            </el-table>
        </template>
        <el-pagination :page-sizes="[3, 5, 10]" :page-size="limit" :current-page="page" :pager-count="9"
            @current-change="getPageList" @size-change="limitHandler"
            layout="prev, pager, next, jumper, ->, sizes, total" :total="total" background>
        </el-pagination>
        <el-dialog :title="tmForm.id ? '修改品牌' : '添加品牌'" :visible.sync="dialogFormVisible">
            <!--
         model属性:将表单数据收集到那个对象身上.它一般在做表单验证的时候有用[目前收集表单数据暂时看不出它的效果]
      -->
            <el-form :model="tmForm" ref="box" :rules="rules">
                <!-- label:设置表单域前面文字 -->
                <el-form-item label="用户名" label-width="80px" prop="username">
                    <el-input autocomplete="off" v-model="tmForm.username"></el-input>
                </el-form-item>
                <el-form-item label="用户昵称" label-width="80px" prop="nickName">
                    <el-input autocomplete="off" v-model="tmForm.nickName"></el-input>
                </el-form-item>
                <el-form-item v-if="!tmForm.id" label="用户密码" label-width="80px" prop="password">
                    <el-input autocomplete="off" v-model="tmForm.password"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="addOrUpdateTradeMark">确 定</el-button>
            </div>
        </el-dialog>
        <el-dialog title="设置角色" :visible.sync="dialogFormVisible">
            <el-form label-width="80px">
                <el-form-item label="角色名称">
                    <el-input disabled v-model="tmForm.username"></el-input>
                </el-form-item>
                <el-form-item label="角色列表">
                    <el-checkbox ::indeterminate="isIndeterminate" v-model="checkAll" @change="checkAllHandler">全选</el-checkbox>
                    <div style="margin:15px 0 ;"></div>
                    <el-checkbox-group v-model="useRoleIds" @change="handleCheckChange">
                        <el-checkbox v-for="role in allRoles" :key="role.id" :label="role.id">{{ role.roleName }}
                        </el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetRoleData">取 消</el-button>
                <el-button type="primary" @click="assignRole" :loading="loading">保存</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script lang="ts">

export default {
    name: 'List',
    data() {
        return {
            // 页码
            page: 1,
            //每页数量
            limit: 3,
            total: 0, //总数量
            searchObj: {
                // 包含请求搜索条件数据的对象
                username: ''
            },
            tempSearchObj: {
                username: ''  //收集搜索条件输入的对象
            },
            users: [], //当前要操作的user 
            tmForm: {
                username: '',
                nickName: '',
                password: '',
            },
            dialogFormVisible: false,
            rules: {
                username: [
                    { required: true, message: '请输入品牌名称', trigger: 'blur' },
                    { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入品牌名称', trigger: 'blur' },
                    { min: 6, max: 12, message: '长度在 6到 12 个字符', trigger: 'blur' }
                ],
            },
            selectedIds: [],//所有选择的user的id的数组
            allRoles: [], //所有角色列表
            useRoleIds: [], //用户的角色ID的列表
            checkAll: false, //是否全选
            isIndeterminate: false, // 是否是不确定的
            loading: false, //是否正在提交请求中
        }
    },
    //    发请求一般情况下 我们都是在mounted去发 也可以在created内部去发情求
    created() {
        // 获取商品的数据
        this.getPageList()
    },
    methods: {
        async getPageList(pager = 1) {
            // 触发分页器
            this.page = pager;
            // 发请求
            const { page, limit, searchObj } = this
            const result = await this.$API.user.getPageList(page, limit, searchObj);
            // console.log(result)
            // const {items,total} = result.data
            if (result.code == 20000) {
                this.users = result.data.items
                // 保存总条数
                this.total = result.data.total;
            }
        },
        // 触发页数
        limitHandler(limit) {
            this.limit = limit;
            this.getPageList()
        },
        // 添加属性
        addUsers() {
            this.dialogFormVisible = true
            // 清空内容
            this.tmForm = {
                username: '',
                nickName: '',
                password: '',

            }
        },
        // 确定按钮
        addOrUpdateTradeMark() {
            this.$refs.box.validate(async (success) => {
                if (success) {
                    try {
                        if (this.tmForm.id) {
                            await this.$API.user.update(this.tmForm);
                        } else {
                            await this.$API.user.add(this.tmForm);
                        }
                        this.$message({
                            message: this.tmForm.id ? "修改成功" : '添加成功',

                            type: 'success'
                        })
                        // 隐藏对话框
                        this.dialogFormVisible = false;
                        this.getPageList()
                    } catch (error) {
                        this.$message({
                            message: this.tmForm.id ? "修改失败" : '添加失败',
                            type: 'error'
                        })
                    }
                } else {
                    console.log('error submit!!');
                    return false;
                }
            })
        },
        // 修改数据
        editUsers(row) {
            this.tmForm = row
            //    await this.$API.user.update(this.tmForm);
            this.dialogFormVisible = true;
        },
        // 删除按钮
        deleteHandler(id) {
            try {
                this.$API.user.removeById(id)
                this.$message({
                    message: '删除成功',
                    type: 'success'
                })
                // 获取商品的数据
                this.getPageList(
                    this.users.length > 1 ? this.page : this.page - 1
                )

            } catch (error) {
                this.$message({
                    message: '删除失败',
                    type: 'error'
                })
            }
        },
        // 删除所有选中的数据
        revomveUsers() {
            this.$confirm('确定删除吗？').then(async () => {
                // console.log
                await this.$API.user.removeUsers(this.selectedIds)
                this.$message.success('删除成功')
            }).catch(() => {
                this.$message.info('取消删除')
            })
        },
        // 列表选中状态发生改变的监听回调
        handleSelectionChange(selection) {
            // 创建一个新的数组
            this.selectedIds = selection.map(item => item.id)
            // console.log(this.selectedIds)
        },
        // 根据输入进行搜索
        async search() {
            // console.log(this.tempSearchObj.username)
            let username = this.tempSearchObj.username
            const result = await this.$API.user.getPageList(this.page, this.limit, { username })
            this.users = result.data.items
            // 保存总条数
            this.total = result.data.total;
            console.log(result)
            //   保存数据
            if (result.code == 20000) {
                this.users = result.data.items
                // 保存总条数
                this.total = result.data.total;
            }
            // ...this当前的
            this.searchObj = { ...this.temSearchObj }
        },
        // 重置输入后搜索
        resetSearch() {
            this.searchObj = {
                username: ''
            }
            this.tempSearchObj = {
                username: ''
            }
            this.getPageList()
        },
        // 异步获取用户的角色列表
        async getRoles() {
            let result = await this.$API.user.getRoles(this.tmForm.id);
            console.log(result)
            const { allRolesList, assignRoles } = result.data
            this.allRoles = allRolesList
            this.useRoleIds = assignRoles.map(item => item.id)

        },
        // 分配角色
        async solidHandler(row) {
            this.dialogFormVisible = true;
            this.tmForm = row
            this.getRoles()
        },
        // 角色全选按钮
        checkAllHandler(value){ //value当前勾选状态true/false
            // 如果当前全选  userRoleIds就是所有角色id的数组 否则是空数组
            // map()方法可以创建一个新数组
            this.useRoleIds = value ? this.allRoles.map(item => item.id) : []
            // 如果不是全选  指定为false
            this.isIndeterminate = false
        },

        // 角色列表选中项发生改变的监听
        handleCheckChange(value) {
            const { useRoleIds, allRoles } = this
            this.checkAll = useRoleIds.length == allRoles.length && allRoles.length > 0
        },
        // 保存角色按钮
        async assignRole() {
            const userId = this.tmForm.id
            const roleId = this.useRoleIds.join(',')
            const result = await this.$API.user.assignRoles(userId, roleId)
            // console.log(result)
            this.$message.success(result.message || '分配角色成功')
            this.dialogFormVisible = false
            // 再次获取数据
            this.getPageList()
            this.resetRoleData()
            // if (this.$store.getters.name === this.user.roleName) {
            //     window.location.reload()
            // }
        },
        // 取消按钮
        resetRoleData(){
            this.dialogFormVisible = false
            this.allRoles = []
            this.useRoleIds = []
            this.isIndeterminate = false
            this.checkAll = false
        }
    }
}
</script>

<style scoped>

</style>