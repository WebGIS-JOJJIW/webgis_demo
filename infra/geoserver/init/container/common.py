import json
import time
import xml.etree.ElementTree as ET
from abc import abstractmethod

BASE_URL = "http://geoserver:8080/geoserver/rest/"
GEOSERVER_ADMIN_ID = "admin"
GEOSERVER_ADMIN_PASSWD = "geoserver"
GEOSERVER_WORKSPACE = "gis"
GEOSERVER_DB_DATASOURCE = "gis_db"

WFS_BASE_URL = "http://geoserver:8080/geoserver/wfs/"


class Executer:
    DEFAULT_MAX_RETRY = 30
    DEFAULT_HOLD_OFF = 3

    def __init__(self):
        self.setDefaultMaxRetry()
        self.setDefaultHoldOff()

    def __init__(self, max_retry: int = DEFAULT_MAX_RETRY, hold_off: int = DEFAULT_HOLD_OFF):
        self.max_retry = max_retry
        self.hold_off = hold_off

    def setDefaultMaxRetry(self):
        self.max_retry = Executer.DEFAULT_MAX_RETRY

    def setDefaultHoldOff(self):
        self.hold_off = Executer.DEFAULT_HOLD_OFF

    # This should return True if retry is not needed, False otherwise.
    @abstractmethod
    def task(self, **kwargs) -> bool:
        raise NotImplementedError()

    def execute(self, **kwargs):
        if "max_retry" in kwargs:
            self.max_retry = kwargs["max_retry"]
        if "hold_off" in kwargs:
            self.hold_off = kwargs["hold_off"]
        retry = 0
        while (self.max_retry is None) or (retry < self.max_retry):
            if self.task(**kwargs):
                break
            retry += 1
            time.sleep(self.hold_off)
        if retry >= self.max_retry:
            raise Exception("Unable to complete task")


class JSONTemplate:
    def __init__(self, template_file: str):
        with open(template_file) as f:
            self.template = json.load(f)


class XMLTemplate:
    def __init__(self, template_file: str):
        self.tree = ET.parse(template_file)
        self.root = self.tree.getroot()

    def serialize(self):
        return ET.tostring(self.root, encoding='utf8')
