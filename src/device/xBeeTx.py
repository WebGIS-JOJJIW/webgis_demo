import os
from digi.xbee.devices import XBeeDevice, XBee64BitAddress, RemoteXBeeDevice, PowerLevel

from concurrent.futures import ThreadPoolExecutor
import gc  # Garbage collection module
from inotify_simple import INotify, flags

from util_fileMon import *
from util_xBee import XBeeTransmitter

#=================================

# load config
appConfXbee = Config()
appConfXbee.load("config/conf_xBee.json")

print(f"\ttx_port {appConfXbee.config['tx_port']}")
print(f"\ttx_baudrate {appConfXbee.config['tx_baudrate']}")
print(f"\ttx_to_dest_addr {appConfXbee.config['tx_to_dest_addr']}")

# Initialize XBee device
TX_TO_DEST_ADDR = XBee64BitAddress.from_hex_string(f"{appConfXbee.config['tx_to_dest_addr']}")
DEVICE = XBeeDevice(f"{appConfXbee.config['tx_port']}", int(appConfXbee.config['tx_baudrate']))

time.sleep(10)
ZPORT = "/dev/ttyUSB0"  # or "COM6" for Windows
ZBAUD_RATE = 115200

CHUNK_SIZE = int(appConfXbee.config['chunk_size_byte'])
ACK_TIMEOUT = int(appConfXbee.config['tx_ack_timeout_sec'])
MAX_RETRY = int(appConfXbee.config['tx_max_retry_times'])
DEVICE_SYNC_OPS_TIMEOUT = int(appConfXbee.config['tx_device_sync_ops_timeout_sec'])

# Create an instance of the XBeeTransmitter class
TRANSMITTER = XBeeTransmitter(DEVICE, TX_TO_DEST_ADDR, CHUNK_SIZE, ACK_TIMEOUT, MAX_RETRY, DEVICE_SYNC_OPS_TIMEOUT)
TRANSMITTER.test_open_device(ZPORT, ZBAUD_RATE)

def send_xbee_payload(filepath):
    # Example usage for sending text and image
    # TRANSMITTER.send_data("Hello World", "text")
    # TRANSMITTER.send_data("path/to/image.jpg", "image")
    if filepath.endswith(appConfXbee.config['mon_extension']):
        print(f"\tTransmitting type \"image\": {filepath}")
        print(f"""
              device {TRANSMITTER.device}
              dest_address {TRANSMITTER.dest_address}
              chunk_size {TRANSMITTER.chunk_size} 
              ack_timeout {TRANSMITTER.ack_timeout} 
              max_retries {TRANSMITTER.max_retries} 
              device_sync_ops_timeout {TRANSMITTER.device_sync_ops_timeout}""")
        TRANSMITTER.send_data(filepath, "image")
        print(f"Done sending date {filepath}..\n\tArchiving..")
        archive_img(filepath)
    else:
        print(f"Unsupported file type for {filepath}")

# Monitor directory for new payload data
def monitor_directory(directory):
    inotify = INotify()
    watch_flags = flags.CREATE | flags.CLOSE_WRITE
    inotify.add_watch(directory, watch_flags)

    monitored_extension = appConfXbee.config['mon_extension']
    monitored_files = set()  # Keep track of monitored files to avoid repeated checks

    print(f"""
    ========
    {os.path.basename(__file__)} Begin file monitoring..
    ========
    """)

    # with ThreadPoolExecutor(max_workers = appConfXbee.config['max_workers']) as executor:
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
                        # # Use the thread pool to handle the file processing
                        # executor.submit(send_xbee_payload, filepath)
                        
                        # Call send_xbee_payload directly (sequential processing)
                        send_xbee_payload(filepath)
                        monitored_files.remove(filename)
    except KeyboardInterrupt:
        print(f"\n{os.path.basename(__file__)}: Interrupt file monitoring by user. Exiting...")
    except Exception as e:
        print(f"{os.path.basename(__file__)}: Error: {e}")
    finally:
        gc.collect()    # Force garbage collection

# Set the default config parameter
# XBee device configuration
DEFAULT_PORT = "/dev/ttyUSB0"  # Change this to your XBee COM port
DEFAULT_BAUD_RATE = 115200
DEFAULT_TIMEOUT_FOR_SYNC_OPERATIONS = 5 # 5 seconds
DEFAULT_CHUNK_SIZE = 255  # Set chunk size (in bytes)
# Timeout and retry settings
DEFAULT_ACK_TIMEOUT = 5  # Timeout in seconds to wait for ACK
DEFAULT_MAX_RETRIES = 3  # Max number of retries before giving up
# file monitoring setting
DEFAULT_MON_EXTENSION = ".png"

"""
Radio	                                Payload Size
====================================================
802.15.4/ XBee	                        94 Bytes
XTend	                                2048 Bytes
XTC (Xtend Compatible) and SX products	2048 Bytes
900 HP 	                                256 Bytes
"""

if __name__ == "__main__":
    if 'mon_dir' not in appConfXbee.config:
        raise Exception("'mon_dir' not found in config")
    directory_to_monitor = appConfXbee.config['mon_dir']

    if not os.path.exists(directory_to_monitor) or not os.path.isdir(directory_to_monitor):
        raise Exception("The directory \'", directory_to_monitor, "\' does not exist or is not a directory!")

    if 'mon_extension' not in appConfXbee.config:
        appConfXbee.config['mon_extension'] = DEFAULT_MON_EXTENSION

    monitor_directory(directory_to_monitor)