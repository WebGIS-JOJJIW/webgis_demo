import json
from datetime import datetime
from pathlib import Path

import requests

from pb.response_pb2 import Response

# ARTIFACT_SERVE
SCRIPT_PATH = Path(__file__).absolute()
ARTIFACTORY_ROOT_PATH = SCRIPT_PATH.parent / ".." / \
    ".." / "infra" / "artifact_serve/data"
ARTIFACTORY_PATH = ARTIFACTORY_ROOT_PATH / "sensor_images"

# STREAMER
STREAMER_ENDPOINT = "http://{}:3001/sensor_data"


class Ingester:
    def __init__(self, response: Response):
        self._response = response
        self._event_id = response.eventUuid
        self._sensor = response.sourceInfo.id
        self._timestamp = response.timestamp
        self._streamer_host = "api"

    def _save_image_to_artifactory(self, image_bin: bytes, sensor: str, timestamp: int) -> Path:
        artifact_name = f"{sensor}_{str(timestamp)}.jpg"
        artifact_path = ARTIFACTORY_PATH / artifact_name
        print(f"Saving image binary to '{str(artifact_path)}'")
        with open(artifact_path, "wb") as f:
            f.write(image_bin)
        return artifact_path.relative_to(ARTIFACTORY_ROOT_PATH)

    def _notify_streamer(self, event_id: str, sensor: str, pub_value: str, timestamp: int, is_summary=True) -> int:
        captured_ts = datetime.fromtimestamp(
            timestamp).strftime("%Y-%m-%d %H:%M:%S")
        data = {
            "sensor_data": {
                "event_id": event_id,
                "sensor_name": sensor,
                "sensor_poi_id": sensor,
                "sensor_type_name": "camara sensor",
                "region_name": "region1",
                "data_type_name": "summary" if is_summary else "image",
                "value": pub_value,
                "dt": captured_ts
            }
        }
        json_data = json.dumps(data)

        # Notify the streamer through its sensor_data API
        endpoint = STREAMER_ENDPOINT.format(self._streamer_host)
        response = requests.post(endpoint, data=json_data, headers={
                                 'Content-Type': 'application/json'})
        print(response.status_code)
        print(response.json())

    def publish(self):
        event_info_type = self._response.WhichOneof('eventInfo')
        if event_info_type == 'eventImages':
            relpath = self._save_image_to_artifactory(
                self._response.eventImages.imageData[0], self._sensor, self._timestamp
            )
            self._notify_streamer(
                self._event_id, self._sensor, str(relpath), self._timestamp, is_summary=False
            )
        elif event_info_type == "eventSummary":
            summary_text = self._response.eventSummary.summary
            self._notify_streamer(
                self._event_id, self._sensor, summary_text, self._timestamp
            )
        else:
            print("Not publishing anything")
            return
