x86: response_pb2.py
	@echo Build X86 successfully

aarch: protoc/aarch/bin/protoc response_pb2.py
	@echo Build AARCH successfully


PHONY: clean

clean:
	rm -f *_pb2.py
	@echo Clean successfully

protoc/x86/bin/protoc:
	protoc/setup.sh x86

protoc/aarch/bin/protoc:
	protoc/setup.sh aarch

response_pb2.py: response.proto
	protoc --python_out=. $<