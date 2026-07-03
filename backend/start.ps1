<#
.SYNOPSIS
    Rylum 后端服务一键启动脚本

.DESCRIPTION
    自动检查环境、安装依赖并启动后端服务

.EXAMPLE
    .\start.ps1
#>

param()

# 设置控制台编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "          Rylum 后端服务启动脚本" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js 是否安装
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js not found"
    }
    Write-Host "[信息] Node.js 版本: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "[错误] 未检测到 Node.js，请先安装 Node.js" -ForegroundColor Red
    Write-Host "        下载地址: https://nodejs.org/" -ForegroundColor Red
    Read-Host "按 Enter 键退出..."
    exit 1
}

# 切换到脚本所在目录
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptPath

# 检查是否存在 server.js
if (-not (Test-Path "server.js")) {
    Write-Host "[错误] 未找到 server.js 文件" -ForegroundColor Red
    Read-Host "按 Enter 键退出..."
    exit 1
}

# 检查并安装依赖
if (-not (Test-Path "..\node_modules")) {
    Write-Host "[信息] 正在安装依赖..." -ForegroundColor Yellow
    Set-Location ".."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[错误] 依赖安装失败" -ForegroundColor Red
        Read-Host "按 Enter 键退出..."
        exit 1
    }
    Set-Location $scriptPath
}

Write-Host "[信息] 正在启动后端服务..." -ForegroundColor Yellow
Write-Host "[信息] 服务地址: http://localhost:3000" -ForegroundColor Green
Write-Host "[信息] 按 Ctrl+C 停止服务" -ForegroundColor Yellow
Write-Host ""

# 启动服务
node server.js