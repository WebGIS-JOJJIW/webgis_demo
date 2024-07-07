from pathlib import Path

import click

from channel import Channel
from pb.response_pb2 import Response


@click.command
@click.option("--image", "-i", help="File name of the image to send", required=True)
def main(image: str):
    image_file = Path(image)
    file_size = image_file.stat().st_size
    if not image_file.is_file():
        raise Exception("Cannot find specified image file")

    # Load the image to be sent
    with open(str(image_file), "rb") as f:
        bin_content = f.read()

    # Create publish channel
    channel = Channel("rabbitmq", "image")

    # Create a new message
    response = Response()
    response.messageUuid = "1"
    # response.sourceInfo.type
    response.imageData = bin_content

    # Publish the reponse
    channel.send_response(response)


if __name__ == "__main__":
    main()
