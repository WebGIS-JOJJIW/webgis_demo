import picamera2
from datetime import datetime
from digi.xbee.devices import XBeeDevice, XBee64BitAddress, RemoteXBeeDevice

import threading
import time
import asyncio
import os

from util_fileMon import *

async def captureImage():    
    try:
        with picamera2.Picamera2() as camera:

            camera_config = camera.create_still_configuration({"size":(4056,3040)})
            camera.configure(camera_config)
            camera.start()    

            now = datetime.now() # current date and time
            dir_out = appConf_image.config['mon_dir']
            nameImageOutput = now.strftime("%m%d%Y%_H%M%S") + ".jpg"    
            imagepath = os.path.join(dir_out, nameImageOutput) 
            print(imagepath)           
            camera.capture_file(imagepath) 
            
            print("Complated state Capture Image")

            delay_time =  appConf_image.config['delay_capture']
            await asyncio.sleep(delay_time/1000)

    except:
        print("Error state Capture Image")
        

async def waitXbee_rec():
    global flag_message_xbee, message_xbee 
    flag_message_xbee = 1
    rx_port = appConf_xbee.config['rx_port']
    rx_baudrate = appConf_xbee.config['rx_baudrate']
    
    device = XBeeDevice(rx_port, rx_baudrate)
    src_address = appConf_xbee.config['tx_to_dest_addr']
    src_address = XBee64BitAddress.from_hex_string(src_address)

    device.open()
    remote = RemoteXBeeDevice(device, src_address)   
    delay_time =  appConf_image.config['delay_capture']

    while flag_message_xbee:
        device.add_data_received_callback(data_received_callback)
        device.read_data_from(remote)
        print("Wait for data from station 1  ...")

        if(message_xbee.find("1") >= 0):
            print(f"Xbee ID {src_address}  code string {message_xbee}")
            print("Receive signal from Xbee is completed..")
            flag_message_xbee = 0                  
        await asyncio.sleep(delay_time/5000)

    device.close()

def data_received_callback(message):
    global message_xbee
    address = message.remote_device.get_64bit_addr()
    data = message.data.decode("utf8")
    message_xbee = data
    print("Received data from %s: %s" % (address, data))
   
class StateMachine:
    def __init__(self):
        self.state = "Inital"
        self.nextstate = 0 
        self.lock = threading.Lock()

    def run(self):
        while True:

            with self.lock:

                if(self.state == "Inital") :

                    print("State: Inital. Execualfile")
                    time.sleep(1)  # Simulating some delay

                    self.nextstate = Execualfile()
                    
                    if(self.nextstate == 1) :
                        print("State: Inital is completed")
                        self.state = "WaitXbee"
                    else:
                        self.state = "Inital"
                        print("State: Inital is fail restart to inital")
                        self.nextstate = 0

                elif(self.state == "WaitXbee") :
                    print("State: WaitXbee. Wait for Signal from xbee")
                    time.sleep(1)  # Simulating some delay
                    self.nextstate = WaitXbee()

                    if(self.nextstate == 2) :
                        print("State: WaitXbee is completed")
                        self.state = "CameraCap"
                    else:
                        self.state = "Inital"
                        print("State: WaitXbee is fail restart to inital")
                        self.nextstate = 0
                    
                elif(self.state == "CameraCap"):
                    print("State: CameraCap. Capture image from camera")
                    time.sleep(1)  # Simulating some delay
                    self.nextstate = CameraCap()
                    if(self.nextstate == 3):
                        self.state = "WaitXbee"
                        print("State: CameraCap is completed")
                    else:                        
                        self.state = "Inital"
                        print("State: CameraCap is fail restart to inital")
                        self.nextstate = 0


def Execualfile():
    return 1

def WaitXbee():
    global flag_message_xbee
    asyncio.run(waitXbee_rec())
    if(~flag_message_xbee):
        return 2

def CameraCap():
    global flag_camera_status
    asyncio.run(captureImage())
    if(~flag_camera_status):
        return 3

appConf_xbee = Config()
appConf_image = Config()

appConf_image.load("config/conf_imageOP.json")
appConf_xbee.load("config/conf_xBee.json")

default_mon_extension = ".jpg"
flag_message_xbee = 1
flag_camera_status = 1
message_xbee = ""




def state_machine_thread(state_machine):
    state_machine.run()

if __name__ == "__main__":
    state_machine = StateMachine()
    
    # Create and start the state machine thread
    thread = threading.Thread(target=state_machine_thread, args=(state_machine,))
    thread.start()

    # Keep the main thread alive for some time to observe the state transitions
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Stopping the state machine.")
        
    
