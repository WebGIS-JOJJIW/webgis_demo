from urllib.parse import urljoin

import requests

from common import (BASE_URL, GEOSERVER_ADMIN_ID, GEOSERVER_ADMIN_PASSWD,
                    GEOSERVER_DB_DATASOURCE, GEOSERVER_WORKSPACE, Executer,
                    JSONTemplate)

############################# Workspace Creation #############################


class CreateWorkspaceRequest(JSONTemplate):
    WORKSPACE_PATH = "workspaces"

    def __init__(self, base_url: str):
        super().__init__("templates/workspace_create.json")
        self.url = urljoin(base_url, CreateWorkspaceRequest.WORKSPACE_PATH)

    def setWorkspace(self, workspace: str):
        self.template["workspace"]["name"] = workspace


class CreateWorkspace(Executer):
    def __init__(self, base_url: str):
        super().__init__()
        self.request = CreateWorkspaceRequest(base_url)

    def task(self, **kwargs):
        if not "workspace" in kwargs:
            raise Exception("Workspace not specified")
        workspace = kwargs["workspace"]
        self.request.setWorkspace(workspace)
        print(f"Creating workspace {workspace}")
        auth = requests.auth.HTTPBasicAuth(
            GEOSERVER_ADMIN_ID, GEOSERVER_ADMIN_PASSWD)
        response = requests.post(
            self.request.url, json=self.request.template, auth=auth)
        if (response.status_code != 201):
            print(f"\tFailed with http status code {response.status_code}")
            return False
        return True


############################# Enable WCS #############################

class EnableWCSRequest(JSONTemplate):
    REST_PATH = "services/wcs/workspaces/{}/settings"

    def __init__(self, base_url: str, workspace: str):
        super().__init__("templates/wcs_enabled.json")
        self.url = urljoin(
            base_url, EnableWCSRequest.REST_PATH.format(workspace))


class EnableWCS(Executer):
    def __init__(self, base_url: str):
        super().__init__()
        self.base_url = base_url

    def task(self, **kwargs):
        if not "workspace" in kwargs:
            raise Exception("Workspace not spcified")
        self.workspace = kwargs["workspace"]
        self.request = EnableWCSRequest(self.base_url, self.workspace)
        print(f"Enable WCS service on workspace {self.workspace}")
        auth = requests.auth.HTTPBasicAuth(
            GEOSERVER_ADMIN_ID, GEOSERVER_ADMIN_PASSWD)
        response = requests.put(
            self.request.url, json=self.request.template, auth=auth)
        if (response.status_code != 200):
            print(f"\tFailed with http status code {response.status_code}")
            return False
        return True


############################# Enable WFS #############################

class EnableWFSRequest(JSONTemplate):
    REST_PATH = "services/wfs/workspaces/{}/settings"

    def __init__(self, base_url: str, workspace: str):
        super().__init__("templates/wfs_enabled.json")
        self.url = urljoin(
            base_url, EnableWFSRequest.REST_PATH.format(workspace))


class EnableWFS(Executer):
    def __init__(self, base_url: str):
        super().__init__()
        self.base_url = base_url

    def task(self, **kwargs):
        if not "workspace" in kwargs:
            raise Exception("Workspace not spcified")
        self.workspace = kwargs["workspace"]
        self.request = EnableWFSRequest(self.base_url, self.workspace)
        print(f"Enable WFS service on workspace {self.workspace}")
        auth = requests.auth.HTTPBasicAuth(
            GEOSERVER_ADMIN_ID, GEOSERVER_ADMIN_PASSWD)
        response = requests.put(
            self.request.url, json=self.request.template, auth=auth)
        if (response.status_code != 200):
            print(f"\tFailed with http status code {response.status_code}")
            return False
        return True


############################# Enable WMS #############################

class EnableWMSRequest(JSONTemplate):
    REST_PATH = "services/wms/workspaces/{}/settings"

    def __init__(self, base_url: str, workspace: str):
        super().__init__("templates/wms_enabled.json")
        self.url = urljoin(
            base_url, EnableWMSRequest.REST_PATH.format(workspace))


