# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure('2') do |config|
  os = 'freebsd'
  if 'freebsd' == os
    config.vm.box = 'freebsd/FreeBSD-10.2-STABLE'
    config.vm.network 'private_network', type: 'dhcp', ip: '10.0.0.1'
    config.vm.synced_folder '.', '/vagrant', type: 'nfs'
    config.ssh.shell = 'sh'
  else
    config.vm.box = 'debian/jessie64'
    config.ssh.shell = 'bash'
  end
  # config.vm.box_check_update = false
  config.vm.network 'forwarded_port', guest: 3000, host: 13000
  # config.vm.network 'public_network'
  config.vm.provider 'virtualbox' do |box|
    box.name = 'evart-' + os
    box.memory = '512'
    box.cpus = 1
  end
  # config.push.define 'atlas' do |push|
  #   push.app = 'YOUR_ATLAS_USERNAME/YOUR_APPLICATION_NAME'
  # end

  script = '.utilities/provision/' + os + '.sh'
  config.vm.provision 'shell', path: script, privileged: true
end
