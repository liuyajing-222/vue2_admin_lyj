<template>
    <div>
        <el-card shadow="always" :body-style="{ padding: '20px' }">
            <el-form :inline="true" label-width="80px" :model="cForm">
                <el-form-item label="一级分类">
                    <el-select @change="handlerCategory1" v-model="cForm.category1Id">
                        <el-option :label="c1.name" :value="c1.id" v-for="c1 in category1List" :key="c1.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="二级分类">
                    <el-select v-model="cForm.category2Id" @change="handlerCategory2">
                        <el-option :label="c2.name" :value="c2.id" v-for="c2 in category2List" :key="c2.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="三级分类">
                    <el-select v-model="cForm.category3Id" @change="handlerCategory3">
                        <el-option :label="c3.name" :value="c3.id" v-for="c3 in category3List" :key="c3.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
        </el-card>

    </div>
</template>

<script >
import { reqCategory1Data, reqCategory2Data, reqCategory3Data } from '@/api/product/attr'
export default {
    name: "Category",
    data() {
        return {
            category1List: [], //一级分类的数据
            category2List: [], //二级分类的数据
            category3List: [], //三级分类的数据
            cForm: {
                // 收集相应的id
                category1Id: '',
                category2Id: '',
                category3Id: ''
            }
        }
    },

    //页面挂载
    //收集数据
    mounted() {
        this.getCategory1List()
    },
    methods: {
        //获取一级分类数据显示
        async getCategory1List() {
            let result = await reqCategory1Data()
            // console.log(result);
            if (result.code === 200) {
                this.category1List = result.data
            }

        },
        //点击一级分类获取二级分类数据
        async handlerCategory1() {
            // 清空数据
            this.category2List = [];
            this.category3List = [];
            this.cForm.category2Id = '';
            this.cForm.category3Id = '';
            let result = await reqCategory2Data(this.cForm.category1Id)
            //console.log(result);
            if (result.code === 200) {
                this.category2List = result.data
            }
        },
        //点击二级分类获取三级分类的数据
        async handlerCategory2() {
            this.category3List = [];
            this.cForm.category3Id = '';
            let result = await reqCategory3Data(this.cForm.category2Id)
            // console.log(result);
            if (result.code === 200) {
                this.category3List = result.data
            }
        },
        //点击三级分类
        handlerCategory3() {
            // const { category3Id } = this.cForm
            this.$emit('getCategoryId', { categoryId: this.cForm, level: 3 })
        }
    },
}
</script>

<style scoped>

</style>