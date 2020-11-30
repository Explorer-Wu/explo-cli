# explo-cli

前端工程自动化构建工具
该构建模版可选择react.js或vue.js的PC端模版, react.js相关的移动端模版

* 安装 
```
    npm install explo-cli -g
```    

* 用法
* 初始化项目模版
```
    explo init <projectName>
```
或者
```
    explo i <projectName>
```

* 版本号查看
```
    explo -v
```    

## 前端自动化构建目标期望
快速生成新项目的目录模板，目录结构是每个项目统一个模版规范（目录规范），设定通用的配置如下：  
    1. 通用的Webpack配置  
    2. 统一的Eslint 校验规则eslintConfig）   
    3. 统一的单元测试框架配置：单元测试覆盖率、测试的目录等   
    4. 统一的Dockerfile和jenkinsfile (用来打包成镜像和部署流水线定义)   
    5. 统一babel的配置（.babelrc或babel.config.js）   
    6. 统一的常量配置（缓存字段等等）不同环境的配置文件（development、test、production）   

脚手架起到一个至关重要的角色，通过脚手架来约束好规范，统一的配置，来打通新项目的开发工具链，一方面提升开发效率，一方面则提高项目对接可维护性及新员工熟悉项目简易性。

开发一个高度可定制化的脚手架，需要考虑的因素很多。 explo-cli通常准备3个模版：  
    1.pc端react模版;   2. mobile端的react模版;   3.pc端vue模版 
然后用git管理起来，我需要如下工具：  \
    1) 用于控制台选择的工具：inquirer  \
    2) 处理控制台命令的工具：commander \
    3) 可改变输出log颜色的工具：chalk  \
    4) 可执行shell命令的工具: child_process   

**前端自动化脚手架说明**    
explore.js文件的第一行，一定是第一行，添加了
`#!/usr/bin/env node`
代码，指定了我们脚本的运行环境，相当于运行explo命令的时候添加了node命令作为前缀，即实际运行的是node explo

## 前端自动化构建流程  
    1. 命令入口 package.json  
    2. commander处理子命令，inquirer解析命令参数  
    3. 校验新建项目文件夹名，判断覆盖、新建和退出  
    4. 获取远程项目模版信息列表   
    5. 选择所需远程模板  
    6. 输入模板远程仓库中你所需的分支，默认是 master  
    7. 下载模板至本地模板库                        
    8. 把本地模版资源文件拷贝至项目文件夹             
    9. 修改项目模板中package.json的用户相关信息      
    10. 对项目进行git初始化                    
    11. 安装项目依赖包，构建完毕，进入开发阶段  
