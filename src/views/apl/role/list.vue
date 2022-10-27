<template>
    <div style="padding:30px">
        <div>
            <el-input style="width:180px;margin-right:10px" placeholder="角色名称" v-model="searchObj.roleName"></el-input>
            <el-button type="primary" size="default" icon="el-icon-search" @click="search">查询</el-button>
            <el-button plain @click="remove">清空</el-button>
        </div>
        <div style="margin:20px 0">
            <el-button type="primary" size="default" @click="addRoleList">添加</el-button>
        </div>

        <el-table border style="width: 100%;margin:20px 0" :data="tempSearchObj" v-loading='isloading'>
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column align="center" label="序号" width="80" type="index">
            </el-table-column>
            <el-table-column label="角色名称" prop="roleName">
                <template slot-scope="{row,$index}" >
                 <template v-if="row.flag">
                    <el-input placeholder="" size="normal" clearable style="width:60%;margin-right:10px" v-model="row.roleName"></el-input>
                    <el-button type="primary" size="default" @click="upRole(row)">确定</el-button>
                    <el-button type="warning" size="default" @click="offRole(row)">取消</el-button>
                 </template>
                 <span v-else>{{row.roleName}}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="230" align="center">
                <template slot-scope="{row,$index}">
                    <el-tooltip content="分配权限" placement="top" effect="dark">
                        <el-button type="info" size="small" icon="el-icon-user-solid" @click="$router.push(`/role/auth/${row.id}?roleName=${row.roleName}`)">
                         
                        </el-button>
                       
                    </el-tooltip>
                    
                    <el-tooltip content="修改角色" placement="top" effect="dark">
                        <el-button type="primary" size="small" icon="el-icon-edit" @click="updataRole(row)" v-if="!row.flag"></el-button>
                    </el-tooltip>
                    <el-tooltip content="删除角色" placement="top" effect="dark">
                        <el-button type="danger" size="small" icon="el-icon-delete" @click="deleteRole(row.id)">
                        </el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页器 -->
        <el-pagination :page-sizes="[3, 6, 9]" :page-size="limit" :current-page="page"
            layout="prev, pager, next, jumper, ->, sizes, total" :total="total" @current-change="getRoleList"
            @size-change="handleSizeChange">
        </el-pagination>
        <!-- 点击添加按钮的对话框 -->
        <el-dialog
            title="添加角色"
            width="30%"
            :visible.sync="dialogFormVisible">
            <span>请输入新用户</span>
            <el-input size="normal" clearable v-model="addRoleObj.roleName"></el-input>
            
            <span slot="footer">
                <el-button @click="dialogFormVisible=fasle">取消</el-button>
                <el-button type="primary" @click="addRole">确定</el-button>
            </span>
        </el-dialog>
        
    </div>

</template>

<script>
export default {
    name: 'Role',
    data() {
        return {
            dialogFormVisible:false,//添加按钮的对话框
            isloading: false,//加载状态
            page: 1,//当前页
            limit: 3,//每页几条数据
            searchObj: {//搜索数据
                roleName: ''
            },
            addRoleObj:{//添加
                roleName: ''
            },
            tempSearchObj: {},//列表数据
            total: 0,//总条数
            flag:false,//判断修改按钮的隐藏与显示
        }
    },

    methods: {
        //获取用户列表//点击分页器更新数据
        async getRoleList(page = 1) {
            this.isloading = true
            this.page = page
            const { limit } = this
            let result = await this.$API.role.getPageList(this.page, limit, this.searchObj)
            // console.log(result);
            const { items, total } = result.data
            this.total = total
            this.tempSearchObj = items.map(item=>{
                item.flag = false;
                item.originRoleName = item.roleName
                return item
            })
            console.log(result);
            this.isloading = false
        },
        //分页器右下角点击更改每页条数
        handleSizeChange(limit) {
            this.limit = limit
            this.getRoleList()
        },
        //搜索
        search() {
            this.getRoleList(this.page, this.searchObj)
        },
        //清空搜索框
        remove() {
            this.searchObj = ''
            this.getRoleList()
        },
        // 添加
        addRoleList(){
            this.addRoleObj.roleName = ''
            this.dialogFormVisible =true
        },
        //添加用户的确定
        async addRole(){
        let result = await this.$API.role.save(this.addRoleObj)
        this.addRoleObj.roleName = result.data.roleName
        this.getRoleList()
        this.$message({
                    message: '添加成功',
                    type: 'success'
                })
        this.dialogFormVisible = false
        },
        //删除
        async deleteRole(row){
        await this.$API.role.removeById(row)
        this.getRoleList()
        this.$message({
                    message: '删除成功',
                    type: 'success'
                })
        },
        //修改
        updataRole(row){
                row.flag = true
        },
        //修改input框中的确定按钮
        async upRole(row){
            row.originRoleName = row.roleName
           await this.$API.role.updateById(row)
            this.getRoleList(this.page)
            this.$message({
                message:'修改成功',
                type:'success'
            })
        },
        //修改input框中的取消按钮
        offRole(row){
            row.roleName = row.originRoleName
            row.flag=false
        }
    },
    mounted() {
        this.getRoleList()
    },
}
</script>

<style lang="scss" scoped>

</style>