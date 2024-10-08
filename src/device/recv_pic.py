import io
from datetime import datetime

from channel import Channel
from pb.response_pb2 import Response


def get_filename_from_timestamp(timestamp: int) -> str:
    return datetime.fromtimestamp(
        timestamp).strftime("%m%d_%H-%M-%S.jpg")


def get_datetime_from_timestamp(timestamp: int) -> str:
    return datetime.fromtimestamp(
        timestamp).strftime("%Y/%m/%d %H-%M-%S")


class ImageChannel(Channel):
    def __init__(self, host: str, name: str):
        super().__init__(host, name)

    def handle_response(self, response: Response):
        filename = get_filename_from_timestamp(response.timestamp)
        dt = get_datetime_from_timestamp(response.timestamp)

        event_info_type = response.WhichOneof('eventInfo')
        if event_info_type == 'eventImages':
            # Write the collected binary parts when we receive all the expected parts
            with open(filename, "wb") as f:
                f.write(response.eventImages.imageData[0])
            print(
                f"""
    Successfully received image
        uuid:     {response.messageUuid}
        datetime: {dt}
        Saved at: {filename}
    """)
        elif event_info_type == "eventSummary":
            print(f"Receiving text: {response.eventSummary.summary}")


def main():
    # Initialize the communication channel
    channel = ImageChannel("rabbitmq", "image")

    # Start gathering image parts
    channel.start_subscribe()


if __name__ == "__main__":
    main()
