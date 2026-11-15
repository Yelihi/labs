SRC := src/RuntimeBasicsLab.cpp
OUT := build/runtime-basics

.PHONY: run build test clean

run: build
	./$(OUT)

build:
	mkdir -p build
	$(CXX) -std=c++20 -Wall -Wextra -pedantic $(SRC) -o $(OUT)

test: build
	sh tests/smoke.sh

clean:
	rm -rf build
