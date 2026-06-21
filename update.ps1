$git = ".\mingit\cmd\git.exe"
& $git add -A
& $git commit -m "Fix Vercel deployment: Remove server.js and test scripts to force static site build"
& $git push origin main
