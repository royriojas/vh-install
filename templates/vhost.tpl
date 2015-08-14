<VirtualHost *:80>

  ServerName {{= it.serverName }}

  DocumentRoot {{= it.documentRoot }}
  <Directory "{{= it.documentRoot }}">
    Require all granted
    AllowOverride All
    Allow from All
  </Directory>

  <IfModule mime_module>
    AddType application/json .json
    AddType video/mp4 .mp4
    AddType video/webm .webm
    AddType video/ogg .ogg
    AddType audio/mp4 .m4a
    AddType audio/mpeg .mp3
  </IfModule>

  ErrorLog {{= it.errorLog }}
  LogLevel warn
  CustomLog {{= it.accessLog }} combined

  KeepAlive On
  KeepAliveTimeout 2

</VirtualHost>

