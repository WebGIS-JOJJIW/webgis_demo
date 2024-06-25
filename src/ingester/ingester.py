import json
import shutil
from datetime import datetime
from pathlib import Path

import psycopg2
import redis

# ARTIFACT_SERVE
SCRIPT_PATH = Path(__file__).absolute()
ARTIFACTORY_PATH = SCRIPT_PATH.parent / ".." / \
    ".." / "infra" / "artifact_serve/data"

# IMAGE_DB
IMAGE_DB_HOST = "gis-db"
IMAGE_DB_USER = "admin"
IMAGE_DB_PASSWD = "geoserver"
IMAGE_DB = "image_db"


# REDIS
REDIS_HOST = "redis"
SENSOR_REGION = "region_0"
SENSOR_TYPE = "still_images"
STREAM_NAME = f"{SENSOR_REGION}:{SENSOR_TYPE}"
CHANNEL_NAME = f"{SENSOR_REGION}:{SENSOR_TYPE}:notify"


class Ingester:
    def __init__(self, image_path: Path, sensor: str, timestamp: int):
        self._image_path = image_path
        self._sensor = sensor
        self._timestamp = timestamp

    def _save_image_to_artifactory(self, image_path: Path, sensor: str, timestamp: int) -> Path:
        artifact_name = f"{sensor}_{str(timestamp)}.jpg"
        artifact_path = ARTIFACTORY_PATH / artifact_name
        print(f"Copying '{str(image_path)}' to '{str(artifact_path)}'")
        shutil.copy(str(image_path), str(artifact_path))
        return artifact_path.relative_to(ARTIFACTORY_PATH)

    def _save_image_metadata_to_db(self, sensor: str, image_url: str, timestamp: int) -> int:
        captured_ts = datetime.fromtimestamp(
            timestamp).strftime("%Y-%m-%d %H:%M:%S")
        connection_params = {
            "dbname": IMAGE_DB,
            "user": IMAGE_DB_USER,
            "password": IMAGE_DB_PASSWD,
            "host": IMAGE_DB_HOST,
            "port": "5432"
        }
        conn = psycopg2.connect(**connection_params)
        conn.autocommit = True

        insert_query = """
            INSERT INTO still_images (sensor_id, image_url, captured_ts) VALUES (%s, %s, %s) RETURNING id;
        """
        with conn.cursor() as cursor:
            cursor.execute(insert_query, (sensor, image_url, captured_ts))
            db_primary_key = cursor.fetchone()[0]
        conn.commit()
        conn.close()
        return db_primary_key

    def _publish_image_metadata_to_channel(self, db_primary_key: int, sensor: str, image_url: str, timestamp: int):
        r = redis.StrictRedis(host=REDIS_HOST, port=6379, db=0)
        image_meta = {
            "id": db_primary_key,
            "sensor_id": sensor,
            "image_url": image_url,
            "timestamp": timestamp
        }
        r.xadd(STREAM_NAME, image_meta)
        r.publish(CHANNEL_NAME, json.dumps(image_meta))

    def publish(self):
        artifact_relpath = self._save_image_to_artifactory(
            self._image_path, self._sensor, self._timestamp
        )
        db_primary_key = self._save_image_metadata_to_db(
            self._sensor, str(artifact_relpath), self._timestamp
        )
        self._publish_image_metadata_to_channel(
            db_primary_key, self._sensor, str(
                artifact_relpath), self._timestamp
        )
