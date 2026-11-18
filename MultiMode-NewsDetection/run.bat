@echo off
echo 启动 Flask 后端...
start cmd /k python api.py

timeout /t 3 >nul

echo 打开前端 popup.html 页面...
start chrome "file:///C:\Users\DELL\Desktop\xinan\MultiMode-NewsDetection\popup.html"
