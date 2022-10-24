<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="addTradeMark">添加</el-button>
    <el-table border style="width: 100%;margin-top: 10px;" :data="records">
      <el-table-column type="index" label="序号" width="100">
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="180">
      </el-table-column>
      <el-table-column label="品牌LOGO">
        <template slot-scope="{row,$index}">
          <img :src="row.logoUrl" style="width: 100px; height:40px;" />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{row,$index}">
          <el-button type="warning" size="mini" icon="el-icon-edit" @click="updataTradeMark(row)">修改</el-button>
          <el-popconfirm :title="`你确定删除${row.tmName}`" @confirm="deleteTradeMarkList(row.id)">
            <el-button type="danger" size="mini" icon="el-icon-delete" slot="reference" style="margin-left:10px">删除
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination :page-sizes="[5, 10, 15]" :page-size="limit" :current-page="page" :pager-count="9" :total="total"
      layout="prev, pager, next, jumper, ->, sizes, total" @current-change="getTradeMarkList" @size-change="sizeHeader">
    </el-pagination>
    <!-- 对话框 
       visible:用于控制对话框显示与隐藏的
       title设置左上角标题
    -->
    <el-dialog :title="tmForm.id ?'修改品牌':'添加品牌'" :visible.sync="dialogFormVisible">
      <!--
         model属性:将表单数据收集到那个对象身上.它一般在做表单验证的时候有用[目前收集表单数据暂时看不出它的效果]
      -->
      <el-form :model="tmForm" :rules="rules" ref="box">
        <!-- label:设置表单域前面文字 -->
        <el-form-item label="品牌名称" label-width="80px" prop="tmName">
          <el-input autocomplete="off" v-model="tmForm.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" prop="logoUrl">
          <!-- 
            上传图片
            action:上传图片的地址,替换为咱们自己服务器的地址
            show-file-list:显示文件名字
            on-success	文件上传成功时的钩子
            before-upload 文件上传之前的钩子
           
           -->
          <!--  -->
          <el-upload class="avatar-uploader" action="/dev-api/admin/product/upload" :show-file-list="true"
            :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon" style="font-size: 16px"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTradeMark">确 定</el-button>
      </div>
    </el-dialog>
  </div>


</template>

<script lang="ts">
import { Row } from 'element-ui'
import {reqTradeMarkList,reqAddOrUpdateTradeMark,reqDeleteTradeMark} from '@/api/product/trademark'
export default {
  name: 'Trademark',
  data() {
    return {
      // 代表当前第几页
      page: 1,
      // 每一页展示多少条数据
      limit: 10,
      // 将来存储品牌的数据
      records: [],
      // 总条数
      total: 0,
      // 显示与隐藏对话框
      dialogFormVisible: false,
      // 上传图片的需要的属性
      tmForm: {
        // 收集品牌名称
        tmName: '',
        // 收集品牌的图片
        logoUrl: ''
      },
      rules: {
        tmName: [
          { required: true, message: '请输入品牌名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        logoUrl: [
          { required: true, message: '请填入照片' }
        ],
      }
    }
  },
  // 当组件挂载完毕的时候  先获取一次品牌的数据
  mounted() {
    // 获品牌数据的方法
    this.getTradeMarkList()
  },
  methods: {
    //获取品牌的方法
    async getTradeMarkList(pager = 1) {
      // 获取页数
      this.page = pager
      // console.log(111)
      // 发请求
      const { page, limit } = this
      console.log( this.$API)
      let result = await reqTradeMarkList(page, limit)
      console.log(result)
      if (result.code == 200) {
        this.records = result.data.records;
        // 总条数
        this.total = result.data.total;
      }
    },
        // 页码发生变化的回调
        currentHandler(page){
            // 获取当前页数
            this.page = page
            // 再次发请求
            this.getTradeMarkList()
        },
    //  获取页面条数
    sizeHeader(limit) {
      this.limit = limit;
      //    再次发请求
      this.getTradeMarkList()
    },
    // 文件上传的成功的钩子
    handleAvatarSuccess(res, file) {
      this.tmForm.logoUrl = res.data;
    },
    // 图片上传的定义
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    //添加品牌按钮的回调
    addTradeMark() {
      this.dialogFormVisible = true;
      // 清空内容
      this.tmForm = {
        tmName: "",
        logoUrl: ''

      }
    },
    //对话框里面确定按钮的回调
    addOrUpdateTradeMark() {
      // alert(123)
      this.$refs.box.validate(async (success) => {
        if (success) {
          try {
            //  添加或修改品牌发请求地方
            // console.log(this.$ajax)
            reqAddOrUpdateTradeMark(this.tmForm)
            // 隐藏对话框
            this.dialogFormVisible = false;
            // 修改和添加通过tmForm.id判断修改和添加

            // // 添加修改提示
            this.$message({
              message: this.tmForm.id ? "修改品牌成功" : '添加品牌成功',
              type: 'success'
            })
            this.getTradeMarkList(this.tmForm.id ? this.page : 1)
          } catch (error) {
            this.$message({
              message: this.tmForm.id ? "修改品牌失败" : '添加品牌失败',
              type: 'error'
            })
          }
        }else{
          console.log('error submit!!');
            return false;
        }
      })
    },
    // 修改的方法
    updataTradeMark(row) {
      this.dialogFormVisible = true;
      // 修改数据的id
      // console.log(row)
      // 将修改的数据赋值给row
      this.tmForm = row;
    },
    // 删除按钮
    async deleteTradeMarkList(id) {
      // console.log(id)
      try {
        await reqDeleteTradeMark(id)
        // 删除提示
        this.$message({
          message: '删除成功',
          type: 'success'
        })
        this.getTradeMarkList(
          this.records.length > 1 ? this.page : this.page - 1
        )
      } catch (error) {
        this.$message({
          message: '删除失败',
          type: 'error'
        })
      }
    }
  },
}
</script>

<style scoped>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>