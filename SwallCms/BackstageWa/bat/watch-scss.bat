@echo off 
@echo  在IDE外启动, 无法监视间接文件的变化, 最好还是使用IDE的终端监视
%1(start /min cmd.exe /c %0 :& exit )
echo you code should go below
cd E:\so-do\Workspace\D\Reality\SwallCms\BackstageWa\wwwroot
sass --watch --no-source-map --load-path=external-core/custom-bootstrap5.2/scss   style/scss/index.scss:style/css/index.css ../Pages ../Shared
