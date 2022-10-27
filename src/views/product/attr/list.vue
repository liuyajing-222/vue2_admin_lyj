<template>
    <div>
        <Category @getCategoryId="handleCategoryChange"></Category>
        <el-card shadow="always" style="margin:20px,0px">
            <div v-show="scene == 0">
                <el-button type="primary" size="default" icon="el-icon-plus" :disabled="!category3Id" @click="addAttr">
                    添加</el-button>
                <el-table border stripe style="margin-top: 10px;" :data="attrs">
                    <el-table-column label="序号" type="index" align="center" width="80px"></el-table-column>
                    <el-table-column label="属性名称" width="120px" prop="attrName"></el-table-column>
                    <el-table-column label="属性列表">
                        <template slot-scope="{row, $index}">
                            <el-tag type="info" v-for="value in row.attrValueList" :key="value.id"
                                style="margin:0px 3px" :type="value.id % 2 == '0' ? 'success' : 'warning'">
                                {{ value.valueName }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120px">
                        <template slot-scope="{row, $index}">
                            <el-button type="primary" size="small " title="修改" icon="el-icon-edit" circle
                                @click="update(row)">
                            </el-button>
                            <!-- <el-popconfirm> -->
                            <el-popconfirm confirm-button-text="确定" cancel-button-text="考虑考虑" icon="el-icon-info"
                                icon-color="red" @onConfirm="deleteAttr(row)" :title="`你确定删除${row.attrName}?`">
                                <el-button slot="reference" type="danger" size="mini" icon="el-icon-delete"
                                    style="margin:0px 10px"></el-button>
                            </el-popconfirm>
                            <!-- </el-popconfirm> -->
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div v-show="scene == 1">
                <el-form :inline="true" v-model="attr">
                    <el-form-item label="属性名" label-width="80px">
                        <el-input placeholder="请输入属性名" v-model="attr.attrName"></el-input>
                    </el-form-item>
                </el-form>
                <el-button type="primary" icon="el-icon-plus" :disabled="attr.attrName ? false : true"
                    @click="addAttrValue">添加属性</el-button>
                <el-button @click="cancel">取消</el-button>
                <el-table style="width: 100%" :data="attr.attrValueList">
                    <el-table-column type="index" label="序号" width="180">
                    </el-table-column>
                    <el-table-column label="属性值名称" width="180">
                        <template slot-scope="{row,$index}">
                            <el-input :ref="$index" v-model="row.valueName" size="mini" v-if="row.show"
                                @blur="toLook(row)" @keydown.native.enter="toLook(row)"></el-input>
                            <div v-else @click="toEdit(row, $index)">{{ row.valueName }} ---{{ $index }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="address" label="操作">
                        <template slot-scope="{row,$index}">
                            <!-- splice数组方法切割 -->
                            <el-button type="danger" size="mini" icon="el-icon-delete"
                                @click="attr.attrValueList.splice($index, 1)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-button type="primary" :disabled="attr.attrValueList.length ? false : true" @click="save">保存
                </el-button>
                <el-button @click="cancel(row)">取消</el-button>
            </div>
        </el-card>

    </div>
</template>

<script>
import { reqAttrData, reqAddOrUpdateAttr, reqDeleteAttrById } from '@/api/product/attr'
import cloneDeep from 'lodash/cloneDeep'
export default {
    name: 'Attr',
    data() {
        return {
            category1Id: null, // 一级分类ID
            category2Id: null, // 二级分类ID
            category3Id: null, // 三级分类ID
            attrs: [], // 属性列表
            scene: 0,  //切换场景值
            // isShowList: true,//是否显示属性列表界面，如果是false显示添加或者修改界面
            attr: {
                attrName: '', // 属性名
                attrValueList: [], // 属性值列表
                categoryId: "", // 当前第3级分类ID
                categoryLevel: 3, // 分类级别
            }, // 当前要操作的属性对象
            //控制编辑欧式与查看模式切换的属性
            show: true,
        }
    },
    methods: {
        handleCategoryChange({ categoryId, level }) {
            // console.log(categoryId);
            if (level === 1) {
                //重置二级与三级分类的数据
                this.category2Id = null
                this.category3Id = null
                this.attrs = []
                this.category1Id = categoryId
            } else if (level === 2) {
                //重置三级分类的数据
                this.category3Id = null
                this.attrs = [] //重置属性列表
                this.category2Id = categoryId
            } else {
                this.category1Id = categoryId.category1Id
                this.category2Id = categoryId.category2Id
                this.category3Id = categoryId.category3Id
                this.attr.categoryId = this.category3Id
                //只有当选择了三级分类，才请求获取属性列表
                this.getAttrs()
            }
        },
        // 获取属性列表
        async getAttrs() {
            const { category1Id, category2Id, category3Id } = this
            const result = await reqAttrData(category1Id, category2Id, category3Id)
            console.log(result)
            if (result.code == 200) {
                this.attrs = result.data
            }
        },
        // 添加
        addAttr() {
            this.scene = 1
            // 点击添加属性按钮收集Id
            // console.log(this.c3)
            // this.attr.categoryId = this.category3Id;
            // console.log(this.category3Id)
            // 清空数据
            this.attr = {
                attrName: '',
                attrValueList: [],
                categoryId: this.category3Id,
                categoryLevel: 3,
            }
            this.$nextTick(() => {
                // 获取input 第三季添加属性值按钮以后新增的el-input一定是在最后位置 ref:数组长度减去1
                this.$refs[this.attr.attrValueList.length - 1].focus()
            })

        },
        // 取消
        cancel() {
            this.scene = 0
        },
        // 添加属性的名字
        addAttrValue() {
            this.attr.attrValueList.push({
                valueName: '',//收集属性的名字
                show: true,
            })
        },
        async save() {
            this.scene = 0;
            // 新的属性在已有的属性中出现不能发请求 
            if (
                this.attr.filter((item) => item.attrName == this.attr.attrName) &&
                !this.attr.id
            ) {
                this.$message('新增的属性已存在')
                return
            }
            //非法情况2:只要属性值有空的不能发请求
            let isAttrValueNone = this.attr.attrValueList.find((item) => {
                return item.valueName == "";
            });
            if (isAttrValueNone) {
                this.$message("属性值有空的请您填写完毕");
                return;
            }
            //数组替换
            this.attr.attrValueList = this.attr.attrValueList.map((item)=>{
                return {
                    attrId:item.attrId,
                    valueName:item.valueName
                }
            })
            try {
                await reqAddOrUpdateAttr(this.attr)
                // 切换场景
                this.scene = 0
                // 获取最新数据
                this.getAttrs()
                this.$message({
                    message: this.attr.id ? '修改成功' : '添加成功',
                    type: 'success',
                    position: 'bottom-left'
                })
                this.getAttrs()
            } catch (error) {
                this.$message({
                    message: this.attr.id ? '修改失败' : '添加失败',
                    type: 'error',
                    position: 'bottom-left'
                })
            }
        },
        // 失去焦点变为查看模式
        toLook(row) {
            // 属性值为空
            if (row.valueName.trim() == '') {
                // 提示信息
                this.$message({ type: 'warning', message: '属性的属性值不能为空的' })
                // 遇见return 后面的语句不在执行
                return
            }
            // 第二种情况:属性值重复
            let repeat = this.attr.attrValueList.find(item => {
                if (item != row) {
                    return item.valueName === row.valueName
                }
            })
            // 如果出现重复的  后面语句不在执行
            if (repeat) {
                this.$message({ type: 'warning', message: `${repeat.valueName}重复了` })
                return
            }

            row.show = false
        },
        toEdit(row, $index) {
            row.show = true
            // 获取最新的数据
            this.$nextTick(() => {
                // focus可以让组件实现聚焦
                this.$refs[$index].focus();
            })
        },
        // 修改按钮
        update(row) {
            this.scene = 1;
            // 已有的数组展示数据
            //    收集的参数[添加属性]
            this.attr = cloneDeep(row)
            // 赋值完毕以后  给每一个属性值追加一个show字段  item属性值的独享
            this.attr.attrValueList.forEach(item => {
                // 这种追加的属性并非响应式数据（vue能检测数组的变化[数组替换|变更]）
                // show是后面追加
                // item.show = false;
                this.$set(item, 'show', false)
            })
            // map数组替换
            // this.attr.attrValueList = this.attr.attrValueList.map(item=>{
            //     return{
            //         // 原来已有的数组进行拷贝
            //         ...item,
            //         show:false,
            //     }
            // })
        },
        // 删除某一个属性
        async deleteAttr(row) {
            try {
                await reqDeleteAttrById(row.id)
                this.$message({ type: 'success', message: '删除成功' })
                // 获取最新数据
                this.getAttrs()
            } catch (error) {
                this.$message({ type: 'error', message: '删除失败' })
            }
        }
    },

}

</script>

<style scoped>

</style>