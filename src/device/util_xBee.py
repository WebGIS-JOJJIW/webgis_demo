#! /usr/bin/env python
# ==========================================================================================
# Script Name: util_xBee.py
# Script Desc: Utility class for sending data (text and image) via XBee. This script allows
#   for data transmission by splitting data into manageable chunks and sending them with
#   acknowledgment handling over the XBee network.
#
# Dev by   : Sutee C.
# Version  : 1.0
# ==========================================================================================

import os
import struct
import time
import threading
import cv2
import numpy as np
from digi.xbee.devices import XBeeDevice, XBee64BitAddress, RemoteXBeeDevice, PowerLevel
from util_fileMon import extract_metadata

class XBeeTransmitter:
    """
    A utility class for transmitting data (text and images) using an XBee device.
    
    Attributes:
        PAYLOAD_TYPE_MAP (dict): A static map defining payload type identifiers for different data types.
    
    Methods:
        __init__(device, dest_address, chunk_size=255, ack_timeout=5, max_retries=3):
            Initializes the transmitter with device settings.
        read_image_to_bytes(image_path):
            Reads an image and converts it to a byte array.
        split_bytes(data):
            Splits a byte array into chunks, considering overhead.
        calculate_overhead():
            Calculates the total payload overhead size.
        wait_for_ack(expected_frame_counter):
            Waits for acknowledgment with the expected frame counter.
        send_data(data, data_type):
            Sends data (text or image) using the XBee device, split into chunks.
    """

    # Static variable for mapping data types to payload types
    PAYLOAD_TYPE_MAP = {
        'text': 0,
        'image': 1,
        # Add other payload types as needed, e.g., 'encrypted_text': 5, 'encrypted_image': 6
    }

    def __init__(self, device, dest_address, chunk_size=255, ack_timeout=5, max_retries=3, device_sync_ops_timeout=5):
        """
        Initializes the XBeeTransmitter.
        Args:
            device: The XBeeDevice instance.
            dest_address: The destination XBee64BitAddress.
            chunk_size: The maximum size of each data chunk.
            ack_timeout: The timeout for waiting for an acknowledgment.
            max_retries: The maximum number of retries for sending a chunk.
        """
        self.device = device
        self.dest_address = dest_address
        self.chunk_size = chunk_size
        self.ack_timeout = ack_timeout
        self.max_retries = max_retries
        self.device_sync_ops_timeout = device_sync_ops_timeout
        print(f"XBeeTransmitter init done")

    def test_open_device(self, port, baud_rate):
        try:
            print("Testing opening XBee device.")
            self.device = XBeeDevice(port, baud_rate)
            self.device.open()  # Open the device

            if self.device.is_open():
                print("\ttest_open_device: XBee device opened successfully.")
            else:
                print("\ttest_open_device: Failed to open XBee device.")
        except Exception as e:
            print(f"\ttest_open_device: Error: {e}")
        finally:
            if self.device.is_open():
                self.device.close()
    
    def read_image_to_bytes(self, image_path):
        """
        Reads an image (JPG or PNG) and returns its byte array based on the file extension.
        """
        # Determine the file extension
        file_extension = os.path.splitext(image_path)[1].lower()

        if file_extension == ".jpg" or file_extension == ".png":
            with open (image_path, 'rb') as fdata:
                data_bytes = fdata.read()
        else:
            raise ValueError(f"Unsupported file extension: {file_extension}. Supported: .jpg, .png")
        
        return data_bytes

    def split_bytes(self, data):
        overhead = self.calculate_overhead()
        chunk_size = self.chunk_size - overhead
        # print(f"Overhead: {overhead}, Actual chunk size: {chunk_size} / chunk")
     
        return [data[i: i + chunk_size] for i in range(0, len(data), chunk_size)]

    def calculate_overhead(self):
        """
        Calculates the total overhead for the payload dynamically.
        """
        payload_type_size = struct.calcsize('B')  # 1 byte for payload type
        frame_counter_size = struct.calcsize('>I')  # 4 bytes for frame counter
        chunk_count_size = struct.calcsize('>I')  # 4 bytes for total chunks
        total_overhead = payload_type_size + frame_counter_size + chunk_count_size
        return total_overhead

    def wait_for_ack(self, expected_frame_counter):
        """
        Waits for an acknowledgment with the expected frame counter.
        """
        start_time = time.time()
        while time.time() - start_time < self.ack_timeout:
            xbee_message = self.device.read_data(timeout=self.ack_timeout)
            if xbee_message:
                ack_frame_counter, = struct.unpack('>I', xbee_message.data)
                if ack_frame_counter == expected_frame_counter:
                    return True
        return False

    def send_data(self, data, data_type):
        """
        Sends data (text or image) using the XBee device.
        Args:
            data: The data to be sent (plain text string or image file path).
            data_type: The type of data ('text', 'image').
        """
        if data_type not in self.PAYLOAD_TYPE_MAP:
            raise ValueError(f"Unsupported data type: {data_type}. Supported types are {list(self.PAYLOAD_TYPE_MAP.keys())}.")
        print(f"sending data type: {data_type}")
        payload_type = self.PAYLOAD_TYPE_MAP[data_type]

        if not self.device.is_open():
            print(f"Device is not opened. Opening {self.device}")
            self.device.open()
        print(f"setting up device..")
        self.device.set_power_level(PowerLevel.LEVEL_HIGHEST)
        self.device.set_sync_ops_timeout(self.device_sync_ops_timeout)

        print(f"device {self.device} to des {self.dest_address} open done")

        remote = RemoteXBeeDevice(self.device, self.dest_address)

        if data_type == 'text':
            data_bytes = data.encode('utf-8')
        elif data_type == 'image':
            data_bytes = self.read_image_to_bytes(data)
        else:
            raise ValueError("Unsupported data type. Use 'text' or 'image'.")

        chunks = self.split_bytes(data_bytes)

        print(f"total chunk num: {len(chunks)}")

        frame_counter = 0
        chunk_count = len(chunks)
        while frame_counter < chunk_count:
            try:
                # chunk = chunks[frame_counter]
                # payload = struct.pack('B', payload_type) + struct.pack('>I', frame_counter) + struct.pack('>I', chunk_count) + chunk
                chunk = chunks[frame_counter]
                header = struct.pack('B', payload_type) + struct.pack('>I', frame_counter) + struct.pack('>I', chunk_count)
                payload = header + chunk
                # print(f"{chunk[:]}")

                for attempt in range(self.max_retries):
                    print(f"Sending {data_type} chunk {len(payload)} bytes {frame_counter + 1}/{chunk_count}")
                    self.device.send_data(remote, payload)

                    if self.wait_for_ack(frame_counter):
                        break
                    else:
                        print(f"Retry {attempt + 1} for {data_type} chunk {frame_counter}...")
                        if attempt == self.max_retries - 1:
                            raise Exception("Max retries reached.")

                    time.sleep(self.ack_timeout)

                frame_counter += 1
            except KeyboardInterrupt:
                print("Transmission interrupted.")
                break
            except Exception as e:
                print(f"Error: {e}")
                break

        if frame_counter == chunk_count:
            print(f"{data_type.capitalize()} sent successfully!")
        else:
            print(f"{data_type.capitalize()} transmission failed. Only {frame_counter} out of {chunk_count} chunks sent.")

        if self.device.is_open():
            self.device.close()

