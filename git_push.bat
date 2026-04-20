@echo off
echo ================================================
echo  Dance Directory - Git Sync and Push
echo ================================================
cd /d "%~dp0"
echo Working in: %CD%

echo.
echo [1/7] Removing stale git lock files...
if exist .git\index.lock (del /f .git\index.lock && echo   Deleted index.lock)
if exist .git\HEAD.lock (del /f .git\HEAD.lock && echo   Deleted HEAD.lock)
if exist .git\config.lock (del /f .git\config.lock && echo   Deleted config.lock)

echo.
echo [2/7] Backing up our new/modified files to TEMP...
md "%TEMP%\dance_backup_2026" 2>nul
copy /y "app\sitemap.ts" "%TEMP%\dance_backup_2026\sitemap.ts" >nul
copy /y "app\api\stripe\webhook\route.ts" "%TEMP%\dance_backup_2026\webhook_route.ts" >nul
copy /y "app\studios\city\[city]\page.tsx" "%TEMP%\dance_backup_2026\city_page.tsx" >nul
copy /y "app\studios\[slug]\page.tsx" "%TEMP%\dance_backup_2026\slug_page.tsx" >nul
copy /y "docs\architecture.html" "%TEMP%\dance_backup_2026\architecture.html" >nul
copy /y "app\competitions\[slug]\page.tsx" "%TEMP%\dance_backup_2026\comp_slug_page.tsx" >nul
copy /y "scripts\generate-descriptions.ts" "%TEMP%\dance_backup_2026\generate-descriptions.ts" >nul
echo   Files backed up to %TEMP%\dance_backup_2026\

echo.
echo [3/7] Fetching latest from GitHub...
git fetch origin
if %ERRORLEVEL% neq 0 (echo ERROR: git fetch failed & pause & exit /b 1)

echo.
echo [4/7] Resetting working tree to origin/main...
git reset --hard origin/main
if %ERRORLEVEL% neq 0 (echo ERROR: git reset failed & pause & exit /b 1)

echo.
echo [5/7] Restoring our modifications on top of origin/main...
copy /y "%TEMP%\dance_backup_2026\sitemap.ts" "app\sitemap.ts" >nul && echo   Restored sitemap.ts
copy /y "%TEMP%\dance_backup_2026\webhook_route.ts" "app\api\stripe\webhook\route.ts" >nul && echo   Restored webhook route
copy /y "%TEMP%\dance_backup_2026\city_page.tsx" "app\studios\city\[city]\page.tsx" >nul && echo   Restored city page
copy /y "%TEMP%\dance_backup_2026\slug_page.tsx" "app\studios\[slug]\page.tsx" >nul && echo   Restored studio detail page
copy /y "%TEMP%\dance_backup_2026\architecture.html" "docs\architecture.html" >nul && echo   Restored architecture.html
copy /y "%TEMP%\dance_backup_2026\comp_slug_page.tsx" "app\competitions\[slug]\page.tsx" >nul && echo   Restored competition detail page (Event schema fix)
copy /y "%TEMP%\dance_backup_2026\generate-descriptions.ts" "scripts\generate-descriptions.ts" >nul && echo   Restored generate-descriptions.ts
echo   New city x style page already in place

echo.
echo [6/7] Staging our changes...
git add "app/studios/city/[city]/[style]/page.tsx"
git add "app/sitemap.ts"
git add "app/studios/city/[city]/page.tsx"
git add "app/studios/[slug]/page.tsx"
git add "app/api/stripe/webhook/route.ts"
git add "docs/architecture.html"
git add "app/competitions/[slug]/page.tsx"
git add "scripts/generate-descriptions.ts"
echo.
git status --short

echo.
echo [7/7] Committing and pushing to GitHub...
git commit -m "feat: city x style SEO pages, style linking, GHL cancel webhook, Event schema fix, description generator"
if %ERRORLEVEL% neq 0 (echo ERROR: git commit failed & pause & exit /b 1)
git push
if %ERRORLEVEL% neq 0 (echo ERROR: git push failed & pause & exit /b 1)

echo.
echo ================================================
echo  SUCCESS! All changes pushed to GitHub.
echo ================================================
pause
