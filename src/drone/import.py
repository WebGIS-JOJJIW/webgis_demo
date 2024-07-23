import shutil
import uuid
from pathlib import Path
from urllib.parse import urljoin

import click
import exifread
import requests

from geoserver_lib.common import (BASE_URL, GEOSERVER_ADMIN_ID,
                                  GEOSERVER_ADMIN_PASSWD,
                                  GEOSERVER_DB_DATASOURCE, GEOSERVER_WORKSPACE,
                                  WFS_BASE_URL, Executer, JSONTemplate,
                                  XMLTemplate)

ARTIFACTORY_PATH = Path(__file__).parent / "drone_images"
ARTIFACTORY_PUBLIC_PATH = "drone_images"


def get_decimal_from_dms(dms, ref):
    degrees = dms[0].num / dms[0].den
    minutes = dms[1].num / dms[1].den / 60.0
    seconds = dms[2].num / dms[2].den / 3600.0

    if ref in ['S', 'W']:
        degrees = -degrees
        minutes = -minutes
        seconds = -seconds

    return degrees + minutes + seconds


def get_gps_coordinates(image_path):
    with open(image_path, 'rb') as f:
        tags = exifread.process_file(f)

    gps_latitude = tags.get('GPS GPSLatitude')
    gps_latitude_ref = tags.get('GPS GPSLatitudeRef')
    gps_longitude = tags.get('GPS GPSLongitude')
    gps_longitude_ref = tags.get('GPS GPSLongitudeRef')

    if not (gps_latitude and gps_latitude_ref and gps_longitude and gps_longitude_ref):
        return None, None

    lat = get_decimal_from_dms(gps_latitude.values, gps_latitude_ref.values)
    lon = get_decimal_from_dms(gps_longitude.values, gps_longitude_ref.values)

    return lat, lon


def iterate_files(directory):
    path = Path(directory)
    for file in path.rglob('*.jpg'):
        yield file
    for file in path.rglob('*.jpeg'):
        yield file


class CreateDroneImageLayerRequest(JSONTemplate):
    REST_PATH = f"workspaces/{GEOSERVER_WORKSPACE}/datastores/{GEOSERVER_DB_DATASOURCE}/featuretypes"

    def __init__(self, base_url: str):
        super().__init__("templates/create_layer.json")
        self.url = urljoin(base_url, CreateDroneImageLayerRequest.REST_PATH)


class CreateDroneImageLayer(Executer):
    def __init__(self, base_url: str):
        super().__init__()
        self.request = CreateDroneImageLayerRequest(base_url)

    def task(self, **kwargs):
        print(f"Creating drone image layer")
        if "layer" in kwargs:
            layer = kwargs["layer"]
            self.request.template["featureType"]["name"] = layer
            self.request.template["featureType"]["nativeName"] = layer
            self.request.template["featureType"]["title"] = layer
        auth = requests.auth.HTTPBasicAuth(
            GEOSERVER_ADMIN_ID, GEOSERVER_ADMIN_PASSWD)
        response = requests.post(
            self.request.url, json=self.request.template, auth=auth)
        if (response.status_code != 201):
            print(
                f"\tCreate layer failed with http status code {response.status_code}")
            return False

        put_url = urljoin(f"{self.request.url}/", layer)
        response = requests.put(
            put_url, json=self.request.template, auth=auth)
        if (response.status_code != 200):
            print(
                f"\tCustomizing layer failed with http status code {response.status_code}")
            return False
        return True


class InsertDroneImagesRequest(XMLTemplate):
    def __init__(self, base_url: str):
        super().__init__("templates/insert_points.xml")
        self.url = base_url


class InsertDroneImages(Executer):
    def __init__(self, base_url: str):
        super().__init__()
        self.request = InsertDroneImagesRequest(base_url)

    def task(self, **kwargs):
        print(f"Inserting sensors at locations")
        if not "layer" in kwargs:
            raise Exception("No layer specified")
        if not "coordinates" in kwargs:
            raise Exception("No coordinates specified")
        if not "artifact_path" in kwargs:
            raise Exception("No artifact path specified")

        # Modify XML tag to reflect the name of the specified layer
        layer_tags = self.request.root.findall(".//{gis}drone_images")
        if not layer_tags or len(layer_tags) <= 0:
            raise Exception("Cannot find layer tag in XML")
        layer_tags[0].tag = "{gis}" + kwargs["layer"]

        # Modify the coordinates to the specified ones
        coordinates_tags = self.request.root.findall(
            ".//{http://www.opengis.net/gml}coordinates")
        if not coordinates_tags or len(coordinates_tags) <= 0:
            raise Exception("Cannot find coordinates tag in XML")
        coordinates_tags[0].text = kwargs["coordinates"]

        # Modify XML tag to reflect the name of the specified layer
        imrel_tags = self.request.root.findall(".//{gis}image_relpath")
        if not imrel_tags or len(imrel_tags) <= 0:
            raise Exception("Cannot find layer tag in XML")
        imrel_tags[0].text = kwargs["artifact_path"]

        # Send WFS-T to GeoServer
        headers = {'Content-Type': 'application/xml'}
        auth = requests.auth.HTTPBasicAuth(
            GEOSERVER_ADMIN_ID, GEOSERVER_ADMIN_PASSWD)
        response = requests.post(
            self.request.url, data=self.request.serialize(), headers=headers, auth=auth)
        if (response.status_code != 200):
            print(
                f"\tImage insertion failed with http status code {response.status_code}")
            print(f"===BODY===\n{self.request.serialize()}")
            print(f"===RESPONSE===\n{response.text}")
            return False
        if not "<wfs:totalInserted>1</wfs:totalInserted>" in response.text:
            raise Exception(
                f"Image insertion failed:\n{response.text}")
        return True


def copy_file_to_artifactory(file_path: str) -> str:
    dst_file = f"{str(uuid.uuid4())}.jpg"
    dst_path = ARTIFACTORY_PATH / dst_file
    shutil.copy(file_path, dst_path)
    print(f"Copied {file_path} ---> {dst_path}")
    return f"{ARTIFACTORY_PUBLIC_PATH}/{dst_file}"


@click.command
@click.option("--directory", "-d", help="Directory containing JPEG images", default="./")
@click.option("--layer", "-l", help="Name of vector layer on GeoServer", required=True)
def main(directory, layer):

    CreateDroneImageLayer(BASE_URL).execute(layer=layer)

    for file_path in iterate_files(directory):
        lat, lon = get_gps_coordinates(file_path)
        if lat and lon:
            print(f"File: {file_path}, Latitude: {lat}, Longitude: {lon}")
            artifact_path = copy_file_to_artifactory(file_path)
            InsertDroneImages(WFS_BASE_URL).execute(
                layer=layer, coordinates=f"{lon},{lat}", artifact_path=artifact_path)
        else:
            print(f"File: {file_path} has no GPS information.")


if __name__ == "__main__":
    main()
