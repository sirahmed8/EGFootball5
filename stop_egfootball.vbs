' ==============================================================================
' EGFootball5 - Stop Background Dev Server
' ==============================================================================
Option Explicit

Dim WshShell
Set WshShell = CreateObject("WScript.Shell")

' Terminate any process holding port 3000, 3001, or 3002 silently
WshShell.Run "powershell.exe -NoProfile -WindowStyle Hidden -Command ""(Get-NetTCPConnection -LocalPort 3000, 3001, 3002 -ErrorAction SilentlyContinue).OwningProcess | Sort-Object -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }""", 0, True

' Display brief confirmation popup (auto-closes after 3 seconds)
WshShell.Popup "EGFootball5 development server has been stopped.", 3, "EGFootball5 Server", 64
