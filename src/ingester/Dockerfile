from python:3.12.4-alpine3.20

RUN mkdir -p /dep; mkdir -p /data
COPY requirements.txt /dep
RUN pip3 install -r /dep/requirements.txt