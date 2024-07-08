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