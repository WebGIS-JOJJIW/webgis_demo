import sys
import uuid
from datetime import datetime
from pathlib import Path

import click

from ingester import Ingester
from pb.response_pb2 import Response, SourceType


def gracefully_exit(msg: str):
    print(f"Error: {msg}")
    sys.exit(-1)


@click.command
@click.option("--event", "-e", help="Event ID", type=str, required=True)
@click.option("--sensor", "-s", help="Sensor ID publising the image", type=str, required=True)
@click.option("--comment", "-c", help="Text message to send", type=str, required=True)
@click.option("--timestamp", "-t", help="Timestamp of the captured image", type=int, default=None)
@click.option("--host", "-h", help="Streamer hostname", type=str, default=None)
def main(event: str, sensor: str, comment: str, timestamp: int, host: str):

    if not timestamp:
        timestamp = int(datetime.now().timestamp())

    sensor = sensor.strip()
    if sensor == "" or sensor.isspace():
        gracefully_exit("Sensor ID is invalid")

    print(f"Event         : {event}")
    print(f"Sensor        : {sensor}")
    print(f"Captured time : {timestamp}")
    print(f"Text          : {comment}")

    response = Response()
    response.messageUuid = str(uuid.uuid4())
    response.eventUuid = event
    response.sourceInfo.id = sensor
    response.sourceInfo.type = SourceType.CAMERA_SENSOR
    response.timestamp = timestamp
    response.eventSummary.summary = comment

    ingester = Ingester(response)
    if host:
        ingester._streamer_host = host
    ingester.publish()


if __name__ == "__main__":
    main()
