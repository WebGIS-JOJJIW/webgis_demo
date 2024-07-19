from urllib.parse import urljoin

import requests

from common import (BASE_URL, GEOSERVER_ADMIN_ID, GEOSERVER_ADMIN_PASSWD,
                    GEOSERVER_DB_DATASOURCE, GEOSERVER_WORKSPACE, WFS_BASE_URL,
                    Executer, JSONTemplate, XMLTemplate)


class CreateSensorLayerRequest(JSONTemplate):
    REST_PATH = f"workspaces/{GEOSERVER_WORKSPACE}/datastores/{GEOSERVER_DB_DATASOURCE}/featuretypes"

    def __init__(self, base_url: str):
        super().__init__("templates/sensor_layer.json")
        self.url = urljoin(base_url, CreateSensorLayerRequest.REST_PATH)


class CreateSensorLayer(Executer):
    def __init__(self, base_url: str):
        super().__init__()
        self.request = CreateSensorLayerRequest(base_url)

    def task(self, **kwargs):
        print(f"Creating sensor layer")
        auth = requests.auth.HTTPBasicAuth(
            GEOSERVER_ADMIN_ID, GEOSERVER_ADMIN_PASSWD)

        response = requests.post(
            self.request.url, json=self.request.template, auth=auth)
        if (response.status_code != 201):
            print(f"\tFailed with http status code {response.status_code}")
            print(f"===BODY===\n{self.request.template}")
            print(f"===RESPONSE===\n{response.text}")
            return False

        put_url = urljoin(f"{self.request.url}/", "sensors")
        response = requests.put(
            put_url, json=self.request.template, auth=auth)
        if (response.status_code != 200):
            print(f"\tFailed with http status code {response.status_code}")
            return False
        return True


class InsertSensorsRequest(XMLTemplate):
    def __init__(self, base_url: str):
        super().__init__("templates/insert_sensors.xml")
        self.url = base_url


class InsertSensors(Executer):
    def __init__(self, base_url: str):
        super().__init__()
        self.request = InsertSensorsRequest(base_url)

    def task(self, **kwargs):
        print(f"Inserting sensors at locations")
        headers = {'Content-Type': 'application/xml'}
        auth = requests.auth.HTTPBasicAuth(
            GEOSERVER_ADMIN_ID, GEOSERVER_ADMIN_PASSWD)
        response = requests.post(
            self.request.url, data=self.request.serialize(), headers=headers, auth=auth)
        if (response.status_code != 200):
            print(f"\tFailed with http status code {response.status_code}")
            print(f"===BODY===\n{self.request.serialize()}")
            print(f"===RESPONSE===\n{response.text}")
            return False
        if not "<wfs:totalInserted>2</wfs:totalInserted>" in response.text:
            raise Exception(
                f"Inserting sensor locations failed:\n{response.text}")
        return True


def main():
    CreateSensorLayer(BASE_URL).execute()
    InsertSensors(WFS_BASE_URL).execute()


if __name__ == "__main__":
    main()
