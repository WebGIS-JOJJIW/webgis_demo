import uuid
from datetime import datetime
from pathlib import Path

import click

from channel import Channel
from pb.response_pb2 import Response, SourceType


def get_datetime_from_timestamp(timestamp: int) -> str:
    return datetime.fromtimestamp(
        timestamp).strftime("%Y/%m/%d %H-%M-%S")


@click.command
@click.option("--broker", "-b", help="The AMQP broker to which the image is sent", default="rabbitmq")
@click.option("--event", "-e", help="ID of the event", required=True)
@click.option("--sensor", "-s", help="ID of the sensor", required=True)
@click.option("--text", "-t", help="Summary of the event", required=True)
def main(broker: str, event: str, sensor: str, text: str):
    # Create publish channel
    channel = Channel(broker, "image")

    # Create a new message
    response = Response()

    # Add UUID for the message
    response.messageUuid = str(uuid.uuid4())

    # Add UUID for the event
    response.eventUuid = event

    # Set sensor information
    response.sourceInfo.id = sensor
    response.sourceInfo.type = SourceType.CAMERA_SENSOR

    # Set timestamp (epoch time)
    dt = datetime.now()
    response.timestamp = int(dt.timestamp())

    # Set the content of the image to the message
    response.eventSummary.summary = text

    # Publish the reponse
    channel.send_response(response)

    print(
        f"""
Successfully sent text summary
    uuid:     {response.messageUuid}
    sensor:   {response.sourceInfo.id}
    datetime: {dt.strftime('%Y-%m-%d %H:%M:%S')}
""")


if __name__ == "__main__":
    main()
