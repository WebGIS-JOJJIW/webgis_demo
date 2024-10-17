import time
import os
from digi.xbee.devices import XBeeDevice, XBee64BitAddress
from util_xBee import XBeeReceiver, DataCleanupService, DataStoreService
from util_fileMon import Config, archive_img

# load config
appConfXbee = Config()
appConfXbee.load("config/conf_xBee.json")

# XBee device configuration
PORT = (f"{appConfXbee.config['rx_port']}")  # Update with the appropriate port for your system
BAUD_RATE = appConfXbee.config['rx_baudrate']
SRC_ADDRESS = XBee64BitAddress.from_hex_string(f"{appConfXbee.config['rx_from_src_addr']}")  # Source address for this receiver

# Output directory for received image
OUTPUT_IMAGE = (f"{appConfXbee.config['rx_output_dir']}")
WRITE_EXTENSION = (f"{appConfXbee.config['rx_write_extension']}")

# Initialize XBee device
device = XBeeDevice(PORT, BAUD_RATE)

if __name__ == "__main__":

    print(f"""
    ========
    {os.path.basename(__file__)} Begin Rx monitoring..
    ========
    """)
        
    try:
        # Initialize the XBeeReceiver with the device and the output directory
        xbee_receiver = XBeeReceiver(device, output_path=OUTPUT_IMAGE, sync_timeout=5, device_sync_ops_timeout=5, save_extension=WRITE_EXTENSION)

        # Start the data cleanup service (removes stale/incomplete data)
        cleanup_service = DataCleanupService(receiver=xbee_receiver, interval=5, timeout=5)
        cleanup_service.start()

        # Start the data storage service (processes and saves completed data)
        # auto_store_service = DataStoreService(receiver=xbee_receiver, interval=5)
        auto_store_service = DataStoreService(receiver=xbee_receiver)
        auto_store_service.start()

        # Start receiving data
        xbee_receiver.receive_data()

    except Exception as e:
        print(f"Error: {e}")

    finally:
        # Stop the cleanup and storage services before exiting
        cleanup_service.stop()
        auto_store_service.stop()
        cleanup_service.join()
        auto_store_service.join()

        # Ensure the XBee device is properly closed
        if device.is_open():
            device.close()
