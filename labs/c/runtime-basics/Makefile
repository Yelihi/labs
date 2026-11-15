SRC := src/RuntimeBasicsLab.c
OUT := build/runtime-basics

.PHONY: run build test clean

run: build
	./$(OUT)

build:
	mkdir -p build
	$(CC) -std=c17 -Wall -Wextra -pedantic $(SRC) -o $(OUT)

test: build
	sh tests/smoke.sh

clean:
	rm -rf build
