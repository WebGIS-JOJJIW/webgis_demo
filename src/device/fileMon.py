#! /usr/bin/env python
# ==========================================================================================
# Script Name: fileMon.py
# Dev by : Sutee C.
# Release Version : 0.1
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

def get_datetime_from_timestamp(timestamp: int) -> str:
    return datetime.fromtimestamp(timestamp).strftime("%Y/%m/%d %H-%M-%S")

def send_file_over_mbroker(image: str, sensor: str):
    hostip = "163.47.10.22"

    image_file = Path(image)
    file_size = image_file.stat().st_size
    if not image_file.is_file():
        raise Exception("Cannot find specified image file")

    # Load the image to be sent
    print(f"load the image to be sent from: ", image)
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
    print("new filename: ", new_filename)

    # Construct the new filepath
    new_filepath = os.path.join(directory, new_filename)
    new_filepath = new_filepath.replace(".jpg", ".processJpg")
    os.rename(filepath, new_filepath)
    print("Processed and renamed: ", filepath)


# Simulate sending the file over WebSocket
def mock_send_file_over_websocket(filepath):
    print("Sending file over WebSocket: ", filepath)
    time.sleep(2)  # Simulate delay

# Monitor directory for new .jpg files
def monitor_directory(directory):
    inotify = INotify()
    watch_flags = flags.CREATE
    wd = inotify.add_watch(directory, watch_flags)

    print(f"Begin file monitoring..");

    while True:
        # This call blocks until events are available
        for event in inotify.read():
            for flag in flags.from_mask(event.mask):
                if flag == flags.CREATE:
                    filename = event.name
                    if filename.endswith('.jpg'):
                        filepath = os.path.join(directory, filename)
                        print("found: ", filename)
                        # Start a new thread to handle the file processing
                        #threading.Thread(target=mock_send_file_over_websocket, args=(filepath,)).start()
                        threading.Thread(target=send_file_over_mbroker, args=(filepath,"-b",)).start()

if __name__ == "__main__":
    directory_to_monitor = "/opt/imgin/"

    if not os.path.exists(directory_to_monitor) or not os.path.isdir(directory_to_monitor):
        print("The directory \'", directory_to_monitor, "\' does not exist or is not a directory!")
    else:
        monitor_directory(directory_to_monitor)

