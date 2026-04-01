package database

import (
	"database/sql"
	"path/filepath"

	_ "modernc.org/sqlite"

	"github.com/mereith/nav/logger"
	"github.com/mereith/nav/utils"
)

var DB *sql.DB

func columnExists(tableName string, columnName string) bool {
	query := `SELECT COUNT(*) FROM pragma_table_info(?) WHERE name=?`
	var count int
	err := DB.QueryRow(query, tableName, columnName).Scan(&count)
	if err != nil {
		return false
	}
	return count > 0
}

func InitDB() {
	var err error
	utils.PathExistsOrCreate("./data")
	// 创建数据库
	dir := "./data"
	dbPath := filepath.Join(dir, "nav.db")
	// 添加连接参数
	dbPath = dbPath + "?_journal=WAL&_timeout=5000&_busy_timeout=5000&_txlock=immediate"
	DB, err = sql.Open("sqlite", dbPath)
	utils.CheckErr(err)
	// user 表
	sql_create_table := `
		CREATE TABLE IF NOT EXISTS nav_user (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT,
			password TEXT
		);
		`
	_, err = DB.Exec(sql_create_table)
	utils.CheckErr(err)
	// setting 表
	sql_create_table = `
	CREATE TABLE IF NOT EXISTS nav_setting (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		favicon TEXT,
		title TEXT,
		govRecord TEXT,
		logo192 TEXT,
		logo512 TEXT,
		hideAdmin BOOLEAN,
		hideGithub BOOLEAN,
		jumpTargetBlank BOOLEAN
	);
	`
	_, err = DB.Exec(sql_create_table)
	utils.CheckErr(err)
	// 检查并添加列
	if !columnExists("nav_setting", "logo192") {
		DB.Exec(`ALTER TABLE nav_setting ADD COLUMN logo192 TEXT;`)
	}
	if !columnExists("nav_setting", "logo512") {
		DB.Exec(`ALTER TABLE nav_setting ADD COLUMN logo512 TEXT;`)
	}
	if !columnExists("nav_setting", "govRecord") {
		DB.Exec(`ALTER TABLE nav_setting ADD COLUMN govRecord TEXT;`)
	}
	if !columnExists("nav_setting", "jumpTargetBlank") {
		DB.Exec(`ALTER TABLE nav_setting ADD COLUMN jumpTargetBlank BOOLEAN;`)
	}
	// 设置表表结构升级-20230628
	if !columnExists("nav_setting", "hideAdmin") {
		DB.Exec(`ALTER TABLE nav_setting ADD COLUMN hideAdmin BOOLEAN;`)
	}
	// 设置表表结构升级-20230627
	if !columnExists("nav_setting", "hideGithub") {
		DB.Exec(`ALTER TABLE nav_setting ADD COLUMN hideGithub BOOLEAN;`)
	}

	// 设置表表结构升级-20240122-CustomCode
	if !columnExists("nav_setting", "customJS") {
		DB.Exec(`ALTER TABLE nav_setting ADD COLUMN customJS TEXT;`)
	}
	if !columnExists("nav_setting", "customCSS") {
		DB.Exec(`ALTER TABLE nav_setting ADD COLUMN customCSS TEXT;`)
	}

	// 设置表表结构升级-202401xx-GuestPassword
	if !columnExists("nav_setting", "guestPassword") {
		DB.Exec(`ALTER TABLE nav_setting ADD COLUMN guestPassword TEXT;`)
	}

	// 默认 tools 用的 表
	sql_create_table = `
		CREATE TABLE IF NOT EXISTS nav_table (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT,
			url TEXT,
			logo TEXT,
			catelog TEXT,
			desc TEXT
		);
		`
	_, err = DB.Exec(sql_create_table)
	utils.CheckErr(err)

	// tools数据表结构升级-20230327
	if !columnExists("nav_table", "sort") {
		DB.Exec(`ALTER TABLE nav_table ADD COLUMN sort INTEGER;`)
	}

	// tools数据表结构升级-20230627
	if !columnExists("nav_table", "hide") {
		DB.Exec(`ALTER TABLE nav_table ADD COLUMN hide BOOLEAN;`)
	}

	// 分类表
	sql_create_table = `
		CREATE TABLE IF NOT EXISTS nav_catelog (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT
		);
			`
	_, err = DB.Exec(sql_create_table)
	utils.CheckErr(err)

	// 分类表表结构升级-20230327
	if !columnExists("nav_catelog", "sort") {
		DB.Exec(`ALTER TABLE nav_catelog ADD COLUMN sort INTEGER NOT NULL DEFAULT 0;`)
	}

	// 分类表表结构升级-20241219-【隐藏分类】
	if !columnExists("nav_catelog", "hide") {
		DB.Exec(`ALTER TABLE nav_catelog ADD COLUMN hide BOOLEAN;`)
	}
	migration_2024_12_13() // 只涉及 nav_catelog 表，所以可以放在这里

	// api token 表
	sql_create_table = `
		CREATE TABLE IF NOT EXISTS nav_api_token (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT,
			value TEXT,
			disabled INTEGER
		);
		`
	_, err = DB.Exec(sql_create_table)
	utils.CheckErr(err)
	// img 表
	sql_create_table = `
		CREATE TABLE IF NOT EXISTS nav_img (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			url TEXT,
			value TEXT
		);
		`
	_, err = DB.Exec(sql_create_table)
	utils.CheckErr(err)
	// 如果不存在，就初始化用户
	sql_get_user := `
		SELECT * FROM nav_user;
		`
	rows, err := DB.Query(sql_get_user)
	utils.CheckErr(err)
	if !rows.Next() {
		sql_add_user := `
			INSERT INTO nav_user (id, name, password)
			VALUES (?, ?, ?);
			`
		stmt, err := DB.Prepare(sql_add_user)
		utils.CheckErr(err)
		res, err := stmt.Exec(utils.GenerateId(), "admin", "admin")
		utils.CheckErr(err)
		_, err = res.LastInsertId()
		utils.CheckErr(err)
	}
	rows.Close()
	// 如果不存在设置，就初始化
	sql_get_setting := `
		SELECT * FROM nav_setting;
		`
	rows, err = DB.Query(sql_get_setting)
	utils.CheckErr(err)
	if !rows.Next() {
		sql_add_setting := `
			INSERT INTO nav_setting (favicon, title, govRecord, logo192, logo512, hideAdmin, hideGithub, jumpTargetBlank)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?);
			`
		stmt, err := DB.Prepare(sql_add_setting)
		utils.CheckErr(err)
		res, err := stmt.Exec("favicon.ico", "Van Nav", "", "logo192.png", "logo512.png", false, false, true)
		utils.CheckErr(err)
		_, err = res.LastInsertId()
		utils.CheckErr(err)
	}
	rows.Close()

	// 如果没有分类数据，添加测试数据
	initTestData()

	logger.LogInfo("数据库初始化成功💗")
}

