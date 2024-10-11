import os
import struct
from digi.xbee.devices import XBeeDevice, XBee64BitAddress, RemoteXBeeDevice, PowerLevel
import time
import cv2
import serial

import time
import threading
import gc  # Garbage collection module

from inotify_simple import INotify, flags
from datetime import datetime
from pathlib import Path
from ultralytics import YOLO
from PIL import Image, PngImagePlugin

from util_fileMon import *

def read_image_to_bytes(image_path):
    """
    Reads an image using OpenCV and returns its byte array.
    """
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Image at path {image_path} could not be read.")
    # Use the cvtColor() function to grayscale the image
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Downsample the image (reduce the size by half)
    downsampled_image = cv2.pyrDown(gray_image)
    _, buffer = cv2.imencode('.jpg', downsampled_image)
    return buffer.tobytes()


def split_bytes(data, chunk_size):
    """
    Splits a byte array into chunks of specified size.
    """
    return [data[i : i + chunk_size] for i in range(0, len(data), chunk_size)]

def wait_for_ack(device, expected_frame_counter):
    """
    Wait for an acknowledgment with the expected frame counter.
    """
    start_time = time.time()

    while time.time() - start_time < ACK_TIMEOUT:
        xbee_message = device.read_data(timeout=ACK_TIMEOUT)

        if xbee_message:
            ack_frame_counter, = struct.unpack('>I', xbee_message.data)
            if ack_frame_counter == expected_frame_counter:
                return True

    return False

def send_image(image_path, device):
    """
    Reads an image, splits it into chunks, and sends each chunk using XBee.
    """
    try:
        # Open device
        device.open()
        device.set_power_level(PowerLevel.LEVEL_HIGHEST)  # Set power level to lowest, [0, 4]
        device.set_sync_ops_timeout(TIMEOUT_FOR_SYNC_OPERATIONS)
        # Configure the Node ID using 'set_parameter' method.
        device.set_parameter("DO", bytearray([16]))

        remote = RemoteXBeeDevice(device, dest_address)

        # Read image file to bytes
        image_bytes = read_image_to_bytes(image_path)
        chunks = split_bytes(image_bytes, CHUNK_SIZE - 8)  # Subtract 4 bytes for frame counter

        # Send each chunk
        frame_counter = 0  # Frame counter (incremental)
        chunk_count = len(chunks)
        while frame_counter < chunk_count:
            try:

                chunk = chunks[frame_counter]
                payload = struct.pack('>I', frame_counter) + struct.pack('>I', chunk_count) + chunk
                
                # Attempt to send the chunk and wait for ACK
                for attempt in range(MAX_RETRIES):
                    print(f"Sending chunk {frame_counter + 1}/{chunk_count} with frame counter: {frame_counter}")
                    device.send_data(remote, payload)

                    # Wait for the acknowledgment
                    ack = wait_for_ack(device, frame_counter)
                    if ack:
                        # print(f"ACK received for frame {frame_counter}.")
                        break
                    else:
                        print(f"Retry {attempt + 1} for frame {frame_counter}...")
                        if attempt == MAX_RETRIES - 1:
                            raise Exception("Max retries reached.")

                    time.sleep(ACK_TIMEOUT)

                frame_counter += 1
            except KeyboardInterrupt:
                print("Transmission interrupted.")
                break
            except Exception as e:
                print(f"Error: {e}")
                break
        
        if frame_counter == chunk_count:
            print("Image sent successfully!")
        else:
            print(f"Image transmission failed. Only {frame_counter} out of {chunk_count} chunks sent.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if device.is_open():
            device.close()
# Monitor directory for new .jpg files
def monitor_directory(directory):
    inotify = INotify()
    watch_flags = flags.CREATE | flags.CLOSE_WRITE
    wd = inotify.add_watch(directory, watch_flags)

    print(f"""
    ========
    {os.path.basename(__file__)} Begin file monitoring..
    ========
    """)

    monitored_file = None
    try:
        while True:
            # This call blocks until events are available
            for event in inotify.read():
                for flag in flags.from_mask(event.mask):
                    if flag == flags.CREATE:
                        filename = event.name
                        if filename.endswith(appConf.config['mon_extension']):
                            filepath = os.path.join(directory, filename)
                            print("Found: ", filename)
                            monitored_file = filename
                    if flag == flags.CLOSE_WRITE:
                        if monitored_file == event.name:
                            # Start a new thread to handle the file processing
                            threading.Thread(target=send_image, args=(filepath, device,)).start()
    except KeyboardInterrupt:
        print(f"\n{os.path.basename(__file__)}: Interrupt file monitoring by user. Exiting...")
    except Exception as e:
        print(f"{os.path.basename(__file__)}: Error: {e}")
    finally:
        gc.collect()    # Force garbage collection

# XBee device configuration
PORT = "/dev/ttyUSB0"  # Change this to your XBee COM port
BAUD_RATE = 9600
TIMEOUT_FOR_SYNC_OPERATIONS = 5 # 5 seconds
"""
Radio	                                Payload Size
====================================================
802.15.4/ XBee	                        94 Bytes
XTend	                                2048 Bytes
XTC (Xtend Compatible) and SX products	2048 Bytes
900 HP 	                                256 Bytes
"""
CHUNK_SIZE = 255  # Set chunk size (in bytes)

# Timeout and retry settings
ACK_TIMEOUT = 5  # Timeout in seconds to wait for ACK
MAX_RETRIES = 3  # Max number of retries before giving up

# load config and set the default config parameter
appConf = Config()
appConf.load("config/conf_fileMonImage.json")
default_mon_extension = ".png"

appConfXbee = Config()
appConfXbee.load("config/conf_xBee.json")

print(f"txAddr {appConfXbee.config['txAddr']}")
print(f"txPort {appConfXbee.config['txPort']}")
print(f"txBaudRate {appConfXbee.config['txBaudRate']}")

# Initialize XBee device
dest_address = XBee64BitAddress.from_hex_string(f"{appConfXbee.config['txAddr']}")
device = XBeeDevice(f"{appConfXbee.config['txPort']}", int(appConfXbee.config['txBaudRate']))

if __name__ == "__main__":
    if 'mon_dir' not in appConf.config:
        raise Exception("'mon_dir' not found in config")
    directory_to_monitor = appConf.config['mon_dir']

    if not os.path.exists(directory_to_monitor) or not os.path.isdir(directory_to_monitor):
        raise Exception("The directory \'", directory_to_monitor, "\' does not exist or is not a directory!")

    if 'mon_extension' not in appConf.config:
        appConf.config['mon_extension'] = default_mon_extension

    monitor_directory(directory_to_monitor)

# if __name__ == "__main__":
#     image_path = "input/flower.jpg"
#     send_image(image_path, device)
