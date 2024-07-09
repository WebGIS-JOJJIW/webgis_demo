import sys
from datetime import datetime
from pathlib import Path

import click

from ingester import Ingester


def gracefully_exit(msg: str):
    print(f"Error: {msg}")
    sys.exit(-1)


@click.command
@click.option("--image", "-i", help="Filename of JPEG image to publish", type=str, required=True)
@click.option("--sensor", "-s", help="Sensor ID publising the image", type=str, required=True)
@click.option("--timestamp", "-t", help="Timestamp of the captured image", type=int, default=None)
@click.option("--host", "-h", help="Streamer hostname", type=str, default=None)
def main(image: str, sensor: str, timestamp: int, host: str):

    if not timestamp:
        timestamp = int(datetime.now().timestamp())

    sensor = sensor.strip()
    if sensor == "" or sensor.isspace():
        gracefully_exit("Sensor ID is invalid")

    image_path = Path(image)
    if not image_path.exists() or not image_path.is_file():
        gracefully_exit(f"Image file does not exist: {str(image_path)}")

    print(f"Image         : {str(image_path)}")
    print(f"Sensor        : {sensor}")
    print(f"Captured time : {timestamp}")

    ingester = Ingester(image_path, sensor, timestamp)
    if host:
        ingester._streamer_host = host
    ingester.publish()


if __name__ == "__main__":
    main()
