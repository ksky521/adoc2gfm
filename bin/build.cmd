@echo off


goto File



:File
REM 判断文件类型
set FILE_TYPE=%~x1
for %%i in (.text .txt ) do (if "%FILE_TYPE%"=="%%i" goto Compress)


:Compress
"node.exe" "%~dp0adoc2gfm" "%~n1%~x1"  "%~n1.md"
goto End


:End
pause