class XBeeReceiver:
    """
    A utility class for receiving data (text and images) over an XBee device.

    Attributes:
        device (XBeeDevice): The XBee device to receive data from.
        output_path (str): The directory where received data (images or text) will be saved.
        sync_timeout (int): The timeout period for sync operations and acknowledgments.
        received_data (dict): A dictionary that stores received chunks and metadata for each sender.

    Methods:
        __init__(device, output_path, timeout=60):
            Initializes the receiver with the specified device, output directory, and timeout period.
        save_image(data, output_path):
            Saves the received byte data as an image.
        data_receive_callback(xbee_message):
            Callback to handle incoming data and append it to the received data buffer.
        send_ack(remote_device, frame_counter):
            Sends an acknowledgment back to the sender with the current frame counter.
        receive_data():
            Continuously listens for incoming data from the XBee device.
        process_received_data():
            Processes completed data (text or image) and saves it to the output path.
    """

    def __init__(self, device, output_path, sync_timeout=5, device_sync_ops_timeout=5, save_extension=".png"):
        self.device = device
        self.output_path = output_path
        self.sync_timeout = sync_timeout
        self.device_sync_ops_timeout = device_sync_ops_timeout
        self.save_extension = save_extension
        self.received_data = {}
        self.oper_time = None
        self.output_file = None
        self.data_ready_event = threading.Event() # event to signal when data is ready to be processed
    
    def save_image(self, data, output_path):
        """
        Saves the received byte data as an image. Supports both .jpg and .png formats.
        """
        nparr = np.frombuffer(data, np.uint8)
        
        self.oper_time = time.time() - self.oper_time
        print(f"Total data received: {len(nparr)} bytes")
        print(f"Total data transfer time: {self.oper_time} seconds")

        # Determine how to decode based on file extension
        if self.save_extension == ".jpg" or self.save_extension == ".png":
            try:
                with open (output_path, 'wb') as f:
                    f.write(data)
                print(f"Image saved successfully as {self.save_extension}: {output_path}")
            except KeyboardInterrupt:
                print(f"\n{os.path.basename(__file__)}: Interrupt autorun by user. Exiting...")
            except Exception as e:
                print(f"Save_image Error: {e}")
        else:
            print(f"Unsupported format: {self.save_extension}")
            return
    
    def data_receive_callback(self, xbee_message):
        """
        Callback to handle incoming data and append it to the received_data.
        """
        payload = xbee_message.data
        remote_device = xbee_message.remote_device

        # Extract values from the payload
        payload_type = struct.unpack('B', payload[:1])[0]        # 1 byte for payload type
        frame_counter = struct.unpack('>I', payload[1:5])[0]     # 4 bytes for frame counter
        frame_counter_end = struct.unpack('>I', payload[5:9])[0] # 4 bytes for frame counter end
        chunk = payload[9:]

        if remote_device not in self.received_data:
            self.received_data[remote_device] = {
                "frame_counter": -1,
                "frame_counter_end": frame_counter_end - 1,
                "data": b"",
                "timestamp": -1,
                "payload_type": payload_type
            }
            self.oper_time = time.time()
            print(f"init frame_counter_end = {self.received_data[remote_device]['frame_counter_end']}")

        print(f"Payload : {len(payload)} byte -> {frame_counter} / {self.received_data[remote_device]['frame_counter_end']}")
        
        if self.received_data[remote_device]["frame_counter"] == self.received_data[remote_device]["frame_counter_end"]:
            print("All chunks received. Discarding new chunk.")
            return

        if frame_counter != self.received_data[remote_device]["frame_counter"] + 1:
            print("Frame counter mismatch. Discarding chunk.")
            print(
                f"Expected: {self.received_data[remote_device]['frame_counter'] + 1}, Received: {frame_counter}"
            )
            del self.received_data[remote_device]
            return

        self.received_data[remote_device]["frame_counter"] = frame_counter
        self.received_data[remote_device]["data"] += chunk
        self.received_data[remote_device]["timestamp"] = xbee_message.timestamp

        self.send_ack(remote_device, frame_counter)

        # Trigger the event when the last chunk is received
        if frame_counter == self.received_data[remote_device]["frame_counter_end"]:
            print("Data reception complete. Signaling DataStoreService.")
            self.data_ready_event.set()

    def send_ack(self, remote_device, frame_counter):
        """
        Sends an acknowledgment back to the sender with the frame counter.
        """
        ack_payload = struct.pack('>I', frame_counter)
        self.device.send_data(remote_device, ack_payload)

    def receive_data(self):
        """
        Waits for data to be received and processes it.
        """
        try:
            self.device.open()
            self.device.set_power_level(PowerLevel.LEVEL_HIGHEST)
            self.device.set_sync_ops_timeout(self.device_sync_ops_timeout)
            self.device.add_data_received_callback(self.data_receive_callback)
            print("Waiting for data...")

            # Continuous reception loop
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("KeyboardInterrupt detected.")
        finally:
            print("Exit and closing device.")
            if self.device.is_open():
                self.device.close()

    def process_received_data(self):
        """
        Processes the received data and saves the file based on the payload type.
        """
        for remote_device in list(self.received_data.keys()):
            if self.received_data[remote_device]["frame_counter"] == self.received_data[remote_device]["frame_counter_end"]:
                # directory_name = str(remote_device.get_64bit_addr())
                # directory_path = os.path.join(self.output_path, directory_name)
                if not os.path.exists(self.output_path):
                    os.makedirs(self.output_path)

                payload_type = self.received_data[remote_device]["payload_type"]
                filename = f"{time.strftime('%Y%m%d%H%M%S')}"
                
                if payload_type == 0:  # Text
                    filename += ".txt"
                    with open(os.path.join(self.output_path, filename), 'wb') as f:
                        f.write(self.received_data[remote_device]["data"])
                    print(f"Text saved successfully as {filename}!")
                
                elif payload_type == 1:  # Image
                    filename += self.save_extension
                    self.save_image(self.received_data[remote_device]["data"], os.path.join(self.output_path, filename))
                
                del self.received_data[remote_device]
            
            # Reset the event after processing
            self.data_ready_event.clear()
        
    def get_image_metadata(self):
        defaults_metadata_val = {
            'sensorName': "sensor",
            'eventID': f"sensor_{int(time.time())}",
            'objClassID': 999,  # 999 indicates unknown class
            'objClassName': 'unknown_object',
            'imgSeq': 1,
            'imgTotal': 1,
            'imgExtension': ".png",
            'eventSummary': '0-unknown'
        }
        
        # obtain metadata and loop through default keys and fill missing ones
        if os.path.exists(self.output_file):
            metadata = extract_metadata(self.output_file)
            for key, default_value in defaults_metadata_val.items():
                if key not in metadata or not metadata[key]:
                    metadata[key] = default_value
                    print(metadata[key])
        else:
            print(f"metadata not found in {self.output_file}")

