.PHONY: install dev start build test check clean docker-up docker-build

install:
	npm install

dev:
	npm run dev

start:
	npm start

build:
	npm run build

test:
	npm test

check:
	npm run check

clean:
	npm run clean

docker-up:
	docker compose up --build

docker-build:
	docker build -t fastify-typescript-microservice .
