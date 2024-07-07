import io

from PIL import Image

from channel import Channel
from pb.response_pb2 import Response


class ImageChannel(Channel):
    def __init__(self, host: str, name: str):
        super().__init__(host, name)

    def handle_response(self, response: Response):
        # Write the collected binary parts when we receive all the expected parts
        with open("test.jpg", "wb") as f:
            f.write(response.imageData)
        image_stream = io.BytesIO(response.imageData)
        img = Image.open(image_stream)
        img.show()
        print("Successfully received image")


def main():
    # Initialize the communication channel
    channel = ImageChannel("rabbitmq", "image")

    # Start gathering image parts
    channel.start_subscribe()


if __name__ == "__main__":
    main()
