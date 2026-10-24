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

標籤固定指向當時版本，不移動、不覆蓋。GitHub Releases 可下載對應原始碼。

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
git restore --source v1.0.0-github --staged --worktree -- dist package.json verify.mjs verify-handwriting.mjs
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
