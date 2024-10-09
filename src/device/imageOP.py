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
import gc  # Garbage collection module

from inotify_simple import INotify, flags
from datetime import datetime
from pathlib import Path
from ultralytics import YOLO
from PIL import Image, PngImagePlugin

from util_fileMon import *

# Process and crop the detected interested object from input image
def processImage(filePathAndName):
    try:
        eventID = str(appConf.config['sensor_name']) + "_" + str(int(time.time()))

        # Load the YOLOv8 model
        model = YOLO('YOLO/yolov8n.pt')

        # Perform inference on the image
        results = model(filePathAndName)

        # Load the image with OpenCV
        img = cv2.imread(filePathAndName)

        obj_count = 0

        # Dictionary to keep count of each class
        class_count = {}

        # image_metadata_list = []  # Store metadata temporarily
        crop_data_list = []  # Store cropped image data temporarily

        # Loop through the detected objects
        for result in results:
            boxes = result.boxes.cpu().numpy()

            for i, box in enumerate(boxes):
                # Correctly get the class ID from the bounding box
                classid = int(box.cls[0])  # Get the class ID

                # Get the class name from the model's list of names
                className = model.names[classid]

                if (classid in {0, 1, 2, 3, 5, 7}):
                    # Count the detected objects by type
                    if className in class_count:
                        class_count[className] += 1
                    else:
                        class_count[className] = 1
                    obj_count += 1

                    # Get the bounding box coordinates
                    r = box.xyxy[0].astype(int)
                    
                    # Crop the object from the image
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
        
        # Generate the summary after processing all images
        summary = ', '.join([f"{count}-{className}" for className, count in class_count.items()])
        print(f"Detected objects summary: {summary}")

        # Add metadata to each cropped image and save it
        for idx, data in enumerate(crop_data_list):
            crop = data['crop']
            eventID = data['eventID']
            classid = data['classid']
            className = data['className']
            imgSeq = data['imgSeq']

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

            # Save the cropped image with metadata as a PNG file
            save_path = os.path.join(f"{appConf.config['output_dir']}", f"{eventID}_{classid}_{imgSeq}{appConf.config['write_extension']}")
            crop_pil.save(save_path, "PNG", pnginfo=metadata)  # Save as .png with metadata
            print(f"Saved with metadata: {save_path}")

        # Archive processed image file
        archive_img(filePathAndName)

    except Exception as e:
        print(f"Error in processing image: {e}")

# Process and crop the detected interested object from input image
def _processImage(filePathAndName):
    try:
        eventID = str(appConf.config['sensor_name']) + "_" + str(int(time.time()))

        # Load the YOLOv8 model
        model = YOLO('YOLO/yolov8n.pt')

        # Perform inference on the image
        results = model(filePathAndName)

        # Load the image with OpenCV
        img = cv2.imread(filePathAndName)

        obj_count = 0

        # Dictionary to keep count of each class
        class_count = {}

        image_metadata_list = []

        # Loop through the detected objects
        for result in results:
            boxes = result.boxes.cpu().numpy()

            for i, box in enumerate(boxes):
                # Correctly get the class ID from the bounding box
                classid = int(box.cls[0])  # Get the class ID

                # Get the class name from the model's list of names
                className = model.names[classid]

                # Print the detected object name
                # print(f"Detected object: {classid}: {className}")

                if (classid in {0, 1, 2, 3, 5, 7}):
                    """ Allowed Class ID
                    0: person
                    1: bicycle
                    2: car
                    3: motorcycle
                    5: bus
                    7: truck
                    """
                    # Count the detected objects by type
                    if className in class_count:
                        class_count[className] += 1
                    else:
                        class_count[className] = 1
                    # increment allowed object counter
                    obj_count += 1

                    # Get the bounding box coordinates
                    r = box.xyxy[0].astype(int)
                    
                    # Crop the object from the image
                    crop = img[r[1]:r[3], r[0]:r[2]]
                    
                    # Save the cropped image with the index
                    cv2.imwrite(os.path.join(f"{appConf.config['output_dir']}", f"{eventID}_{classid}_{obj_count}{appConf.config['mon_extension']}"), crop)
                    print(f"Cropped and saved: {eventID}_{classid}_{obj_count}{appConf.config['mon_extension']}")
                    print("-----")

                    # Generating cropped image metadata
                    img_metadata = { 
                        'eventID': {eventID},
                        'objClassID': {classid},
                        'objClassName': {className},
                        'imgExtension': f"{appConf.config['mon_extension']}",
                        'imgSeq': obj_count,
                        'imgTotal': '',
                        'eventSummary': ''
                    }
                    # Add the metadata to the list
                    image_metadata_list.append(img_metadata)
                else:
                    print(f"Skip object: {classid}: {className}")
        # Archive processed image file
        archive_img(filePathAndName)

        # Create a summary string of detected objects
        summary = ', '.join([f"{count}-{className}" for className, count in class_count.items()])
        print(f"Detected objects summary: {summary}")

        time.sleep(2)

        # Update metadata and add each into image
        for imgMetaLoop in image_metadata_list:
            # update missing metadata
            imgMetaLoop['imgTotal'] = obj_count
            imgMetaLoop['eventSummary'] = summary

            tmpImgPath = os.path.join(f"{appConf.config['output_dir']}", f"{eventID}_{classid}_{obj_count}{appConf.config['mon_extension']}T")
            add_metadata(tmpImgPath, imgMetaLoop)

            # # remove temporary file extension (T) from the file
            # tmpImgPath = tmpImgPath.replace(f"{appConf.config['mon_extension']}T", {appConf.config['mon_extension']})
            time.sleep(2)

    finally:
        # Memory cleanup
        img = None   # Release OpenCV image resource
        results = None # Clear YOLO model results
        del model   # Explicitly delete any large objects
        gc.collect()    # Force garbage collection

