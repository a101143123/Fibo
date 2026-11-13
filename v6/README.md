# Fibo Pro 6.0 Alpha（隔離開發版）
- 原版 4.0：根目錄 index.html，**未修改**。
- 5.0：v5/index.html，**未修改**。
- 6.0：v6/index.html，新增 CSV 驗證、確認型 Pivot、Fibonacci、簡化 VCP、風險部位計算與 4.0 內嵌。
- 只在 fibo-pro-6 分支開發，尚未合併至 main，也未部署 Cloudflare Workers / D1。
- CSV 欄位：Date,Open,High,Low,Close,Volume；ISO 日期，至少 65 根有效日 K。簡易 CSV 解析不支援含逗號的引號欄位。
- VCP 僅為簡化三段區間振幅與均量條件，非原專案完整演算法；CANSLIM、全市場掃描、AI API、D1、回測尚未實作。
- 原版 4.0 功能是否完整仍需在目標瀏覽器做回歸測試。禁止用示範資料宣稱實際交易訊號。
- 本工具為研究用途，並非投資建議。
