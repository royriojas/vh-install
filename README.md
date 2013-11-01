vhost-install
=============

Easy setup of development virtual hosts under OSx. 

# Usage


    sudo vh-install -d /path/to/some/document/root -h some.domain.com


This will add the following to the */etc/apache2/extra/httpd-vhosts.conf* file
 
    <VirtualHost *:80>

      ServerName some.domain.com

      DocumentRoot /path/to/some/document/root
      <Directory "/path/to/some/document/root">
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

      ErrorLog /var/log/apache2/some.domain.com_error.log
      LogLevel warn
      CustomLog /var/log/apache2/some.domain.com_access.log combined

      KeepAlive On
      KeepAliveTimeout 2

    </VirtualHost>

and add the following entry to your */etc/hosts*

    127.0.0.1 some.domain.com
    
    
