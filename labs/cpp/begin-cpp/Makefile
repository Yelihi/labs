SRC := src/BeginCppLab.cpp
OUT := build/begin-cpp

.PHONY: run build test clean

run: build
	./$(OUT)

build:
	mkdir -p build
	c++ -std=c++20 -Wall -Wextra -pedantic $(SRC) -o $(OUT)

test: build
	sh tests/smoke.sh

clean:
	rm -rf build
