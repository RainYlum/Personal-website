@echo off
chcp 65001 >nul
title Rylum Backend Server

echo ==============================================
echo          Rylum 后端服务启动脚本
echo ==============================================
echo.

:: 检查 Node.js 是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo        下载地址: https://nodejs.org/
    pause
    exit /b 1
)

:: 检查是否在 backend 目录
cd /d "%~dp0"

:: 检查是否存在 server.js
if not exist "server.js" (
    echo [错误] 未找到 server.js 文件
    pause
    exit /b 1
)

:: 检查并安装依赖
if not exist "..\node_modules" (
    echo [信息] 正在安装依赖...
    cd ..
    npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
    cd backend
)

echo [信息] 正在启动后端服务...
echo [信息] 服务地址: http://localhost:3000
echo [信息] 按 Ctrl+C 停止服务
echo.

node server.js

pause