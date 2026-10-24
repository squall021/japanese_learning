# Project workflow

- The user requests recoverable checkpoints. Before a substantial change, inspect git status and preserve existing work, then create a unique annotated `checkpoint-YYYYMMDD-HHMM-description` tag at the current stable commit.
- Never overwrite a checkpoint, force-push shared history, or discard uncommitted user changes.
- Primary repository: `https://github.com/squall021/japanese_learning.git`, branch `main`. Hosting: GitHub Pages, deployed from `dist/` by `.github/workflows/pages.yml`.
- `.openai/hosting.json` retains the original Sites identity for recovery. Do not deploy to Sites unless the user requests that target.
- Validate with `npm run check` and `npm test` before publishing. Preserve KanjiVG attribution and the pinned source revision when working on stroke data.
- For user-authorized updates, push the checkpoint along with the change. Create annotated version tags for stable releases and record changes and verification.
- See `RESTORE.md` for restoration. Browser learning progress is separate from Git and must be exported through the app.
