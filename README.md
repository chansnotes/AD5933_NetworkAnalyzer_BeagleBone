# Complete guide of using NetworkAnalyzerBone
## Setting up BeagleBone
##### What you need
* BeagleBone Rev.B
* WiFi dongle (RTL8192CU driver)
* Putty
* Micro-SD card
* Ethernet cable connected to BeagleBone <br/>

##### Note
This setup was tested and worked with Debian 7.8 (Wheezy). 
Setup with other version may differ from this. <br/>
All command lines were performed via Putty @ 192.168.7.2:22
<br/> nano command will edit the text file and you can save edited file with CTRL+X and enter Y.
### 1. Expanding partition of micro-SD card 
By default, the partition of micro-SD is not fully expanded. Do the following scripts to expand it:
```
sudo fdisk /dev/mmcblk0
``` 
Then enter followings: <br />
1. p  "View summary of the storage" <br />
2. d  "Delete command"<br />
3. 2  "Delete partition 2. Do not delete one with * mark"<br />
4. n  "Create new partition"<br />
5. enter twice "Default setting will use maximum available storage"<br />
6. w  "Commit changes"<br />
```
reboot
sudo resize2fs /dev/mmcblk0p2
```
Now SD card is expanded to use maximum available storage size.

### 2. Dealing with HDMI Interference Issue
Go to the default directory of the BeagleBone. (It will show up automatically when connected via USB)
<br/> Uncomment following line:
```
##Disable HDMI
#cape_disable=capemgr.disable_partno=BB-BONELT-HDMI,BB-BONELT-HDMIN   <-- This line
```
### 3. Update & Upgrade 
Follow next few lines to update and upgrade the system:
```
sudo apt-get update
sudo apt-get upgrade
```
This step may take a while to be finished.
### 4. Install Git (V.2.6.0)and Generate SSH key
Install git with following commands:
```
wget https://www.kernel.org/pub/software/scm/git/git-2.6.0.tar.gz
tar xvf git-2.6.0.tar.gz
cd git-2.6.0
./configure –without-tcltk
make NO_TCLTK=Yes NO_MSGFMT=Yes NO_GETTEXT=Yes install            
```
Install process will take about 20 minutes. 
<br/> Once Git is installed, generate SSH.
```
ssh-keygen
Hit 'Enter' 3 times (Save file in default location without passphrase)
nano ~/.ssh/id_rsa.pub (To see ssh)
cd /home/debian
git clone git@abe-bhaleraolab.age.uiuc.edu:NetworkAnalyzerBone.git (If SSH key is added)
```
This will allow downloading of NetworkAnalyzer software into your BeagleBone system.
Make sure this software folder is placed at /home/debian path.
### 5. Reset WiFi interface
This step will allow BeagleBone to install a script that will reset WiFi interface by bringing it down and up automatically on boot.
This helps BeagleBone to have reliable WiFi performance.
```
cd ~ 
git clone https://github.com/adafruit/wifi-reset.git
cd wifi-reset
chmod +x install.sh
./install.sh
```
Now WiFi is ready to use with BeagleBone, but we will modify setup it up as an Access point (AP).
### 6. Setting up Access Point
By default, RTL8192CU driver is faulty and it needs to be replaced with modified version. [Reference Link](https://github.com/pvaret/rtl8192cu-fixes)
<br/> Install the drivers and dependencies:
```
sudo apt-get install build-essential dkms
or
sudo apt-get install git linux-headers-generic build-essential dkms

sudo apt-get install hostapd isc-dhcp-server
git clone https://github.com/pvaret/rtl8192cu-fixes.git
sudo dkms add ./rtl8192cu-fixes
sudo dkms install 8192cu/1.10
sudo depmod -a
sudo cp ./rtl8192cu-fixes/blacklist-native-rtl8192.conf /etc/modprobe.d/  (Ensure broken kernel is blacklisted)
reboot
```
Install compatible hostapd:
<br/> [Reference Link](https://learn.adafruit.com/setting-up-a-raspberry-pi-as-a-wifi-access-point?view=all)
```
wget http://adafruit-download.s3.amazonaws.com/adafruit_hostapd_14128.zip
unzip adafruit_hostapd_14128.zip
sudo mv /usr/sbin/hostapd /usr/sbin/hostapd.ORIG
sudo mv hostapd /usr/sbin
sudo chmod 755 /usr/sbin/hostapd
```
Next we will configure DHCP setting so that BeagleBone can distribute IP to clients automatically instead of using Static IP:
```
sudo nano /etc/dhcp/dhcpd.conf
```
Add following block to the very end of this file:
```
subnet 192.168.4.0 netmask 255.255.255.0 {
range 192.168.4.25 192.168.4.50;
interface wlan0;
}
```
Now let's configure network interfaces:
```
sudo nano /etc/network/interfaces
```
The file should look something like this:
```
# The loopback network interface
auto lo
iface lo inet loopback

# The primary network interface
auto eth0
iface eth0 inet dhcp
# Example to keep MAC address between reboots
#hwaddress ether DE:AD:BE:EF:CA:FE

# The secondary network interface
#auto eth1
#iface eth1 inet dhcp

# WiFi Example
#auto wlan0
#iface wlan0 inet dhcp
   # wpa-ssid "Ohyes”
   # wpa-ssid "IllinoisNet"
   # identity "syoo15"
   # wpa-psk  "123456"

iface usb0 inet static
    address 192.168.7.2
    netmask 255.255.255.252
    network 192.168.7.0
    gateway 192.168.7.1
allow-hotplug wlan0
iface wlan0 inet static
    address 192.168.4.1
    netmask 255.255.255.0
```
At this point, restart the network and reboot the system.
```
/etc/init.d/networking restart
reboot
```
Now we can configure access point details. Create a new file by running:
```
sudo nano /etc/hostapd/hostapd.conf
```
And edit this file to look like below:
<br/> [Reference Link](http://www.daveconroy.com/using-your-raspberry-pi-as-a-wireless-router-and-web-server/)
```
interface=wlan0
driver=rtl871xdrv
ssid=beagleNet
hw_mode=g
channel=6
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_passphrase=beaglebone
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP
```
If these steps were correctly followed, BeagleBone is now able to create an access point. 
Let's test it out:
```
sudo reboot
sudo hostapd /etc/hostapd/hostapd.conf -dd
sudo /etc/init.d/isc-dhcp-server restart
```
If hostapd does not have any errors, you will be able to see an access point with name "beagleNet".
If so, let's edit this file:
```
nano /etc/default/hostapd
```
Set the following and save it:
```
DAEMON_CONF="/etc/hostapd/hostapd.conf"
```
Additionally, add following line before 'exit' to the rc.local file:
```
nano /etc/init.d/rc.local
```
```
if up wlan0
```
Now you need to restart it to get it work:
```
/etc/init.d/hostapd restart
reboot
```
Once restart your BeagleBone, it will always create an access point. 

## Setting up the NetworkAnalyzer Web application
### 1. Install Node.js and dependencies
Copy and paste following lines to install node engine and necessary dependencies.
```
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential
sudo npm -g install forever
cd /home/debian/NetworkAnalyzerBone/webapp
npm install
```
This will install all components required to run NetworkAnalyzer application.
<br/> Test the app by running following command:
```
node /home/debian/NetworkAnalyzerBone/webapp/app.js
```
You can access the app via 192.168.7.2:3030 with the device connected via USB or WiFi access point @ 192.168.4.1:3030.

### 2. Configuring auto-run of the node app on boot
Configuring automatic run of netanalyzer app can be done by following simple steps below.
```
cp /home/debian/NetworkAnalyzerBone/webapp/netanalyzer.sh /etc/init.d/
chmod 755 /etc/init.d/netanalyzer.sh
update-rc.d netanalyzer.sh defaults
sudo service netanalyzer.sh start
reboot
```

#### *Forever.js auto-boot (Works but crash after 5 min)
During previous step, forever module was installed in order to configure BeagleBone to run the app automatically.
Create a file and edit the file as below:
```
sudo mkdir /var/run/forever
sudo nano /etc/init.d/nodeup
```
nodeup file should look like this:
```
#!/bin/sh
#/etc/init.d/nodeup

export PATH=$PATH:/usr/local/bin
export NODE_PATH=$NODE_PATH:/usr/local/lib/node_modules
export SERVER_PORT=3030

case "$1" in
  start)
  exec forever --sourceDir=/home/debian/NetworkAnalyzerBone/webapp -p /var/run/forever app.js scriptarguments
  ;;
stop)
  exec forever stop --sourceDir=/home/debian/NetworkAnalyzerBone/webapp app.js
  ;;
*)
  echo "Usage: /etc/init.d/nodeup {start|stop}"
  exit 1
  ;;
esac

exit 0
```
Once the file has been saved, enter followings to make the script executable on boot:
```
chmod 755 /etc/init.d/nodeup
update-rc.d nodeup defaults
sudo service nodeup start
reboot
```
On rebooting of the system, BeagleBone will always run NetworkAnalyzer app on port 3030. <br/>

# Connect to WiFi
Wifi SSID = beagleNet or whatever name you have chosen to be. (PWD for JBS sensor = beaglebone)
Select static IP. 
Type in 192.168.4.2 (4.4 also works) in static IP section.(For iphone, IP: 192.168.4.4, Subnetmask: 255.255.255.0, Router: 192.168.4.1, DNS: 192.168.4.1)
Others are not required to fill in. (For Android, when alertdialog asks this wifi has no internet --> check the box saying "Do not ask this message again")
Open an web browser.
Access to the web server @ 192.168.4.1:3030

# Trouble Shooting

<br/> When temperature is not correctly shown in web application:
```
i2cdetect -r 1
or 
i2cdetect -r 2

then
i2cdump -y 1 0x0D 
to probe registers of the AD5933 whether BBB can read or not
```

<br/> An issue regarding netanalyzer.sh file not recognized by the debian
```
head -1 netanalyzer.sh | od -c

Incorrect output: #   !   /   b   i   n   /   b   a   s   h  \r  \n
Correct output: #   !   /   b   i   n   /   b   a   s   h  \n
```
Fix this by..
```
cp netanalyzer.sh _p4 && tr -d '\r' < _p4 > netanalyzer.sh && rm _p4

```


# Other References
[RTL8192CU Driver](http://askubuntu.com/questions/509498/is-there-a-standard-wifi-driver-for-the-edimax-ew-7811un)
[Installing Kernel](http://beagleboard.org/project/fbtft-drivers-for-linux-38/)


End of the document. 

