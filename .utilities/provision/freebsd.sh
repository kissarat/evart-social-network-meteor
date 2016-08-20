#!/usr/bin/env sh

pkg update
pkg install -y postgresql95-server curl bash ca_root_nss curl expat gettext-runtime git-lite gmake indexinfo libevent2 libffi mongodb node npm pcre perl5 python2 python27 snappy v8
if [ ! -d /usr/local/pgsql/data ]; then
    echo 'postgresql_enable="YES"' >> /etc/rc.conf
    /usr/local/etc/rc.d/postgresql initdb
    /usr/local/etc/rc.d/postgresql start
fi
if [ ! -f /usr/local/bin/meteor ]; then
    cd /tmp
    git clone https://github.com/yonas/meteor-freebsd.git
    sudo mv meteor-freebsd /usr/local/share/meteor
    sudo ln -s /usr/local/share/meteor/meteor /usr/local/bin/meteor
fi
