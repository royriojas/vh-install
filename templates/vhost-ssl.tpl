<VirtualHost *:443>
  SSLEngine on
  ServerName {{= it.serverName }}
  SSLCertificateKeyFile {{= it.sslServerKeyFile }}
  SSLCertificateFile {{= it.sslCertificateFile }}

  DocumentRoot {{= it.documentRoot }}
  <Directory "{{= it.documentRoot }}">
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

</VirtualHost>



