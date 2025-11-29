@echo off
cd /d "c:\Users\Lintar\Downloads\nataruTraffic"
echo Starting > log_debug.txt
git --version >> log_debug.txt 2>&1
git init >> log_debug.txt 2>&1
git add . >> log_debug.txt 2>&1
git commit -m "Initial commit" >> log_debug.txt 2>&1
git branch -M main >> log_debug.txt 2>&1
git remote remove origin >> log_debug.txt 2>&1
git remote add origin https://github.com/Lfridyans/testapps.git >> log_debug.txt 2>&1
git push -u origin main >> log_debug.txt 2>&1
echo Done >> log_debug.txt
