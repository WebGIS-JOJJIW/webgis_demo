from channel import Channel
from pb.response_pb2 import Response
from ingester import Ingester


class ImageChannel(Channel):
    def __init__(self, host: str, name: str):
        super().__init__(host, name)

    def handle_response(self, response: Response):
        print("Received image")
        Ingester(response.imageData, response.sourceInfo.id,
                 response.timestamp).publish()
        print("Successfully notify Streamer")


def main():
    # Initialize the communication channel
    channel = ImageChannel("rabbitmq", "image")

    # Start gathering image parts
    channel.start_subscribe()


if __name__ == "__main__":
    main()
