.PHONY: help prepare dev build lint test test-run clean

help:
	@printf "Available commands:\n"
	@printf "  make prepare   Install npm dependencies\n"
	@printf "  make dev       Start Vite development server\n"
	@printf "  make build     Create production build\n"
	@printf "  make lint      Run ESLint\n"
	@printf "  make test      Start Vitest in watch mode\n"
	@printf "  make test-run  Run Vitest once\n"
	@printf "  make clean     Remove the generated dist directory\n"

prepare:
	npm install
dev:
	npm run dev
build:
	npm run build
lint:
	npm run lint
test:
	npm run test
test-run:
	npm run test:run
clean:
	rm -rf dist