class EnableWMS(Executer):
    def __init__(self, base_url: str):
        super().__init__()
        self.base_url = base_url

    def task(self, **kwargs):
        if not "workspace" in kwargs:
            raise Exception("Workspace not spcified")
        self.workspace = kwargs["workspace"]
        self.request = EnableWMSRequest(self.base_url, self.workspace)
        print(f"Enable WMS service on workspace {self.workspace}")
        auth = requests.auth.HTTPBasicAuth(
            GEOSERVER_ADMIN_ID, GEOSERVER_ADMIN_PASSWD)
        response = requests.put(
            self.request.url, json=self.request.template, auth=auth)
        if (response.status_code != 200):
            print(f"\tFailed with http status code {response.status_code}")
            return False
        return True

############################# Enable WMTS #############################


class EnableWMTSRequest(JSONTemplate):
    REST_PATH = "services/wmts/workspaces/{}/settings"

    def __init__(self, base_url: str, workspace: str):
        super().__init__("templates/wmts_enabled.json")
        self.url = urljoin(
            base_url, EnableWMTSRequest.REST_PATH.format(workspace))


class EnableWMTS(Executer):
    def __init__(self, base_url: str):
        super().__init__()
        self.base_url = base_url

    def task(self, **kwargs):
        if not "workspace" in kwargs:
            raise Exception("Workspace not spcified")
        self.workspace = kwargs["workspace"]
        self.request = EnableWMTSRequest(self.base_url, self.workspace)
        print(f"Enable WMTS service on workspace {self.workspace}")
        auth = requests.auth.HTTPBasicAuth(
            GEOSERVER_ADMIN_ID, GEOSERVER_ADMIN_PASSWD)
        response = requests.put(
            self.request.url, json=self.request.template, auth=auth)
        if (response.status_code != 200):
            print(f"\tFailed with http status code {response.status_code}")
            return False
        return True


############################# Datasource Creation #############################


class CreateDatasourceRequest(JSONTemplate):
    REST_PATH = "workspaces/{}/datastores"

    def __init__(self, base_url: str):
        super().__init__("templates/datasource_create.json")
        self.base_url = base_url

    def setConfiguration(self, workspace, datasource_name, **kwargs):
        self.url = urljoin(
            self.base_url, CreateDatasourceRequest.REST_PATH.format(workspace))
        self.template["dataStore"]["name"] = datasource_name

        def setParam(**kwargs):
            for key, value in kwargs.items():
                for param in self.template["dataStore"]["connectionParameters"]["entry"]:
                    if param["@key"] == key:
                        param["@key"] == value
                        break
        if "namespace" in kwargs:
            setParam(namespace=kwargs["namespace"])


class CreateDatasource(Executer):
    def __init__(self, base_url: str):
        super().__init__()
        self.request = CreateDatasourceRequest(base_url)

    def task(self, **kwargs):
        if not "workspace" in kwargs:
            raise Exception("Workspace not specified")
        workspace = kwargs["workspace"]
        kwargs["namespace"] = workspace
        if not "datasource_name" in kwargs:
            raise Exception("Datsource name not specified")
        datasource_name = kwargs["datasource_name"]
        self.request.setConfiguration(**kwargs)
        print(
            f"Create datasource '{datasource_name}' in workspace '{workspace}'")
        auth = requests.auth.HTTPBasicAuth(
            GEOSERVER_ADMIN_ID, GEOSERVER_ADMIN_PASSWD)
        response = requests.post(
            self.request.url, json=self.request.template, auth=auth)
        if (response.status_code != 201):
            print(f"\tFailed with http status code {response.status_code}")
            return False
        return True


def main():
    CreateWorkspace(BASE_URL).execute(workspace=GEOSERVER_WORKSPACE)
    EnableWCS(BASE_URL).execute(workspace=GEOSERVER_WORKSPACE)
    EnableWFS(BASE_URL).execute(workspace=GEOSERVER_WORKSPACE)
    EnableWMS(BASE_URL).execute(workspace=GEOSERVER_WORKSPACE)
    EnableWMTS(BASE_URL).execute(workspace=GEOSERVER_WORKSPACE)
    CreateDatasource(BASE_URL).execute(
        workspace=GEOSERVER_WORKSPACE, datasource_name=GEOSERVER_DB_DATASOURCE)


if __name__ == "__main__":
    main()
