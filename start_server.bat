@echo off
chcp 65001 > nul
setlocal
cd /d "%~dp0"

set "LOCAL_IP="
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "$c=Get-NetIPConfiguration ^| Where-Object { $_.IPv4DefaultGateway -ne $null -and $_.NetAdapter.Status -eq 'Up' } ^| Select-Object -First 1; if($c){$c.IPv4Address.IPAddress}"`) do set "LOCAL_IP=%%I"

echo.
echo ========================================
echo   GO！むらっぴ ローカルサーバー
echo ========================================
echo PCで開くURL:
echo   http://localhost:8080
echo.
if defined LOCAL_IP (
  echo スマートフォンで開くURL:
  echo   http://%LOCAL_IP%:8080
) else (
  echo PCのIPアドレスを自動取得できませんでした。
  echo ipconfig を実行し、IPv4アドレスを確認してください。
)
echo.
echo スマートフォンとPCを同じWi-Fiへ接続してください。
echo Windowsファイアウォールの確認が出たら「プライベート ネットワーク」を許可してください。
echo 終了する場合は、この画面で Ctrl+C を押してください。
echo.

where py >nul 2>nul
if not errorlevel 1 (
  py -3 -m http.server 8080 --bind 0.0.0.0
  goto :end
)

where python >nul 2>nul
if not errorlevel 1 (
  python -m http.server 8080 --bind 0.0.0.0
  goto :end
)

echo Pythonを起動できませんでした。
echo Python 3をインストールするか、HTTPS対応のWebサーバーへ配置してください。
pause

:end
endlocal
