# Starting a Server to Receive Images
## Prerequisite
You will need to start an infrastructure before proceed to step (1) below.
Please refer to the following link to setup or start the infrastructure.<br>
[Infrastructure README](../../infra/README.md)

## 1. Install GNU Make if neccessary
<u>Note: If you already have GNU make installed on your system or device, please skip this step.</u>
```
sudo apt-get install make
```

## 2. Run GNU Make under the `pb` directory to generate message definition<br>
<u>Note: This step has to be run only once as the one-time setup step.</u>

2.1 If you are on a <u>x86</u> machine and trying to generate the definition, run the following:
```
make -C pb x86
```

2.2. If you are on a Raspberri Pi device and try to generate the definition, run the following:
```
make -C pb aarch
```
2.3. The protobuf message definition can be found at `./pb/response_pb2.py`. You can import this file to use the message definition.

## 3. Run the Server Script to Receive Images
<u>Note: You will need root privilege to run the below command.</u>
```
./run_recv.sh
```

## Optional setup for Raspberry Pi
$ cd pb
$ make aarch

### check the site-packages directory
$ python3 -m site

### install pip3
$ wget https://bootstrap.pypa.io/pip/3.7/get-pip.py
$ python3 get-pip.py

$ pip3 show inotify_simple
$ pip3 install inotify_simple

$ pip3 install --force-reinstall -v click==8.1.7
$ pip3 install --force-reinstall -v pika==1.3.2

### Protobuf installation
#### option 1
$ pip3 install --force-reinstall -v protobuf==5.27.2
#### OR option 2
$ wget https://github.com/protocolbuffers/protobuf/releases/download/v27.0/protobuf-27.0.tar.gz
$ tar -zxvf protobuf-27.0.tar.gz

### other dependency
$ pip3 install --force-reinstall -v certifi==2024.7.4
$ pip3 install --force-reinstall -v charset-normalizer==3.3.2
$ pip3 install --force-reinstall -v idna==3.7
$ pip3 install --force-reinstall -v pillow==10.4.0
$ pip3 install --force-reinstall -v psycopg2-binary==2.9.9
$ pip3 install --force-reinstall -v redis==5.0.6
$ pip3 install --force-reinstall -v requests==2.32.3
$ pip3 install --force-reinstall -v setuptools==70.0.0
$ pip3 install --force-reinstall -v urllib3==2.2.2
$ pip3 install --force-reinstall -v wheel==0.43.0

### for YOLO
$ pip install ultralytics
$ pip install --upgrade --force-reinstall pybind11 opencv-python-headless scipy


###--------------
### optional installation
# install docker from https://docs.docker.com/engine/install/debian/
$ mkdir /opt/setup/
$ cd /opt/setup/
$ curl -fsSL https://get.docker.com -o get-docker.sh
$ sudo sh ./get-docker.sh
## OR
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

#### Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

####--------------