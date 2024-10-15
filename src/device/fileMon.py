#! /usr/bin/env python
# ==========================================================================================
# Script Name: fileMon.py
# Script Desc: POC - Monitoring incoming file extension from the specified directory then send it
#   over message broker to the webgis server.
#
# Dev by : Sutee C.
# Version : 2.0
# ==========================================================================================
import os
import time
import threading
from concurrent.futures import ThreadPoolExecutor
import uuid
import gc  # Garbage collection module

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
    7: "truck",
    15: "cat",
    16: "dog",
    19: "cow"
}

# Function to get the text from a given number
def get_object_text(number):
    return object_mapping.get(number, "Unknown_object")  # Return "Unknown object" if the number is not found

def get_datetime_from_timestamp(timestamp: int) -> str:
    return datetime.fromtimestamp(timestamp).strftime("%Y/%m/%d %H-%M-%S")

def send_file_over_mbroker(image: str):
    # default metadata value
    defaults_metadata_val = {
        'sensorName': "sensor",
        'eventID': f"sensor_{int(time.time())}",
        'objClassID': 999,  # 999 indicates unknown class
        'objClassName': 'unknown_object',
        'imgSeq': 1,
        'imgTotal': 1,
        'imgExtension': appConf.config['mon_extension'],
        'eventSummary': '0-unknown'
    }

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

    """
    Example of Image Metadata:
        sensorName: sensor1
        eventID: sensor1_1728502295
        objClassID: 0
        objClassName: person
        imgSeq: 6
        imgTotal: 10
        imgExtension: .png
        eventSummary: 1-bus, 2-car, 3-person
    """
    # obtain metadata and loop through default keys and fill missing ones
    metadata = extract_metadata(image)
    for key, default_value in defaults_metadata_val.items():
        if key not in metadata or not metadata[key]:
            metadata[key] = default_value

    # Load the image to be sent
    # print(f"\tload the image to be sent from: ", image)
    with open(str(image_file), "rb") as f:
        bin_content = f.read()

    # Create publish channel
    channel = Channel(hostip, "image")

    # Create a new message
    response = Response()

    # Add UUID for the message
    response.messageUuid = str(uuid.uuid4())

    # Add UUID for the event
    response.eventUuid = metadata['eventID']

    # Set sensor information
    response.sourceInfo.id = metadata['sensorName']
    response.sourceInfo.type = SourceType.CAMERA_SENSOR

    # Set timestamp (epoch time)
    dt = datetime.now()
    response.timestamp = int(dt.timestamp())

    # send Text only once when found the first image sequence
    if (int(metadata['imgSeq']) == 1):
        webgis_sendtext(channel, response, metadata)

    # Set the content of the image to the message
    response.eventImages.label = metadata['objClassName']
    response.eventImages.imageData.append(bin_content)

    # Publish the reponse for image
    channel.send_response(response)

    #debug
    if appConf.config['debug']: print(f"Total transfer time: ", blockTimer.stop(), "ms")

    print(
        f"""
Successfully sent data
    imgFile   {image}
    eventlabel {response.eventImages.label}
    eventUuid {response.eventUuid}
    uuid:     {response.messageUuid}
    sensor:   {response.sourceInfo.id}
    datetime: {dt.strftime('%Y-%m-%d %H:%M:%S')}
""")
    # Archive sent image file
    archive_img(image_file)

def webgis_sendtext(channel, response: Response, metadata):
    response.eventSummary.summary = metadata['eventSummary']

    # Publish the reponse for text
    channel.send_response(response)

    print(
        f"""
Successfully sent data
    text   {metadata['eventSummary']}
    eventlabel {response.eventImages.label}
    eventUuid {response.eventUuid}
    uuid:     {response.messageUuid}
    sensor:   {response.sourceInfo.id}
    datetime: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
""")

def webgis_sendfile(channel, response: Response, metadata, image):
    image_file = Path(image)
    file_size = image_file.stat().st_size
    if not image_file.is_file():
        raise Exception("Cannot find specified image file")
    
    # Load the image to be sent
    print(f"\tload the image to be sent from: ", image)
    with open(str(image_file), "rb") as f:
        bin_content = f.read()

    # Set the content of the image to the message
    response.eventImages.label = metadata['objClassName']
    response.eventImages.imageData.append(bin_content)

    # Publish the reponse for image
    channel.send_response(response)
    
    print(
        f"""
Successfully sent data
    imgFile   {image}
    eventlabel {response.eventImages.label}
    eventUuid {response.eventUuid}
    uuid:     {response.messageUuid}
    sensor:   {response.sourceInfo.id}
    datetime: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
""")


# Simulate sending the file over WebSocket
def mock_send_file_over_websocket(filepath):
    print("\tSending file over WebSocket: ", filepath)
    time.sleep(2)  # Simulate delay

    archive_img(filepath)

# Monitor directory for new image files
def monitor_directory(directory):
    inotify = INotify()
    watch_flags = flags.CREATE | flags.CLOSE_WRITE
    wd = inotify.add_watch(directory, watch_flags)

    monitored_extension = appConf.config['mon_extension']
    monitored_files = set()  # Keep track of monitored files to avoid repeated checks

    print(f"""
    ========
    {os.path.basename(__file__)} Begin file monitoring..
    ========
    """)

    with ThreadPoolExecutor(max_workers = appConf.config['max_workers']) as executor:
        try:
            while True:
                # This call blocks until events are available
                for event in inotify.read():
                    for flag in flags.from_mask(event.mask):
                        if flag == flags.CREATE:
                            filename = event.name
                            if filename.endswith(monitored_extension):
                                filepath = os.path.join(directory, filename)
                                if filename not in monitored_files:
                                    print("Found: ", filename)
                                    monitored_files.add(filename)
                        if flag == flags.CLOSE_WRITE and filename in monitored_files:
                            # Use the thread pool to handle the file processing
                            executor.submit(send_file_over_mbroker, filepath)
                            monitored_files.remove(filename)
        except KeyboardInterrupt:
            print(f"\n{os.path.basename(__file__)}: Interrupt file monitoring by user. Exiting...")
        except Exception as e:
            print(f"{os.path.basename(__file__)}: Error: {e}")
        finally:
            gc.collect()    # Force garbage collection

# load config and set the default config parameter
appConf = Config()
appConf.load("config/conf_fileMon.json")
default_mon_extension = ".png"

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

