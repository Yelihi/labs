SRC := src/BeginCppLab.cpp
OUT := build/begin-cpp

.PHONY: run build clean

run: build
	./$(OUT)

build:
	mkdir -p build
	c++ -std=c++20 -Wall -Wextra -pedantic $(SRC) -o $(OUT)

clean:
	rm -rf build
