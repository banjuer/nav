# Changelog

All notable changes to this project will be documented in this file.

## [1.5.0] - 2026-03-21

### 🚀 Features

- **拖拽排序功能**：登录后支持拖拽书签和分类进行排序
  - 书签拖拽：整个书签区域均可拖拽，无需特定拖拽图标
  - 分类拖拽：水平方向拖拽分类标签排序
  - 拖拽后自动保存排序并刷新页面
  - 使用 `@dnd-kit` 实现，支持触控板和鼠标操作

### 🎨 UI/UX Improvements

- 拖拽时显示抓手图标（cursor-grab/grabbing）
- 拖拽距离阈值设置为 3px，防止误触发
- 未登录用户不显示拖拽功能，保持原有交互

## [1.12.1] - 2025-01-17

### 🚀 Features

- 修正 embed 导致的图标显示不全 #40

### 🐛 Bug Fixes

- 调整后端 svg 显示 #40
- 处理在初始化后返回结果为 null 导致的无法显示后台登录卡片问题 #67

## [1.12.0] - 2024-12-21

### 🚀 Features

- 前台实现隐藏分类，后台实现隐藏编辑 #56

### 🐛 Bug Fixes

- 移除多余的 print

## [1.11.5] - 2024-12-21

### 🐛 Bug Fixes

- 管理入口消失，网站修改信息无效 #52 #53
- Allow dirty
- Build error
- Build error
- 网站修改信息无效 #52 #53

### 📚 Documentation

- Update
- Update
- Update

### ⚙️ Miscellaneous Tasks

- 优化流水线速度
- Build
- Update deps
- Build error

## [1.11.4] - 2024-12-14

### 🐛 Bug Fixes

- ApiToken 无法获取工具&api-token 页面不能刷新 #51

### 📚 Documentation

- Update

### ⚙️ Miscellaneous Tasks

- Cd

## [1.11.3] - 2024-12-14

### 🐛 Bug Fixes

- 后台添加工具后，表单信息没重置 #50

### 📚 Documentation

- Update

## [1.11.2] - 2024-12-14

### 🐛 Bug Fixes

- 重构后浏览器插件无法添加工具
- Skip 386
- 无法展示

### 📚 Documentation

- Update
- Update

### ⚙️ Miscellaneous Tasks

- Build error

## [1.11.1] - 2024-12-13

### 🐛 Bug Fixes

- 隐藏工具失效,改成后端判断 #49
- Sql error
- 轮换 jwt secret 后签发 api token 失效

### 📚 Documentation

- Add faq
- Update

## [1.11.0] - 2024-12-08

### 🚀 Features

- Jwt secret 轮换
- 默认 30 天过期
- 更新一份 api 文档(beta)
- 后台增加拖拽排序功能 #48

### 🐛 Bug Fixes

- 去掉后台分类管理冗余图片
- Use crypto/rand

### 📚 Documentation

- Update image
- 更新 api 文档'
- Update readme
- Changelog

## [1.10.0] - 2024-12-07

### 🐛 Bug Fixes

- Run errror
- Build error

### 📚 Documentation

- Update changelog
- Update image

### ⚙️ Miscellaneous Tasks

- Build failed
- Build error

## [1.9.3] - 2024-12-07

### 🚜 Refactor

- 重构后端，结构清晰便于维护
- 前端更新为 react19
- 前端整合成一个，ui 优化，路由懒加载

### 📚 Documentation

