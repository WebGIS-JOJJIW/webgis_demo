#! /usr/bin/env python
# ==========================================================================================
# Script Name: fileMon.py
# Script Desc: POC - Monitoring incoming file extension from the specified directory then send it
#   over message broker to the webgis server.
#
# Dev by : Sutee C.
# Version : 1.1
# ==========================================================================================
import os
import time
import threading
import uuid

from inotify_simple import INotify, flags
from datetime import datetime
from pathlib import Path
from channel import Channel

from pb.response_pb2 import Response, SourceType
from util_fileMon import *

# Predefined dictionary for obj_classID and obj_className mapping
object_mapping = {
    0: "person",
    1: "bicycle",
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck"
}

# Function to get the text from a given number
def get_object_text(number):
    return object_mapping.get(number, "Unknown_object")  # Return "Unknown object" if the number is not found

def get_datetime_from_timestamp(timestamp: int) -> str:
    return datetime.fromtimestamp(timestamp).strftime("%Y/%m/%d %H-%M-%S")

def send_file_over_mbroker(image: str, sensor: str):
    if 'mqhost' not in appConf.config:
        raise Exception("'hostip' not found in config")
    hostip = appConf.config['mqhost']

    # debug
    if appConf.config['debug']:
        blockTimer = CodeBlockTimer()
        blockTimer.start()

    image_file = Path(image)
    file_size = image_file.stat().st_size
    if not image_file.is_file():
        raise Exception("Cannot find specified image file")

    # Load the image to be sent
    print(f"\tload the image to be sent from: ", image)
    with open(str(image_file), "rb") as f:
        bin_content = f.read()

    # Extracting image data from image file name
    image_directory, image_filename_ext = os.path.split(image_file)
    img_info = extract_img_info(image_filename_ext)

    # Checking if the return result is valid and using the elements
    if img_info:
        img_info_eventID = img_info['eventID']
        img_info_obj_class_id = img_info['obj_class_id']
        img_info_image_counter = img_info['image_counter']
        img_info_obj_class_name = get_object_text(img_info_obj_class_id)
    else:
        img_info_eventID = (f"sensor_{int(time.time())}")
        img_info_obj_class_name = "Unknown_object"

    # Create publish channel
    channel = Channel(hostip, "image")

    # Create a new message
    response = Response()

    # Add UUID for the message
    response.messageUuid = str(uuid.uuid4())

    # Add UUID for the event
    response.eventUuid = img_info_eventID

    # Set sensor information
    response.sourceInfo.id = sensor
    response.sourceInfo.type = SourceType.CAMERA_SENSOR

    # Set timestamp (epoch time)
    dt = datetime.now()
    response.timestamp = int(dt.timestamp())

    # Set the content of the image to the message
    response.eventImages.label = img_info_obj_class_name
    response.eventImages.imageData.append(bin_content)

    # Publish the reponse
    channel.send_response(response)

    #debug
    if appConf.config['debug']: print(f"Total transfer time: ", blockTimer.stop(), "ms")

    print(
        f"""
Successfully sent data
    eventUuid {response.eventUuid}
    uuid:     {response.messageUuid}
    sensor:   {response.sourceInfo.id}
    datetime: {dt.strftime('%Y-%m-%d %H:%M:%S')}
""")
    # Archive sent image file
    archive_img(image_file)

# Simulate sending the file over WebSocket
def mock_send_file_over_websocket(filepath):
    print("\tSending file over WebSocket: ", filepath)
    time.sleep(2)  # Simulate delay

    archive_img(filepath)

# Monitor directory for new .jpg files
def monitor_directory(directory):
    inotify = INotify()
    watch_flags = flags.CREATE | flags.CLOSE_WRITE
    wd = inotify.add_watch(directory, watch_flags)

    print(f"Begin file monitoring..");

    monitored_file = None
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
                        threading.Thread(target=send_file_over_mbroker, args=(filepath,appConf.config['sensor_name'],)).start()

# load config and set the default config parameter
print(f"Loading configuration file..")
appConf = Config()
appConf.load("conf_fileMon.json")
default_mon_extension = ".jpg"

if __name__ == "__main__":
    if 'mon_dir' not in appConf.config:
        raise Exception("'mon_dir' not found in config")
    directory_to_monitor = appConf.config['mon_dir']

    if 'mon_extension' not in appConf.config:
        appConf.config['mon_extension'] = default_mon_extension

    if not os.path.exists(directory_to_monitor) or not os.path.isdir(directory_to_monitor):
        print("The directory \'", directory_to_monitor, "\' does not exist or is not a directory!")
    else:
        monitor_directory(directory_to_monitor)

