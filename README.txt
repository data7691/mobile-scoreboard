橫向手機記分板 - 第一版

功能：
- 左 / 前 / 右 三區記分
- 左 / 前 / 右可各自單獨清除，不影響其他兩家
- 一底預設 200、一台預設 50，可直接調整
- 每區底數 / 台數 + -
- 自動計算各區金額與總計
- 自動保存目前數據（localStorage）
- 第一次觸控後嘗試進入全螢幕
- 支援時鎖定 landscape 橫向
- 使用 Screen Wake Lock API 保持螢幕常亮
- 回到前景後重新取得 Wake Lock
- PWA manifest + service worker，可加入主畫面

使用方式：
1. 將整個資料夾放到 HTTPS 網站或本機開發伺服器。
2. 手機用 Chrome / Edge / Safari 開啟。
3. 第一次點擊畫面後，瀏覽器會嘗試進入全螢幕與鎖定橫向。
4. Wake Lock 通常要求 HTTPS。
5. iPhone / iOS 對 fullscreen 與 orientation lock 的支援受 Safari 版本限制；
   加到主畫面後以 PWA 開啟，體驗通常會比較接近 App。

注意：
- 單純 file:// 直接開 HTML 時，Service Worker / Wake Lock 可能被瀏覽器限制。
- 建議部署 HTTPS。
