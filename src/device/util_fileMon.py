#! /usr/bin/env python
# ==========================================================================================
# Script Name: util_fileMon.py
# Script Desc: POC - library utility for fileMon
#
# Dev by : Sutee C.
# Version : 2.0
# ==========================================================================================
import os
import json
import time
import re  # Regular expression
from PIL import Image

# Check code block operation time
class CodeBlockTimer:
    def __init__(self):
        self.start_time = None

    def start(self):
        self.start_time = time.time()

    # return timer as milliseconds
    def stop(self):
        if self.start_time is None:
            raise ValueError("Timer was not started.")

        # calculate elapse time as milliseconds
        elapsed_time_ms = int((time.time() - self.start_time) * 1000)
        self.start_time = None  # Reset the timer

        return elapsed_time_ms

# Config management
class Config:
    def __init__(self):
        self.config = None

    # Load config file
    def load(self, config_file):
        try:
            with open(config_file, 'r') as f:
                self.config = json.load(f)
        except FileNotFoundError:
            print(f"Error: Config file '{config_file}' not found.")
            return None
        except json.JSONDecodeError:
            print(f"Error: Config file '{config_file}' contains invalid JSON.")
            return None
        return self.config

def archive_img(filepath):
    # Build new file name with timestamp
    directory, filename = os.path.split(filepath)
    file_name, file_extension = os.path.splitext(filename)
    timestamp = str(int(time.time()))
    
    # Construct new filename and path
    new_filename = f"{file_name}_{timestamp}{file_extension}X"
    new_filepath = os.path.join(directory, new_filename)

    # Rename the original file
    os.rename(filepath, new_filepath)

def _archive_img(filepath):
    # building new file name after process
    timestamp = int(time.time())

    directory, filename = os.path.split(filepath)
    _file_name, file_extension = os.path.splitext(filename)
    new_filename = f"{_file_name}_{str(timestamp)}{file_extension}"

    # Construct the new filepath
    new_filepath = os.path.join(directory, new_filename)
    new_filepath = new_filepath.replace(file_extension, str(file_extension) + "X")
    os.rename(filepath, new_filepath)

# Commonly usedfor image file name data extraction on fileMon send over mBroker
def extract_img_info(filename):
    # Define the expected pattern: sensorName_timestamp_objClassID_imageCounter.extension
    pattern = r'^[a-zA-Z0-9]+_\d+_\d+_\d+\.\w+$'
    
    # Check if the filename matches the pattern
    if not re.match(pattern, filename):
        print("Error: Filename does not match the expected pattern.")
        return False

    # Remove the file extension and split the filename by underscores
    name_part, ext = filename.rsplit('.', 1)
    parts = name_part.split('_')

    # Create and return the result dictionary
    result = {
        'eventID': f"{parts[0]}_{parts[1]}",  # sensor name and timestamp
        'obj_class_id': parts[2],              # Object class ID
        'image_counter': parts[3],             # Image counter
        'image_extension': ext                 # File extension
    }
    
    return result

def add_metadata(image_path, metadata_dict):
    img = Image.open(image_path)
    # Add multiple metadata items from the dictionary
    for key, value in metadata_dict.items():
        img.info[key] = value
    # Save the image with the metadata
    img.save(image_path, exif=img.info.get('exif'))

def extract_metadata(image_path):
    with Image.open(image_path) as img:
        # Retrieve metadata
        metadata = img.info
    return metadata