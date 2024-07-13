#! /usr/bin/env python
# ==========================================================================================
# Script Name: util_fileMon.py
# Script Desc: POC - library utility for fileMon
#
# Dev by : Sutee C.
# Version : 1.0
# ==========================================================================================


import os
import json
import time

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
        end_time = time.time()

        # calculate elapse time as milliseconds
        elapsed_time_ms = int((end_time - self.start_time) * 1000)
        self.start_time = None  # Reset the timer

        return elapsed_time_ms

# Config management
class Config:
    def __init__(self):
        self.config = None

    # load config file
    def load(self, config_file):
        try:
            with open(config_file, 'r') as f:
                self.config = json.load(f)
        except FileNotFoundError:
            self.config = None

        return self.config
