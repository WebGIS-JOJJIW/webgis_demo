all: response_pb2.py
	@echo Build successfully

PHONY: clean

clean:
	rm -f *_pb2.py
	@echo Clean successfully

response_pb2.py: response.proto
	protoc --python_out=. $<