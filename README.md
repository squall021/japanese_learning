# 日和日語

繁體中文的日文入門學習網站，原生 HTML/CSS/JavaScript，無框架與建置依賴。

## 網站與版本

- 線上網站：https://squall021.github.io/japanese_learning/
- 原始碼：https://github.com/squall021/japanese_learning
- 儲存點與回復方式：[RESTORE.md](RESTORE.md)
- 原 Sites 部署資訊保留在 `.openai/hosting.json`，目前發布目標為 GitHub Pages。

推送至 `main` 會由 GitHub Actions 自動檢查並發布 `dist/`。也可在 Actions 的 `Deploy Japanese Learning` 手動指定儲存點標籤，重新發布舊版。

搬移網址後，先在舊網站「我的學習」匯出進度，再於新網站匯入，才能帶入原本的本機學習紀錄。

## 啟動

在此目錄執行 `node server.mjs`，瀏覽 http://127.0.0.1:5180 。靜態網站內容位於 `dist/`，可直接部署。

執行檢查：`npm run check` 與 `npm test`。不需要安裝 npm 套件。

## 功能

- 平假名、片假名、濁音、半濁音、拗音，點擊發音與每行五題聽音測驗。
- 92 個基本假名手寫練習：逐筆動畫、暫停、慢速、描寫、自由書寫、復原、清空、筆跡重播、並排與疊合對照。
- 點選假名字卡後，可在「聽發音」旁直接進入該字手寫。五十音頁的「繼續上次手寫」分別記住平假名與片假名最後開啟的字（含寫字板內切換），重新載入或匯入進度後也能接續；初次使用從「あ／ア」開始。
- 描寫與自由書寫的完成次數分開保存並包含於進度匯出。關閉寫字板後清除本次筆跡，不將描寫當作熟練判定。
- 五個情境課程、對話、詞語卡、可點擊句型拆解、選擇／聽力／輸入練習。
- 全域振假名設定、收藏、瀏覽器本機進度、JSON 匯出與經確認後匯入。
- 簡易間隔複習：還不熟加入本次隊尾並保留近期到期；想了一下較短間隔；記得逐步延長間隔。
- Web Speech API 日文合成語音，支援聲音選擇、速度選擇、播放狀態與無日文聲音提示。

## 語音與資料

需要瀏覽器與作業系統提供日文合成語音。網站不以其他語言聲音冒充日語。可能需要先安裝作業系統日文語音；聲音是否由本機或網路合成取決於裝置供應商。沒有後端帳戶與跨裝置同步。進度保存在 `localStorage` 的 `hiyori-v1`；不同網站來源分開保存，清除瀏覽器資料前請匯出。

課程內容與拆解為靜態教材。手寫目前涵蓋 46 個基本平假名及 46 個基本片假名；濁音、半濁音、拗音與小寫假名暫不提供手寫範本。筆畫數提示不是字形正確度評分。尚未包含口型影片、AI 對話、錄音評分或任意文章自動分析。網站字型由 Google Fonts 載入，無法連線時使用系統後備字型。

## 手寫資料來源

逐筆路徑使用 [KanjiVG](https://kanjivg.tagaini.net/) 固定版本 `70a0b7ae0c18ceb5cb358274b029cce0234a43bc`，© Ulrich Apel and contributors，依 CC BY-SA 3.0 提供。
原始 SVG 與來源說明保存在 [dist/vendor/kanjivg/CREDITS.md](dist/vendor/kanjivg/CREDITS.md)，由 `python scripts/import-kana-strokes.py` 產生筆順資料。

筆跡使用正規化座標與每筆時間點，在當次練習中支援重播與復原。滑鼠、手指與觸控筆共用 Pointer Events；只有寫字板本身攔截觸控捲動。

