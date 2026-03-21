**本项目主要修改的点：**
* 书签支持定义变量（支持预定义值、下拉选择、回车确认等）
* 登录后可直接编辑书签
* 登录后支持拖拽排序（书签和分类）
---

# Nav

一个轻量的导航站，原开发者不怎么维护了，魔改私用。  
[源库地址](https://github.com/Mereithhh/van-nav)  
以下为原仓库内容，等有时间再更新
> 新增了 [API 文档](https://van-nav-api.mereith.dev)，用 AI 生成的，如果不准确请提 Issue 哦。

## 预览

### PC

<img src="images/pc_preview.png" alt="PC" style="width: 100%;"/>

### PAD

<img src="images/pad_preview.png" alt="PAD" style="width: 100%;"/>

### PHONE

<img src="images/phone_preview.png" alt="PHONE" style="width: 100%;"/>

### 后台设置

<img src="images/login.jpg" alt="登录" style="width: 100%;"/>

<img src="images/admin.jpg" alt="后台设置" style="width: 100%;"/>

### 交流群

<img src="images/qqqun.jpg" alt="交流群" style="height: 200px;"/>

> qq 交流群： 873773083

## 使用技巧/快捷键

其实这个导航站有很多小设计，合理使用可以提高使用效率：

- 只要在这个页面里，直接输入键盘任何按键，可以直接聚焦到搜索框开始输入。
- 搜索完按回车会直接在新标签页打开第一个结果。
- 搜索完按一下对应卡片右上角的数字按钮 + Ctrl(mac 也可以用 command 键) ，也会直接打开对应结果。

另外可以设置跳转方式哦。

## 书签变量功能

书签网址支持变量模式，可以定义动态参数：

### 基础变量
使用 `{变量名}` 格式定义变量，点击书签时会弹出输入框让用户填写：
```
https://www.google.com/search?q={keyword}
```

### 预定义值变量
使用 `{变量名=值1,值2,值3}` 格式定义带预置值的变量：
```
https://example.com/search?env={env=prod,dev,test}&q={keyword}
```

特性说明：
- **下拉选择**：有预定义值时，弹窗会显示为下拉框，支持点击输入框自动展开、直接输入或下拉选择
- **默认值**：第一个预置值自动作为默认值
- **自动追加**：用户输入的新值会自动追加到 URL 变量定义中（自动去重）
- **回车确认**：变量弹窗支持按回车键快速确认

### 使用示例

1. **多环境切换**：
   ```
   https://{env=prod,dev}.example.com/dashboard
   ```
   点击时显示下拉框，选项：prod, dev，默认选中 prod

2. **搜索关键词**：
   ```
   https://github.com/search?q={keyword}
   ```
   点击时显示输入框，用户自由输入

3. **混合使用**：
   ```
   https://{region=cn,us,eu}.service.com/api/{version=v1,v2}/resource
   ```
   多个变量同时存在，各自独立配置

## 拖拽排序功能

登录后支持拖拽排序，让书签管理更加便捷：

### 功能特性

- **书签拖拽**：登录后可以拖拽任意书签卡片进行排序
  - 整个书签区域均可拖拽，无需特定拖拽图标
  - 拖拽后自动保存排序并刷新页面
  - 支持网格布局的拖拽排序

- **分类拖拽**：登录后可以拖拽分类标签进行排序
  - 水平方向拖拽排序
  - 拖拽后自动保存排序并刷新页面

### 使用方法

1. 登录系统
2. 鼠标悬停在书签卡片或分类标签上，显示抓手图标
3. 按住鼠标并拖动到目标位置
4. 释放鼠标，系统自动保存新顺序

### 技术实现

- 使用 `@dnd-kit` 实现拖拽功能
- 支持触控板和鼠标操作
- 拖拽距离阈值：3px（防止误触发）
- 自动调用后端 API 更新排序

## CHANGELOG

具体请看 [CHANGELOG.md](CHANGELOG.md)

## 安装方法

### Docker

```
docker run -d --name tools --restart always -p 6412:6412 -v /path/to/your/data:/app/data banjuer/nav:latest
```

打开浏览器 [http://localhost:6412](http://localhost:6412) 即可访问。

- 默认端口 6412
- 默认账号密码 admin admin 第一次运行后请进入后台修改
- 数据库会自动创建在当前文件夹中： `nav.db`

### 可执行文件

下载 release 文件夹里面对应平台的二进制文件，直接运行即可。

打开浏览器 [http://localhost:6412](http://localhost:6412) 即可访问。

- 默认端口 6412 动时添加 `-port <port>` 参数可指定运行端口。
- 默认账号密码 admin admin ，第一次运行后请进入后台修改
- 数据库会自动创建在当前文件夹中： `nav.db`

### nginx 反向代理

参考配置

> 其中 `<yourhost>` 和 `<your-cert-path>` 替换成你自己的。

```
server {
    listen 80;
    server_name <yourhost>;
    return 301 https://$host$request_uri;
}

server {
    listen 443   ssl http2;
    server_name <yourhost>;

    ssl_certificate <your-cert-path>
    ssl_certificate_key <your-key-path>;
    ssl_verify_client off;
    proxy_ssl_verify off;
    location / {
        proxy_pass  http://127.0.0.1:6412;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        proxy_set_header Upgrade $http_upgrade;
    }
}
```

### systemd 服务

可以注册成系统服务，开机启动。

1. 复制二进制文件到 `/usr/local/bin` 目录下，并加上执行权限

2. 新建 `VanNav.serivce` 文件于 `/usr/lib/systemd/system` 目录下:

```
[Unit]
Description=VanNav
Documentation=https://github.com/van579/nav
After=network.target
Wants=network.target

[Service]
WorkingDirectory=/usr/local/bin
ExecStart=/usr/local/bin/nav
Restart=on-abnormal
RestartSec=5s
KillMode=mixed

StandardOutput=null
StandardError=syslog

[Install]
WantedBy=multi-user.target
```

3. 执行:

```
sudo systemctl daemon-reload && sudo systemctl enable --now VanNav.service
```

## 浏览器插件

具体请看： [浏览器插件仓库](https://github.com/Mereithhh/van-nav-extension)

具有一键增加工具，快速打开管理后台和主站等功能。具体自行探索哦。

## API

本导航站支持 API，可以用自己的方法添加工具。

尝试用 ai 生成 api 文档，具体请看

> [API 文档](https://van-nav-api.mereith.dev)

## FAQ

- 忘记密码了怎么办： [看这里](https://github.com/Mereithhh/van-nav/issues/36)

## 参与开发

最近重构过一次，整体的代码结构暂时不会有大变动，所以欢迎参与开发！

如果你有 golang 和 react 开发经验，可以很轻松上手。

如果没有方向，可以试试去解决 issue 里的问题或者开发新功能，开发之前可以先提个 issue 让我知道。

## 状态

可以优化的点太多了，慢慢完善吧……

- [x] 多平台构建流水线
- [x] 定制化 logo 和标题
- [x] 导入导出功能
- [x] 暗色主题切换
- [x] 移动端优化
- [x] 自动获取网站 logo
- [x] 拼音匹配的模糊搜索功能
- [x] 按键直接搜索，搜索后回车直接打开第一项
- [x] 图片存库，避免跨域和加载慢的问题
- [x] gzip 全局压缩
- [x] 中文 url 图片修复
- [x] svg 图片修复
- [x] 浏览器插件
- [x] 自动获取网站题目和描述等信息
- [x] 后台按钮可自定义隐藏
- [x] github 按钮可隐藏
- [x] 支持登录后才能查看的隐藏卡片
- [x] 搜索引擎集成功能
- [x] 增加一些搜索后快捷键直接打开卡片
- [x] 支持自定义跳转方式
- [x] 自动主题切换
- [ ] 国际化
- [x] 增加 ServiceWork ,离线可用,可安装
- [ ] 网站状态检测
- [x] 支持后台设置默认跳转方式
- [x] 支持指定监听端口
