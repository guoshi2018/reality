@echo off
%1(start /min cmd.exe /c %0 :& exit )
echo you code should go below
cd E:\so-do\Workspace\D\Reality\SwallCms\BackstageWa\wwwroot
tsc -W