- 更新文档，增加了 api 文档(beta）
- Update changelog
- 更新截图

### ⚙️ Miscellaneous Tasks

- Update workflow
- Update workflow
- Remove files

## [1.9.2] - 2023-09-16

### 🐛 Bug Fixes

- 中文输入法回车触发提交 & 默认没有 icp 备案号

### ⚙️ Miscellaneous Tasks

- V1.9.2

## [1.9.1] - 2023-09-15

### 🐛 Bug Fixes

- 默认不展示 icp 证

## [1.9.0] - 2023-09-15

### 🚀 Features

- 优化搜索速度 & 允许输入空格
- 后台可设置默认跳转方式
- 支持启动时指定端口

### 💼 Other

- 添加底部 ICP 备案
- 底部 ICP 备案样式

### 📚 Documentation

- Update
- Update

### ⚙️ Miscellaneous Tasks

- Build
- V1.9.0

## [1.8.7] - 2023-07-04

### 🐛 Bug Fixes

- 前台 404 #12

### ⚙️ Miscellaneous Tasks

- V1.8.7

## [1.8.6] - 2023-07-04

### 🐛 Bug Fixes

- 前台 404 #12

### ⚙️ Miscellaneous Tasks

- V1.8.6

## [1.8.5] - 2023-07-04

### 🐛 Bug Fixes

- Build error

## [1.8.4] - 2023-07-04

### 🐛 Bug Fixes

- 前台一片空白 #12

## [1.8.3] - 2023-07-04

### ⚙️ Miscellaneous Tasks

- V1.8.3

## [1.8.2] - 2023-07-04

### 🐛 Bug Fixes

- Theme switch logic

### ⚙️ Miscellaneous Tasks

- V1.8.2

## [1.8.1] - 2023-06-28

### 🐛 Bug Fixes

- 老版本升级后报错
- 后台 setting 页面刷新后表单为空

### ⚙️ Miscellaneous Tasks

- V1.8.1

## [1.8.0] - 2023-06-27

### 🚀 Features

- 增加去掉 github 链接的后台配置项#7
- 支持隐藏条目，只有登录后才展示#2
- 搜索引擎集成 #10
- 增加快速选择快捷键
- 支持自定义跳转方式

### 🐛 Bug Fixes

- 修改文案
- 新建工具后再打开浮层会保留上次内容 #9
- 在非 /admin 刷新后台会 404 #9

### 📚 Documentation

- 更新文档
- 更新文档
- 更新一个交流群

### ⚙️ Miscellaneous Tasks

- 更新流水线，使用 ubuntu20.04
- 构建报错
- 构建报错

## [1.7.0] - 2023-04-27

### 🚀 Features

- 后台增加一个隐藏管理按钮的设置

### 🎨 Styling

- 固定侧边栏和顶栏

### ⚙️ Miscellaneous Tasks

- 准备发布新版本

## [1.6.0] - 2023-03-30

### 🚀 Features

- 数据库增加排序字段，并实现相应 CRU 接口
- 后台管理页面增加工具、分类排序字段编辑，工具页面增加"分类"查询条件
- 修改分类名称时，同步修改工具相关分类名称

### 🐛 Bug Fixes

- Mac 启动脚本还原
- 修复 排序 默认值无法提交问题，并增加 tip 提示
- 后台列表样式错位

### ⚙️ Miscellaneous Tasks

- 增加 windows 开发启动脚本
- V1.6.0

## [1.5.4] - 2023-02-20

### ⚙️ Miscellaneous Tasks

- V1.5.4

## [1.5.3] - 2023-02-20

### ⚙️ Miscellaneous Tasks

- 更新构建脚本 node version

## [1.5.2] - 2023-02-20

### ⚙️ Miscellaneous Tasks

- 更新构建脚本 node version

## [1.5.1] - 2023-02-20

### ⚙️ Miscellaneous Tasks

- 更新构建脚本

## [1.5.0] - 2023-02-20

### 🚀 Features

- 光标移动到内容上会有 tooltip
- 增加项目地址链接按钮

### 🐛 Bug Fixes

- 启动报错
- 后台增加修改工具 toast 不消失&后台升级 vite、react 版本

### 💼 Other

- 前台去掉无用的 console.log

### ⚙️ Miscellaneous Tasks

- 构建类型错误

## [1.4.2] - 2023-02-15

### 🐛 Bug Fixes

- Toast 失效

### ⚙️ Miscellaneous Tasks

- V1.4.2
- V1.4.2

## [1.4.1] - 2023-02-15

### 🚀 Features

- 更新工具异步获取图标 #3

### ⚙️ Miscellaneous Tasks

- V1.4.1

## [1.4.0] - 2023-02-15

### 🚀 Features

- 自动主题切换#1

### 🐛 Bug Fixes

- 空分类不展示

### ⚙️ Miscellaneous Tasks

- V1.4.0

## [1.3.2] - 2023-02-15

### ⚙️ Miscellaneous Tasks

- Webhook 消息错误
- V1.3.1
- V1.3.2

## [1.3.1] - 2023-02-15

### 🚀 Features

- 可修改 pwa 安装时的图标和描述

### ⚙️ Miscellaneous Tasks

- 更新集群部署
- V1.3.0

## [1.3.0] - 2023-02-14

### 🚀 Features

- 异步 logo 自动获取#3

## [1.2.2] - 2023-02-09

### 🚀 Features

- 可安装时使用后台设置的站点图标和名字

## [1.2.1] - 2022-11-17

### ⚙️ Miscellaneous Tasks

- Fix build error

## [1.2.0] - 2022-11-17

### 🚀 Features

- PWA

### 📚 Documentation

- 增加浏览器插件描述
- 更新 todo

## [1.1.10] - 2022-04-27

### 🚀 Features

- 创建修改工具增加 loading

## [1.1.9] - 2022-04-14

### 🚀 Features

- 初步增加图片缓存
- 增加 gzip 中间件
- Svg 格式增加默认图片

### 🐛 Bug Fixes

- Svg 缓存显示
- 存库图片不编码
- 没有抓取到图片不缓存空值到库
- 爬取图片缓存取消证书校验&增加请求头
- Url 编码保存，避免特殊字符
- 导入工具时会自动加载图片缓存

### 📚 Documentation

- 更新文档
- Update

## [1.1.8] - 2022-04-12

### 🐛 Bug Fixes

- Ci

## [1.1.7] - 2022-04-12

### 🐛 Bug Fixes

- Cui

## [1.1.6] - 2022-04-12

### 🐛 Bug Fixes

- Ci
- Ci

## [1.1.5] - 2022-04-12

### 🐛 Bug Fixes

- 调整 ci

## [1.1.4] - 2022-04-12

### 🐛 Bug Fixes

- 调整发版架构

## [1.1.3] - 2022-04-12

### 🚀 Features

- 二进制增加一些新架构

### 🐛 Bug Fixes

- 流水线增加通知 & 增加 demo 部署步骤

### 📚 Documentation

- 完善 README
- 更新文档
- 修改文档
- 更新文档

## [1.1.2] - 2022-04-11

### 🐛 Bug Fixes

- Ci

## [1.1.1] - 2022-04-11

### 🧪 Testing

- Ci

## [1.1.0] - 2022-04-11

### 🚀 Features

- 管理后台不记录缓存
- API Token 功能

### 🐛 Bug Fixes

- 去掉烦人的 notification 提示
- 移除 report 代码

### 📚 Documentation

- V1.1.0

## [1.0.20] - 2022-04-11

### 🚀 Features

- 导入数据时自动添加分类

## [1.0.19] - 2022-04-11

### 🐛 Bug Fixes

- 去掉烦人的 node-sass

### 💼 Other

- 删除无用脚本

## [1.0.18] - 2022-04-10

### 🐛 Bug Fixes

- Ci

## [1.0.17] - 2022-04-10

### 🐛 Bug Fixes

- Ci

## [1.0.16] - 2022-04-10

### 🐛 Bug Fixes

- Ci

## [1.0.15] - 2022-04-10

### 🐛 Bug Fixes

- Ci

## [1.0.14] - 2022-04-10

### 🧪 Testing

- Ci

## [1.0.13] - 2022-04-10

### 🐛 Bug Fixes

- Ci

## [1.0.12] - 2022-04-10

### 💼 Other

- Ci

## [1.0.11] - 2022-04-10

### 🐛 Bug Fixes

- 修复 CI

## [1.0.9] - 2022-04-10

### 🚀 Features

- 增加全自动化流水线'
- 全自动流水线测试

### 💼 Other

- 删除 public 文件夹

## [1.0.7] - 2022-04-08

### 🐛 Bug Fixes

- 可以搜索 url 了

## [1.0.6] - 2022-04-08

### 🐛 Bug Fixes

- Tag 的高度样式 & 增加 public

## [1.0.5] - 2022-04-08

### 🚀 Features

- 标签历史记录
- 搜索状态切换标签取消搜索状态 & 点击卡片后搜索状态取消
- 搜索后回车直接进入

### 🐛 Bug Fixes

- 暗色模式 tag 样式

## [1.0.4] - 2022-04-01

### 🐛 Bug Fixes

- 修复获取图标逻辑 & 增加批量重置图标功能

## [1.0.3] - 2022-04-01

### 🚀 Features

- 增加了自动获取 icon 的功能

## [1.0.2] - 2022-03-31

### 🐛 Bug Fixes

- 后台增加图标

## [1.0.1] - 2022-03-31

### 🐛 Bug Fixes

- 相对路径问题
- Build 脚本

## [1.0.0] - 2022-03-31

### 🐛 Bug Fixes

- 暗色模式卡片颜色调整 & 去除滤镜

### 💼 Other

- V1.0.0

## [0.6.5] - 2022-03-26

### 🚀 Features

- 增大下方空白区 & 搜索框绑定按键 & 增加管理后台默认应用 & 搜索可以支持拼音匹配并搜索描述文字

## [0.6.2] - 2022-03-25

### 🐛 Bug Fixes

- Body 禁止滚动 & tag 宽度过小

## [0.6.0] - 2022-03-25

### 🚀 Features

- 滚动后面留出空白
- 支持暗色模式

## [0.5.3] - 2022-03-25

### 🐛 Bug Fixes

- 修复整个页面可拖动

## [0.5.1] - 2022-03-25

### 🐛 Bug Fixes

- Iphone 搜索框缩放

## [0.5.0] - 2022-03-25

### 🚀 Features

- 基本完成

### 💼 Other

- 规范代码

## [0.4.0] - 2022-01-04

### 🚀 Features

- 增加导入导出功能

### 💼 Other

- README

## [0.3.3] - 2021-12-20

### 🚀 Features

- 增加总数概览

### 🐛 Bug Fixes

- 去除无用日志

## [0.3.2] - 2021-12-20

### 🐛 Bug Fixes

- 修改工具时没有默认值

<!-- generated by git-cliff -->