class DataCleanupService(threading.Thread):
    """
    A background service that periodically checks and removes incomplete or stale data received via XBee.

    Attributes:
        receiver (XBeeReceiver): The XBeeReceiver instance to monitor for stale data.
        interval (int): The time interval (in seconds) between cleanup checks.
        running (bool): A flag indicating whether the service is running.

    Methods:
        __init__(receiver, interval=10, timeout=10):
            Initializes the cleanup service with the specified interval.
        run():
            Continuously monitors and cleans up stale data in the receiver.
        stop():
            Stops the cleanup service.
    """

    def __init__(self, receiver, interval=10, timeout=10):
        super().__init__()
        self.receiver = receiver
        self.interval = interval
        self.timeout = timeout
        self.running = True

    def run(self):
        while self.running:
            current_time = time.time()
            for remote_device in list(self.receiver.received_data.keys()):
                if current_time - self.receiver.received_data[remote_device]["timestamp"] > self.timeout:
                    print(f"Cleaning up data for {remote_device} due to timeout.")
                    del self.receiver.received_data[remote_device]
            time.sleep(self.interval)

    def stop(self):
        self.running = False

class DataStoreService(threading.Thread):
    """
    A background service that periodically processes and saves received data (text or image) from an XBeeReceiver.

    Attributes:
        receiver (XBeeReceiver): The XBeeReceiver instance from which completed data is processed.
        interval (int): The time interval (in seconds) between data processing checks.
        running (bool): A flag indicating whether the service is running.

    Methods:
        __init__(receiver, interval=5):
            Initializes the data storage service with the specified interval.
        run():
            Continuously checks for and processes completed data in the receiver, saving it to the output directory.
        stop():
            Stops the data storage service.
    """

    def __init__(self, receiver):
        super().__init__()
        self.receiver = receiver
        self.running = True

    def run(self):
        while self.running:
            # Wait for the event to be set, indicating that data is ready
            self.receiver.data_ready_event.wait()

            # Check if the thread is still running before processing data
            if self.running:
                # Process the received data when the event is triggered
                self.receiver.process_received_data()

            # Reset the event to wait for the next data reception
            self.receiver.data_ready_event.clear()

    def stop(self):
        self.running = False
        self.receiver.data_ready_event.set()