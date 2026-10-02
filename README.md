# 橫向手機記分板

iPhone / Android 手機用的橫向記分板。

## 功能
- 左 / 前 / 右 三區記分
- 每區可單獨清除
- 一底預設 200
- 一台預設 50
- 底數 / 台數加減
- 自動計算各區金額
- 自動計算總計
- localStorage 自動保存
- Screen Wake Lock 螢幕常亮
- 全螢幕模式
- 嘗試鎖定橫向
- PWA，可加入 iPhone 主畫面
- GitHub Pages 自動部署

## 第一次部署

1. 在 GitHub 建立一個新的 Public Repository，例如：
   `mobile-scoreboard`

2. 將本專案內的所有檔案上傳到 Repository 的 `main` branch。
   注意 `.github/workflows/pages.yml` 也要一起上傳。

3. 進入：
   `Settings → Pages`

4. 在 `Build and deployment` 的 Source 選擇：
   `GitHub Actions`

5. 到：
   `Actions`
   等 `Deploy Scoreboard to GitHub Pages` 完成。

6. 網址通常會是：
   `https://你的GitHub帳號.github.io/mobile-scoreboard/`

## iPhone 建議使用方式

1. 用 Safari 開啟 GitHub Pages 網址。
2. 按 Safari 分享按鈕。
3. 選「加入主畫面」。
4. 從主畫面開啟記分板。
5. 關閉 iPhone「直向鎖定」。
6. 橫拿手機使用。

## 注意

iOS 對網頁強制鎖定橫向與全螢幕有系統限制，因此 PWA 會盡可能提供 App 化體驗，
但實際是否能由網頁強制旋轉，仍依 iOS / Safari 版本而定。
