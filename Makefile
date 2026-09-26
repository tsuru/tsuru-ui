prettier:
	./node_modules/.bin/prettier -w src/

setup:
	npm install
	git config core.hooksPath .githooks

run:
	PUBLIC_URL=/ui npm start

.PHONY: build
build:
	PUBLIC_URL=/ui npm run build
	cp -Rf tsuru-static-config/nginx.conf build/

test:
	npm run test:ci

lint:
	npm run lint

typecheck:
	npm run typecheck

format-check:
	npm run format:check

# Everything CI checks, in one command.
check: lint format-check typecheck test
