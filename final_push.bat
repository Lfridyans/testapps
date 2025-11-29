@echo off
cd /d "c:\Users\Lintar\Downloads\nataruTraffic"
echo Cleaning up old git... > push_log.txt
rmdir /s /q .git >> push_log.txt 2>&1
echo Initializing new git... >> push_log.txt
git init >> push_log.txt 2>&1
git add . >> push_log.txt 2>&1
echo Unstaging sensitive/temp files... >> push_log.txt
git reset final_push.bat push_to_github.bat log_debug.txt push_log.txt >> push_log.txt 2>&1
echo Committing... >> push_log.txt
git commit -m "Initial commit" >> push_log.txt 2>&1
git branch -M main >> push_log.txt 2>&1
echo Adding remote... >> push_log.txt
git remote add origin https://github.com/Lfridyans/testapps.git >> push_log.txt 2>&1
echo Pushing... >> push_log.txt
git push -u origin main >> push_log.txt 2>&1
echo Done >> push_log.txt
