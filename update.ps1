$git = ".\mingit\cmd\git.exe"
& $git add -A
& $git commit -m "Fix Vercel build: Remove package.json to disable custom build step"
& $git push origin main
