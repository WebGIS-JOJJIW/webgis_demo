import os
import threading

from util_fileMon import Config
from util_archiveFileManager import *

# Create an event to keep the main thread alive
shutdown_event = threading.Event()

if __name__ == '__main__':
    try:
        appConf = Config()
        appConf.load("config/conf_imageOP.json")

        if 'mon_dir' not in appConf.config:
            raise Exception("'mon_dir' not found in config")

        # Initialize and start ArchiveCleanupScheduler for monitoring and output directories
        mon_archive_cleanup_sched = ArchiveCleanupScheduler(
            directory = appConf.config['mon_dir'], 
            extension = f"{appConf.config['mon_extension']}X", 
            expiration_hours = float(appConf.config['mon_file_expire_hour']), 
            check_interval_seconds = float(appConf.config['mon_check_interval_sec'])
        )

        output_archive_cleanup_sched = ArchiveCleanupScheduler(
            directory = appConf.config['output_dir'], 
            extension = f"{appConf.config['write_extension']}X",
            expiration_hours = float(appConf.config['output_file_expire_hour']),
            check_interval_seconds = float(appConf.config['output_check_interval_sec'])
        )
        
        # Start the archive cleanup schedulers in threads
        threading.Thread(target=mon_archive_cleanup_sched.start, name=f"{appConf.config['mon_extension']}X", daemon=True).start()
        threading.Thread(target=output_archive_cleanup_sched.start, name=f"{appConf.config['write_extension']}X", daemon=True).start()

        # Wait indefinitely, allowing the signal handler to stop the script gracefully
        shutdown_event.wait()

    except KeyboardInterrupt:
        print(f"\n{os.path.basename(__file__)}: Interrupt autorun by user. Exiting...")

    except Exception as e:
        print(f"Error while running scripts: {e}")
    
    finally:
        # Ensure the scheduler stops when the main program exits
        mon_archive_cleanup_sched.stop()
        output_archive_cleanup_sched.stop()