// initTestData 添加测试数据
func initTestData() {
	sql_get_catelog := `SELECT COUNT(*) FROM nav_catelog;`
	var catelogCount int
	err := DB.QueryRow(sql_get_catelog).Scan(&catelogCount)
	if err != nil {
		return
	}

	// 如果有数据则不添加
	if catelogCount > 0 {
		return
	}

	// 添加测试分类
	catelogs := []struct {
		id   int64
		name string
		sort int
	}{
		{1, "常用工具", 1},
		{2, "开发工具", 2},
		{3, "学习资源", 3},
		{4, "娱乐休闲", 4},
		{5, "设计资源", 5},
	}

	sql_add_catelog := `INSERT INTO nav_catelog (id, name, sort) VALUES (?, ?, ?);`
	for _, c := range catelogs {
		DB.Exec(sql_add_catelog, c.id, c.name, c.sort)
	}

	// 生成100个测试书签
	tools := generateTestTools()

	sql_add_tool := `INSERT INTO nav_table (id, name, url, logo, catelog, desc, sort, hide) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`
	for _, t := range tools {
		DB.Exec(sql_add_tool, t.id, t.name, t.url, t.logo, t.catelog, t.desc, t.sort, t.hide)
	}
}

// Tool 测试书签结构
type Tool struct {
	id      int64
	name    string
	url     string
	logo    string
	catelog string
	desc    string
	sort    int
	hide    bool
}

