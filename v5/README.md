# Fibo Pro 5.0 開發說明
- 既有 4.0 保留在根目錄 `index.html`，5.0 預覽位於 `v5/index.html`。
- 5.0 第一階段：多股票掃描、自選股（瀏覽器 localStorage）、沿用 4.0 單股分析。
- 行情依賴既有 `fibo-api.a101143123.workers.dev`；API 若無資料則顯示錯誤，不使用合成資料。
- D1 schema 見 `v5/schema.sql`，**尚未建立 D1 或執行遷移**。
- AI 模組尚未串接，未宣稱提供 AI 投資建議。
- 目前掃描以單一瀏覽器逐檔呼叫 API，適合少量標的測試；全市場掃描需排程批次、限流、D1 快取與錯誤監控。
- Cloudflare Workers 的部署、D1 binding、密鑰與排程須另外設定。