# Process and crop the detected interested object from input image
def __processImage(filePathAndName):
    try:
        eventID = str(appConf.config['sensor_name']) + "_" + str(int(time.time()))

        # Load the YOLOv8 model
        model = YOLO('YOLO/yolov8n.pt')

        # Perform inference on the image
        results = model(filePathAndName)

        # Load the image with OpenCV
        img = cv2.imread(filePathAndName)

        obj_count = 0

        # Dictionary to keep count of each class
        class_count = {}

        image_metadata_list = []

        # Loop through the detected objects
        for result in results:
            boxes = result.boxes.cpu().numpy()

            for i, box in enumerate(boxes):
                # Correctly get the class ID from the bounding box
                classid = int(box.cls[0])  # Get the class ID

                # Get the class name from the model's list of names
                className = model.names[classid]

                # Print the detected object name
                # print(f"Detected object: {classid}: {className}")

                if (classid in {0, 1, 2, 3, 5, 7}):
                    """ Allowed Class ID
                    0: person
                    1: bicycle
                    2: car
                    3: motorcycle
                    5: bus
                    7: truck
                    """
                    # Count the detected objects by type
                    if className in class_count:
                        class_count[className] += 1
                    else:
                        class_count[className] = 1
                    # increment allowed object counter
                    obj_count += 1

                    # Get the bounding box coordinates
                    r = box.xyxy[0].astype(int)
                    
                    # Crop the object from the image
                    crop = img[r[1]:r[3], r[0]:r[2]]
                    
                    # Save the cropped image with the index
                    cv2.imwrite(os.path.join(f"{appConf.config['output_dir']}", f"{eventID}_{classid}_{obj_count}{appConf.config['mon_extension']}"), crop)
                    print(f"Cropped and saved: {eventID}_{classid}_{obj_count}{appConf.config['mon_extension']}")
                    print("-----")
                else:
                    print(f"Skip object: {classid}: {className}")
        # Archive processed image file
        archive_img(filePathAndName)

        # Create a summary string of detected objects
        summary = ', '.join([f"{count}-{className}" for className, count in class_count.items()])
        print(f"Detected objects summary: {summary}")

    finally:
        # Memory cleanup
        img = None   # Release OpenCV image resource
        results = None # Clear YOLO model results
        del model   # Explicitly delete any large objects
        gc.collect()    # Force garbage collection

# Monitor directory for new .jpg files
def monitor_directory(directory):
    inotify = INotify()
    watch_flags = flags.CREATE | flags.CLOSE_WRITE
    wd = inotify.add_watch(directory, watch_flags)

    print(f"Begin file monitoring..")

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
                            threading.Thread(target=processImage, args=(filepath,)).start()
    except KeyboardInterrupt:
        print(f"\n{os.path.basename(__file__)}: Interrupt file monitoring by user. Exiting...")
    except Exception as e:
        print(f"{os.path.basename(__file__)}: Error: {e}")
    finally:
        gc.collect()    # Force garbage collection

# load config and set the default config parameter
print(f"Loading configuration file..")
appConf = Config()
appConf.load("conf_fileMonImage.json")
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