// generateTestTools 生成100个测试书签数据
func generateTestTools() []Tool {
	toolData := []struct {
		name    string
		url     string
		catelog string
		desc    string
	}{
		// 常用工具 (20个)
		{"Google", "https://www.google.com", "常用工具", "搜索引擎"},
		{"Google Translate", "https://translate.google.com", "常用工具", "谷歌翻译"},
		{"ChatGPT", "https://chat.openai.com", "常用工具", "AI 对话助手"},
		{"百度", "https://www.baidu.com", "常用工具", "中文搜索引擎"},
		{"必应", "https://www.bing.com", "常用工具", "微软搜索引擎"},
		{"DeepL", "https://www.deepl.com", "常用工具", "AI 翻译工具"},
		{"Grammarly", "https://www.grammarly.com", "常用工具", "英语语法检查"},
		{"Notion", "https://www.notion.so", "常用工具", "笔记与知识管理"},
		{"Obsidian", "https://obsidian.md", "常用工具", "本地笔记软件"},
		{"Todoist", "https://todoist.com", "常用工具", "任务管理工具"},
		{"Trello", "https://trello.com", "常用工具", "看板项目管理"},
		{"Evernote", "https://evernote.com", "常用工具", "印象笔记"},
		{"Dropbox", "https://www.dropbox.com", "常用工具", "云存储服务"},
		{"Google Drive", "https://drive.google.com", "常用工具", "谷歌云盘"},
		{"OneDrive", "https://onedrive.live.com", "常用工具", "微软云盘"},
		{"WeTransfer", "https://wetransfer.com", "常用工具", "大文件传输"},
		{"Speedtest", "https://www.speedtest.net", "常用工具", "网速测试"},
		{"TinyPNG", "https://tinypng.com", "常用工具", "图片压缩工具"},
		{"Remove.bg", "https://www.remove.bg", "常用工具", "AI 抠图工具"},
		{"Carbon", "https://carbon.now.sh", "常用工具", "代码截图美化"},
		// 开发工具 (25个)
		{"GitHub", "https://github.com", "开发工具", "全球最大的代码托管平台"},
		{"GitLab", "https://gitlab.com", "开发工具", "代码托管与 CI/CD"},
		{"Gitee", "https://gitee.com", "开发工具", "国产代码托管平台"},
		{"Stack Overflow", "https://stackoverflow.com", "开发工具", "开发者问答社区"},
		{"Vercel", "https://vercel.com", "开发工具", "前端部署平台"},
		{"Netlify", "https://www.netlify.com", "开发工具", "静态网站托管"},
		{"CodePen", "https://codepen.io", "开发工具", "前端代码演示"},
		{"JSFiddle", "https://jsfiddle.net", "开发工具", "在线代码编辑器"},
		{"Replit", "https://replit.com", "开发工具", "在线编程环境"},
		{"CodeSandbox", "https://codesandbox.io", "开发工具", "云端 IDE"},
		{"Postman", "https://www.postman.com", "开发工具", "API 测试工具"},
		{"Hoppscotch", "https://hoppscotch.io", "开发工具", "开源 API 客户端"},
		{"Docker Hub", "https://hub.docker.com", "开发工具", "Docker 镜像仓库"},
		{"NPM", "https://www.npmjs.com", "开发工具", "Node.js 包管理器"},
		{"Packagist", "https://packagist.org", "开发工具", "PHP 包仓库"},
		{"PyPI", "https://pypi.org", "开发工具", "Python 包仓库"},
		{"Maven Central", "https://search.maven.org", "开发工具", "Java 包仓库"},
		{"Crates.io", "https://crates.io", "开发工具", "Rust 包仓库"},
		{"Go Packages", "https://pkg.go.dev", "开发工具", "Go 包仓库"},
		{"Regex101", "https://regex101.com", "开发工具", "正则表达式测试"},
		{"JSON Crack", "https://jsoncrack.com", "开发工具", "JSON 可视化"},
		{"HTTPie", "https://httpie.io", "开发工具", "API 调试工具"},
		{"Insomnia", "https://insomnia.rest", "开发工具", "REST 客户端"},
		{"Sentry", "https://sentry.io", "开发工具", "错误监控平台"},
		{"Swagger", "https://swagger.io", "开发工具", "API 文档工具"},
		// 学习资源 (20个)
		{"MDN Web Docs", "https://developer.mozilla.org", "学习资源", "Web 技术权威文档"},
		{"知乎", "https://www.zhihu.com", "学习资源", "中文互联网问答社区"},
		{"掘金", "https://juejin.cn", "学习资源", "技术社区"},
		{"CSDN", "https://www.csdn.net", "学习资源", "IT 技术社区"},
		{"博客园", "https://www.cnblogs.com", "学习资源", "开发者博客平台"},
		{"InfoQ", "https://www.infoq.cn", "学习资源", "技术资讯平台"},
		{"GitBook", "https://www.gitbook.com", "学习资源", "文档托管平台"},
		{"Dev.to", "https://dev.to", "学习资源", "开发者社区"},
		{"Medium", "https://medium.com", "学习资源", "博客平台"},
		{"FreeCodeCamp", "https://www.freecodecamp.org", "学习资源", "免费编程学习"},
		{"W3Schools", "https://www.w3schools.com", "学习资源", "Web 技术教程"},
		{"菜鸟教程", "https://www.runoob.com", "学习资源", "编程入门教程"},
		{"廖雪峰官网", "https://www.liaoxuefeng.com", "学习资源", "Python/Git 教程"},
		{"极客时间", "https://time.geekbang.org", "学习资源", "IT 知识付费"},
		{"Coursera", "https://www.coursera.org", "学习资源", "在线课程平台"},
		{"edX", "https://www.edx.org", "学习资源", "大学课程在线"},
		{"Udemy", "https://www.udemy.com", "学习资源", "技能学习平台"},
		{"YouTube Learning", "https://www.youtube.com/learning", "学习资源", "视频学习"},
		{" Khan Academy", "https://www.khanacademy.org", "学习资源", "免费教育平台"},
		{"LeetCode", "https://leetcode.cn", "学习资源", "算法刷题平台"},
		// 娱乐休闲 (20个)
		{"V2EX", "https://www.v2ex.com", "娱乐休闲", "创意工作者社区"},
		{"YouTube", "https://www.youtube.com", "娱乐休闲", "视频分享平台"},
		{"Bilibili", "https://www.bilibili.com", "娱乐休闲", "哔哩哔哩弹幕视频网"},
		{"网易云音乐", "https://music.163.com", "娱乐休闲", "在线音乐平台"},
		{"QQ音乐", "https://y.qq.com", "娱乐休闲", "腾讯音乐平台"},
		{"Spotify", "https://www.spotify.com", "娱乐休闲", "全球音乐流媒体"},
		{"豆瓣", "https://www.douban.com", "娱乐休闲", "书影音社区"},
		{"小红书", "https://www.xiaohongshu.com", "娱乐休闲", "生活方式分享"},
		{"微博", "https://weibo.com", "娱乐休闲", "社交媒体平台"},
		{"Twitter", "https://twitter.com", "娱乐休闲", "推特社交"},
		{"Instagram", "https://www.instagram.com", "娱乐休闲", "图片分享社交"},
		{"TikTok", "https://www.tiktok.com", "娱乐休闲", "短视频平台"},
		{"抖音", "https://www.douyin.com", "娱乐休闲", "短视频平台"},
		{"快手", "https://www.kuaishou.com", "娱乐休闲", "短视频社区"},
		{"虎牙直播", "https://www.huya.com", "娱乐休闲", "游戏直播平台"},
		{"斗鱼直播", "https://www.douyu.com", "娱乐休闲", "游戏直播平台"},
		{"Twitch", "https://www.twitch.tv", "娱乐休闲", "游戏直播平台"},
		{"Steam", "https://store.steampowered.com", "娱乐休闲", "游戏平台"},
		{"Epic Games", "https://www.epicgames.com", "娱乐休闲", "游戏商店"},
		{"Nintendo", "https://www.nintendo.com", "娱乐休闲", "任天堂官网"},
		// 设计资源 (15个)
		{"Dribbble", "https://dribbble.com", "设计资源", "设计师作品展示平台"},
		{"Figma", "https://www.figma.com", "设计资源", "协作设计工具"},
		{"Sketch", "https://www.sketch.com", "设计资源", "Mac 设计软件"},
		{"Adobe Color", "https://color.adobe.com", "设计资源", "配色工具"},
		{"Coolors", "https://coolors.co", "设计资源", "配色方案生成"},
		{"Unsplash", "https://unsplash.com", "设计资源", "免费高清图片"},
		{"Pexels", "https://www.pexels.com", "设计资源", "免费素材图片"},
		{"Pixabay", "https://pixabay.com", "设计资源", "免费图片素材"},
		{"Iconfont", "https://www.iconfont.cn", "设计资源", "阿里巴巴图标库"},
		{"Flaticon", "https://www.flaticon.com", "设计资源", "免费图标素材"},
		{"Font Awesome", "https://fontawesome.com", "设计资源", "图标字体库"},
		{"Google Fonts", "https://fonts.google.com", "设计资源", "免费字体库"},
		{"Canva", "https://www.canva.com", "设计资源", "在线设计工具"},
		{"Photopea", "https://www.photopea.com", "设计资源", "免费在线 PS"},
		{"LottieFiles", "https://lottiefiles.com", "设计资源", "动画资源库"},
	}

	var tools []Tool
	for i, td := range toolData {
		tools = append(tools, Tool{
			id:      int64(i + 1),
			name:    td.name,
			url:     td.url,
			logo:    td.url + "/favicon.ico",
			catelog: td.catelog,
			desc:    td.desc,
			sort:    i + 1,
			hide:    false,
		})
	}

	return tools
}
