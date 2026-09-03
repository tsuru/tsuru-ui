prettier:
	./node_modules/.bin/prettier -w src/

setup:
	npm install

run:
	PUBLIC_URL=/ui npm start

.PHONY: build
build:
	PUBLIC_URL=/ui npm run build
	cp -Rf tsuru-static-config/nginx.conf build/

test:
	npx react-app-rewired test --watchAll=false
