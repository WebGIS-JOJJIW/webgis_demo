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
@click.option("--image", "-i", help="File name of the image to send", required=True)
def main(broker: str, image: str):
    image_file = Path(image)
    file_size = image_file.stat().st_size
    if not image_file.is_file():
        raise Exception("Cannot find specified image file")

    # Load the image to be sent
    with open(str(image_file), "rb") as f:
        bin_content = f.read()

    # Create publish channel
    channel = Channel(broker, "image")

    # Create a new message
    response = Response()

    # Add UUID for the message
    response.messageUuid = str(uuid.uuid4())

    # Set the type of the sensor to camera sensor
    response.sourceInfo.type = SourceType.CAMERA_SENSOR

    # Set timestamp (epoch time)
    dt = datetime.now()
    response.timestamp = int(dt.timestamp())

    # Set the content of the image to the message
    response.imageData = bin_content

    # Publish the reponse
    channel.send_response(response)

    print(
        f"""
Successfully sent message
    uuid:     {response.messageUuid}
    datetime: {dt.strftime('%Y-%m-%d %H:%M:%S')}
""")


if __name__ == "__main__":
    main()
