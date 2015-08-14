# vh-install

Easy setup of development virtual hosts under OSx.

TODO:

- support other *nix environments
- support windows?
- proper cli with help and version (use clix?)
- add unit tests

## Install

    npm i -g vh-install

## Usage

    # create a virtual host "some.domain.com" with document root /path/to/some/document/root
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

## Examples

    # create a virtual host "some.domain.com" with document root relative to the current execution folder ./document/root
    sudo vh-install -d ./document/root -h some.domain.com

    # create a virtual host "some.domain.com" with document root relative to the current execution folder ./document/root
    sudo vh-install -d ./document/root -h some.domain.com

    # create a virtual host "some.domain.com" with document root relative to the current execution folder ./document/root
    # --ssl makes the parameters --ssl-cert and --ssl-key mandatory. If any of them is missing a prompt message will appear.
    # the path could be either relative or absolute
    sudo vh-install -d ./document/root -h some.domain.com --ssl --ssl-key ./apache-conf/server.key --ssl-cert ./apache-conf/server.crt

    # create a virtual host "some.domain.com" with document root relative to the current execution folder ./document/root in linux
    sudo vh-install -d ./document/root -h some.domain.com

    # Just show what actions will the command do with the --dry-run parameter
    sudo vh-install -d ./document/root -h some.domain.com --dry-run
    sudo vh-install -d ./document/root -h some.domain.com --ssl --dry-run --ssl-key ./apache-conf/server.key --ssl-cert ./apache-conf/server.crt


if `--ssl` option is specified then the following vhost will be added to `/etc/apache2/extra/httpd-ssl.conf`

   <VirtualHost *:443>
     SSLEngine on
     ServerName some.domain.com
     SSLCertificateKeyFile /resolved/path/to/apache-conf/server.key
     SSLCertificateFile /resolved/path/to/apache-conf/server.crt

      DocumentRoot /resolve/path/to/some/document/root
      <Directory "/resolve/path/to/some/document/root">
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

     ErrorLog /var/log/apache2/some.domain.com_error.log
     LogLevel warn
     CustomLog /var/log/apache2/some.domain.com_access.log combined

     KeepAlive On
     KeepAliveTimeout 2

   </VirtualHost>

~~Do not forget to restart apache~~ ** Apache is now restarted from within the script

In linux platforms a virtual host file will be created inside the `/etc/apache2/sites-available/` folder and `a2ensite` will be called to add it.

if `--dry-run` is specified then nothing will be actually executed and the commands will be printed to the stdout.

## License

[MIT](./LICENSE)

## Changelog

[Changelog](./changelog.md)

