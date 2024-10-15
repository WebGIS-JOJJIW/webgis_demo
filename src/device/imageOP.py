#! /usr/bin/env python
# ==========================================================================================
# Script Name: imageOP.py
# Script Desc: POC - Object detection using YOLO8n and crop detected person from image input.
#   Then save it to the specified output directory.
#
# Dev by : Sutee C.
# Version : 2.0
# ==========================================================================================
import os
import cv2

import os
import time
import threading
from concurrent.futures import ThreadPoolExecutor
import gc  # Garbage collection module

from inotify_simple import INotify, flags
from datetime import datetime
from pathlib import Path
from ultralytics import YOLO
from PIL import Image, PngImagePlugin

from util_fileMon import *

# Globally Load the YOLOv8 model
model = YOLO('YOLO/yolov8n.pt')

# Process and crop the detected interested object from input image
def processImage(filePathAndName):
    try:
        eventID = f"{appConf.config['sensor_name']}_{int(time.time())}"

        # Perform inference on the image
        results = model(filePathAndName)

        # Load the image with OpenCV
        img = cv2.imread(filePathAndName)
        if img is None:
            raise ValueError(f"Failed to load image from {filePathAndName}")

        obj_count = 0
        class_count = {}     # Dictionary to keep count of each class
        crop_data_list = []  # Store cropped image data temporarily

        # Loop through the detected objects
        for result in results:
            boxes = result.boxes.cpu().numpy()

            for i, box in enumerate(boxes):
                classid = int(box.cls[0])  # Get the class ID from the bounding box
                className = model.names[classid] # Get the class name from the model's list of names

                if (classid in {0, 1, 2, 3, 5, 7, 15, 16, 19}): # Allowed classes
                    # Count the detected objects by type
                    class_count[className] = class_count.get(className, 0) + 1
                    obj_count += 1

                    # Get bounding box coordinates and crop the object
                    r = box.xyxy[0].astype(int)
                    crop = img[r[1]:r[3], r[0]:r[2]]

                    # Store cropped image data and associated metadata
                    crop_data_list.append({
                        'crop': crop, 
                        'eventID': eventID, 
                        'classid': classid, 
                        'className': className, 
                        'imgSeq': obj_count
                    })
                else:
                    print(f"Skip object: {classid}: {className}")
        
        # Generate a summary of detected objects
        summary = ', '.join([f"{count}-{className}" for className, count in class_count.items()])
        print(f"Detected objects summary: {summary}")

        # Prepare metadata and save cropped images
        for data in crop_data_list:
            eventID = data['eventID']
            classid = data['classid']
            className = data['className']
            imgSeq = data['imgSeq']
            crop = data['crop']

            # Convert the cropped image to PIL format
            crop_pil = Image.fromarray(cv2.cvtColor(crop, cv2.COLOR_BGR2RGB))

            # Create metadata for each image
            metadata = PngImagePlugin.PngInfo()
            metadata.add_text("sensorName", appConf.config['sensor_name'])
            metadata.add_text("eventID", eventID)
            metadata.add_text("objClassID", str(classid))
            metadata.add_text("objClassName", className)
            metadata.add_text("imgSeq", str(imgSeq))
            metadata.add_text("imgTotal", str(obj_count))
            metadata.add_text("imgExtension", appConf.config['write_extension'])
            metadata.add_text("eventSummary", summary)

            # Save the cropped image with metadata as PNG
            save_path = os.path.join(appConf.config['output_dir'], f"{eventID}_{classid}_{imgSeq}{appConf.config['write_extension']}")
            crop_pil.save(save_path, "PNG", pnginfo=metadata)
            # print(f"Saved with metadata: {save_path}")
            
        # Archive processed image file
        archive_img(filePathAndName) 

    except (FileNotFoundError, ValueError) as e:
        print(f"File error: {e}")
    except Exception as e:
        print(f"Error in processing image: {e}")

# Monitor directory for new .jpg files
def monitor_directory(directory):
    inotify = INotify()
    watch_flags = flags.CREATE | flags.CLOSE_WRITE
    inotify.add_watch(directory, watch_flags)

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
                            executor.submit(processImage, filepath)
                            monitored_files.remove(filename)

        except KeyboardInterrupt:
            print(f"\n{os.path.basename(__file__)}: Interrupt file monitoring by user. Exiting...")
        except Exception as e:
            print(f"{os.path.basename(__file__)}: Error: {e}")
        finally:
            gc.collect()    # Force garbage collection

# load config and set the default config parameter
appConf = Config()
appConf.load("config/conf_imageOP.json")
default_mon_extension = ".jpg"

if __name__ == "__main__":
    if 'mon_dir' not in appConf.config:
        raise Exception("'mon_dir' not found in config")
    directory_to_monitor = appConf.config['mon_dir']

    if not os.path.exists(directory_to_monitor) or not os.path.isdir(directory_to_monitor):
        raise Exception("The directory \'", directory_to_monitor, "\' does not exist or is not a directory!")

    if 'mon_extension' not in appConf.config:
        appConf.config['mon_extension'] = default_mon_extension

    monitor_directory(directory_to_monitor)