import click
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
        # Replace the location of the sensors with the specified coordinates
        def find_tag(tag: str):
            tag_list = sub_tree.findall(f".//{tag}")
            if not tag_list or len(tag_list) > 1:
                raise Exception("Error parsing XML")
            return tag_list[0]

        for sub_tree in self.request.root:
            literal = find_tag("{http://www.opengis.net/ogc}Literal")
            coordinates = find_tag("{http://www.opengis.net/gml}coordinates")
            if not literal.text in kwargs:
                raise Exception(f"Cannot find sensor '{literal.text}'")
            new_loc = kwargs[literal.text]
            coordinates.text = new_loc
            print(f"Moving {literal.text} to {new_loc}")

        # Make WFS request
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


@click.command
@click.option("--s1", help="Location of sensor1", default="13.670468,102.555173")
@click.option("--s2", help="Location of sensor2", default="13.657495,102.550220")
def main(s1: str, s2: str):
    def clean_loc_input(loc_str: str):
        loc = [element.strip() for element in loc_str.split(",")]
        return f"{loc[1]},{loc[0]}"
    ModifySensors(WFS_BASE_URL).execute(
        sensor1=clean_loc_input(s1), sensor2=clean_loc_input(s2))


if __name__ == "__main__":
    main()
