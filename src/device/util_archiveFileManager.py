import time
import threading
from pathlib import Path
from sched import scheduler

class ArchiveCleanupScheduler:
    def __init__(self, directory: str, extension: str = ".jpgX", expiration_hours: int = 20, check_interval_seconds: int = 3600):
        self.directory = directory
        self.extension = extension
        self.expiration_seconds = int(expiration_hours * 3600)  # Convert hours to seconds
        self.check_interval_seconds = int(check_interval_seconds)
        self.sched_obj = scheduler(time.time, time.sleep)
        self.stop_event = threading.Event()  # Event to signal stopping the scheduler

    def _delete_expired_files(self):
        current_time = time.time()

        # Find and delete expired files
        expired_files = [
            file for file in Path(self.directory).glob(f'*{self.extension}')
            if file.is_file() and (current_time - file.stat().st_ctime) > self.expiration_seconds
        ]

        for file in expired_files:
            try:
                file.unlink()  # Remove file
                print(f"Deleted expired file: {file}")
            except Exception as e:
                print(f"Error deleting {file}: {e}")

    def _schedule_cleanup(self):
        # Run the deletion task
        self._delete_expired_files()
        
        # Reschedule the next cleanup if the stop event is not set
        if not self.stop_event.is_set():
            self.sched_obj.enter(self.check_interval_seconds, 1, self._schedule_cleanup)

    def start(self):
        # Schedule the first cleanup immediately and start the scheduler
        self.sched_obj.enter(0, 1, self._schedule_cleanup)
        print(f"Started archive cleanup for directory: {self.directory}, file extension: {self.extension}")
        self.sched_obj.run()

    def stop(self):
        # Signal the scheduler to stop and clear the event queue
        self.stop_event.set()
        self.sched_obj.queue.clear()
        
        # Add a noop (no-operation) event to force the scheduler to wake up
        self.sched_obj.enter(0, 1, lambda: None)
        print(f"Stopped archive cleanup for directory: {self.directory}, file extension: {self.extension}")

# Example usage
#     archive_cleanup_scheduler = ArchiveCleanupScheduler(directory="/path/to/archive")
#     archive_cleanup_scheduler.start()
