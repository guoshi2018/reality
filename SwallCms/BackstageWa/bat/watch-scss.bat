@echo off 
@echo  ��IDE������, �޷����Ӽ���ļ��ı仯, ��û���ʹ��IDE���ն˼���
%1(start /min cmd.exe /c %0 :& exit )
echo you code should go below
cd E:\so-do\Workspace\D\Reality\SwallCms\BackstageWa\wwwroot
sass --watch --no-source-map --load-path=external-core/custom-bootstrap5.2/scss   style/scss/index.scss:style/css/index.css ../Pages ../Shared
