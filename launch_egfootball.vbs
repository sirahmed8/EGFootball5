' ==============================================================================
' EGFootball5 - Silent Background Dev Server & Desktop Web App Launcher
' ==============================================================================
Option Explicit

Dim WshShell, fso, currentDir, targetUrl
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

currentDir = fso.GetParentFolderName(WScript.ScriptFullName)
targetUrl = "http://localhost:3000"

' Function to probe if local server is already responding
Function IsUrlReady(probeUrl)
    On Error Resume Next
    Dim http
    Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    http.open "GET", probeUrl, False
    http.setTimeouts 200, 200, 200, 200
    http.send
    If Err.Number = 0 Then
        IsUrlReady = True
    Else
        IsUrlReady = False
    End If
    On Error GoTo 0
End Function

' If port 3000, 3001, or 3002 is already active, open browser immediately and exit
If IsUrlReady("http://127.0.0.1:3000") Then
    WshShell.Run "http://localhost:3000", 1, False
    WScript.Quit
ElseIf IsUrlReady("http://127.0.0.1:3001") Then
    WshShell.Run "http://localhost:3001", 1, False
    WScript.Quit
ElseIf IsUrlReady("http://127.0.0.1:3002") Then
    WshShell.Run "http://localhost:3002", 1, False
    WScript.Quit
End If

' Start npm run dev completely silently in the background (0 = vbHide)
WshShell.CurrentDirectory = currentDir
WshShell.Run "cmd.exe /c npm run dev", 0, False

' Poll until server becomes ready (up to 30 seconds, 300ms intervals)
Dim i, ready
ready = False

For i = 1 To 60
    WScript.Sleep 300
    If IsUrlReady("http://127.0.0.1:3000") Then
        targetUrl = "http://localhost:3000"
        ready = True
        Exit For
    ElseIf IsUrlReady("http://127.0.0.1:3001") Then
        targetUrl = "http://localhost:3001"
        ready = True
        Exit For
    ElseIf IsUrlReady("http://127.0.0.1:3002") Then
        targetUrl = "http://localhost:3002"
        ready = True
        Exit For
    End If
Next

' Launch the browser to the application
WshShell.Run targetUrl, 1, False
