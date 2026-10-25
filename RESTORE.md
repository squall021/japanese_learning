# 儲存點與回復

儲存庫：https://github.com/squall021/japanese_learning

網站：https://squall021.github.io/japanese_learning/

## 已建立的儲存點

| 標籤 | 用途 |
| --- | --- |
| `checkpoint-before-github-2026-10-24` | 搬移前的第一版，commit `f314ca6bdec80877663357e3875d5256808e82c1` |
| `v1.0.0-github` | GitHub 首次上線版，包含自動檢查、發布工作流程與回復說明 |
| `checkpoint-20261024-before-handwriting` | 加入手寫練習前的穩定版本，commit `b5984a764988e2e4d574bd726242f0912c91f31e` |
| `v1.1.0` | 92 個基本假名手寫練習版，含筆順動畫、描寫、自由書寫、筆跡對照與獨立進度 |
| `checkpoint-20261024-1751-before-writing-resume` | 調整字卡手寫入口與接續功能前的 v1.1.0 |
| `v1.1.1` | 字卡直接手寫入口更清楚，平假名與片假名各自接續最後練習的字 |
| `checkpoint-20261024-1807-before-particles` | 加入助詞教學前的 v1.1.1 |
| `v1.2.0` | 六堂助詞課、情境練習、混合測驗與依用法安排的易錯複習 |
| `checkpoint-20261024-2252-before-variations` | 加入句型變化練習前的 v1.2.0 |
| `v1.3.0` | 299 種句型變化組合、六課與單課加強、近期避重複及變化題複習 |
| `checkpoint-20261025-0958-before-grammar` | 加入基礎文法教學前的 v1.3.0 |
| `v1.4.0` | 三堂基礎文法、9 組點擊拆句例句、18 題選答／組句／句尾變換與概念複習 |
| `checkpoint-20261025-1137-before-grammar-part-two` | 加入動詞與形容詞後三堂課前的 v1.4.0 |
| `v1.5.0` | 六堂基礎文法、18 組拆句例句、36 題練習與十二個概念複習 |
| `checkpoint-20261025-2141-before-verb-foundations` | 加入第 7～9 課動詞圖解與分步活用前的 v1.5.0 |
| `v1.6.0` | 九堂文法、動詞分類／ます形／ない形、21 個動詞圖說與分步活用 |
| `checkpoint-20261025-2218-before-te-lessons` | 加入第 10～12 課前的 v1.6.0 |
| `v1.7.0` | 十二堂文法、て形／てください／ています、24 動詞與語境時間圖 |

標籤固定指向當時版本，不移動、不覆蓋。GitHub Releases 可下載對應原始碼。

v1.3.0 已通過全部語法與學習流程檢查，包括 299 種組合的完整性、抽題分配、近期避重複、舊備份相容、答題紀錄與用法複習。另以桌面與 390px 手機版瀏覽器驗證六題作答、單課重練、生詞提示、多重答案與重新載入後的錯題紀錄。

v1.4.0 檢查涵蓋三堂文法課、9 組拆句例句與 18 題練習、合理的否定替代答案、詞塊移回與重排、未完成／重複提交防護、六題結算、概念排程與備份相容；原有五十音、92 字手寫、情境課程、助詞及 299 種變化題的檢查一併執行。另以桌面及 390px 手機版實測拆句、否定句六題作答、組句與句尾變換，以及重新載入後的完成分數與易錯紀錄。

v1.5.0 檢查擴充至六課 36 題，涵蓋動詞肯定／否定與過去、い／な形容詞的合理否定答案、可替換語序、標音與答案重點標示、六課均衡抽題、十二個概念與舊備份相容。全部既有檢查一併執行；桌面與 390px 手機版驗證拆句、形容詞六題作答、完整答案及重新載入後的完成成績與易錯紀錄。

v1.6.0 檢查涵蓋九課 54 題、21 個動詞與 189 個圖解狀態、九種五段字尾、特殊否定及来る讀音、分類／變化分開保存、分步提交防護、九課均衡抽題與舊備份相容。另以瀏覽器實測圖解切換、第 8 課六題結算與重新載入後的成績，並讀取桌面及手機版的實際內容寬度確認無水平溢位。本次截圖工具逾時，未完成圖片形式的目視核對。

v1.7.0 已通過全部語法與七組自動檢查，涵蓋十二課 72 題、24 動詞的て形及行く／来る例外、限定的請求與ています搭配、進行／習慣／結果時間圖、分步作答與舊備份相容。另實測第 12 課完整六題、錯題回饋與重載成績，以及請求組句。桌面與 390px 手機版完成目視及尺寸檢查，截圖工具已恢復；預覽保存於工作區。

## 方法一：在 GitHub 重新發布儲存點

1. 進入儲存庫 **Actions → Deploy Japanese Learning**。
2. 按 **Run workflow**，分支保持 `main`。
3. 在 `restore_ref` 填入 `v1.0.0-github` 或其他已建立的標籤。
4. 執行並等候 `verify` 與 `deploy` 成功。

這會更新線上網站，但不改寫 main 的程式碼歷史。之後推送 main 會重新發布 main 的內容。若要讓回復結果成為往後開發基礎，使用方法二。

## 方法二：回復網站內容，建立新的提交

先確認 `git status` 沒有未保存的修改；若有，先提交或備份。

```sh
git switch main
git pull --ff-only origin main
git fetch origin --tags
git tag -a checkpoint-before-restore-YYYYMMDD-HHMM -m "Checkpoint before restore"
git push origin checkpoint-before-restore-YYYYMMDD-HHMM
git restore --source v1.0.0-github --staged --worktree -- dist package.json verify.mjs verify-handwriting.mjs verify-particles.mjs verify-variations.mjs verify-grammar.mjs verify-verbs.mjs verify-te.mjs
node --check dist/app.js
node --check dist/data.js
node verify.mjs
git commit -m "Restore website to v1.0.0-github"
git push origin main
```

將時間佔位字換成當下唯一名稱。此流程保留歷史與部署設定，同時回復網站 `dist/` 與該版本的檢查程式，避免新檢查依賴舊版沒有的模組；檢查失敗時先處理版本相容問題再發布。

需要整個舊版原始碼進行比較，可執行 `git switch -c inspect-v1 v1.0.0-github`，回到開發則執行 `git switch main`。不要使用 `reset --hard` 或強制推送回復共用的 main。

## 後續變更慣例

- 重要變更前：保存既有修改，建立唯一的 `checkpoint-YYYYMMDD-HHMM-description` annotated tag。
- 功能完成且檢查通過後：建立 commit；穩定版本使用遞增版本號，例如 `v1.1.0`。
- 推送本次提交與指定標籤，避免儲存點只存在本機。
- Release 說明記錄改動、檢查結果與前一個可回復版本。

## 學習進度另行備份

Git 保存網站程式和教材。課程進度、收藏、複習紀錄保存在瀏覽器，需要用網站「我的學習 → 匯出進度」另外備份。

Sites 與 GitHub Pages 是不同網站來源。先在舊網址匯出，再到新網址匯入，即可搬移學習紀錄。
