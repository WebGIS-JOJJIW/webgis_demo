import json
from datetime import datetime
from pathlib import Path

import requests

# ARTIFACT_SERVE
SCRIPT_PATH = Path(__file__).absolute()
ARTIFACTORY_ROOT_PATH = SCRIPT_PATH.parent / ".." / \
    ".." / "infra" / "artifact_serve/data"
ARTIFACTORY_PATH = ARTIFACTORY_ROOT_PATH / "sensor_images"

# STREAMER
STREAMER_ENDPOINT = "http://{}:3001/sensor_data"


class Ingester:
    def __init__(self, image_bin: bytes, sensor: str, timestamp: int):
        self._image_bin = image_bin
        self._sensor = sensor
        self._timestamp = timestamp
        self._streamer_host = "api"

    def _save_image_to_artifactory(self, image_bin: bytes, sensor: str, timestamp: int) -> Path:
        artifact_name = f"{sensor}_{str(timestamp)}.jpg"
        artifact_path = ARTIFACTORY_PATH / artifact_name
        print(f"Saving image binary to '{str(artifact_path)}'")
        with open(artifact_path, "wb") as f:
            f.write(image_bin)
        return artifact_path.relative_to(ARTIFACTORY_ROOT_PATH)

    def _notify_streamer(self, sensor: str, image_url: str, timestamp: int) -> int:
        captured_ts = datetime.fromtimestamp(
            timestamp).strftime("%Y-%m-%d %H:%M:%S")
        data = {
            "sensor_data": {
                "sensor_name": sensor,
                "sensor_poi_id": sensor,
                "sensor_type_name": "camara sensor",
                "region_name": "region1",
                "data_type_name": "image",
                "value": image_url,
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
        artifact_relpath = self._save_image_to_artifactory(
            self._image_bin, self._sensor, self._timestamp
        )
        self._notify_streamer(
            self._sensor, str(artifact_relpath), self._timestamp
        )
