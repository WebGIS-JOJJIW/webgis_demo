import requests

from common import (GEOSERVER_ADMIN_ID, GEOSERVER_ADMIN_PASSWD, WFS_BASE_URL,
                    Executer, XMLTemplate)


class ModifySensorsRequest(XMLTemplate):
    def __init__(self, base_url: str):
        super().__init__("templates/modify_sensors.xml")
        self.url = base_url


class ModifySensors(Executer):
    def __init__(self, base_url: str):
        super().__init__()
        self.request = ModifySensorsRequest(base_url)

    def task(self, **kwargs):
        print(f"Modifying sensors at locations")
        headers = {'Content-Type': 'application/xml'}
        auth = requests.auth.HTTPBasicAuth(
            GEOSERVER_ADMIN_ID, GEOSERVER_ADMIN_PASSWD)
        response = requests.post(
            self.request.url, data=self.request.serialize(), headers=headers, auth=auth)
        if (response.status_code != 200):
            print(f"\tFailed with http status code {response.status_code}")
            return False
        if not "<wfs:totalUpdated>2</wfs:totalUpdated>" in response.text:
            raise Exception(
                f"Modifying sensor locations failed:\n{response.text}")
        return True


def main():
    ModifySensors(WFS_BASE_URL).execute()


if __name__ == "__main__":
    main()
