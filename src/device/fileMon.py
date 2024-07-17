#! /usr/bin/env python
# ==========================================================================================
# Script Name: fileMon.py
# Script Desc: POC - Monitoring incoming file extension from the specified directory then send it
#   over message broker to the webgis server.
#
# Dev by : Sutee C.
# Version : 1.0
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
from util_fileMon import CodeBlockTimer, Config

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

    # Create publish channel
    channel = Channel(hostip, "image")

    # Create a new message
    response = Response()

    # Add UUID for the message
    response.messageUuid = str(uuid.uuid4())

    # Set sensor information
    response.sourceInfo.id = sensor
    response.sourceInfo.type = SourceType.CAMERA_SENSOR

    # Set timestamp (epoch time)
    dt = datetime.now()
    response.timestamp = int(dt.timestamp())

    # Set the content of the image to the message
    response.imageData = bin_content

    # Publish the reponse
    channel.send_response(response)

    #debug
    if appConf.config['debug']: print(f"Total transfer time: ", blockTimer.stop(), "ms")

    print(
        f"""
Successfully sent message
    uuid:     {response.messageUuid}
    sensor:   {response.sourceInfo.id}
    datetime: {dt.strftime('%Y-%m-%d %H:%M:%S')}
""")
    # Archive sent image file
    archive_img(image_file)

def archive_img(filepath):
    # building new file name after process
    timestamp = int(time.time())

    directory, filename = os.path.split(filepath)
    new_filename = str(timestamp) + "_" + str(filename)

    if appConf.config['debug']: print("\tnew filename: ", new_filename)

    # Construct the new filepath
    new_filepath = os.path.join(directory, new_filename)
    new_filepath = new_filepath.replace(appConf.config['mon_extension'], str(appConf.config['mon_extension']) + "Process")
    os.rename(filepath, new_filepath)

    if appConf.config['debug']: print("\tProcessed and renamed: ", filepath)


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
                        threading.Thread(target=send_file_over_mbroker, args=(filepath,"sensor1",)).start()

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

