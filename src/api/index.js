// 将所有请求放在一起

// export {default as attr} from './product/attr';
// 结构

// export {default as trademark} from './product/trademark';


// 引入权限请求
// export { default as user} from './acl/user'


// 对外暴露
// export {
    //     attr,
    //     trademark,
    //     user,
    // }
    export {default as login} from './acl/login' // {default: {}}
    export {default as trademark} from './product/trademark' // {default: {}}
    export {default as user} from './acl/user' // {default: {}}