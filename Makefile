.PHONY: install dev build start lint typecheck test format format-check check

install:
	pnpm install --frozen-lockfile

dev:
	pnpm dev

build:
	pnpm build

start:
	pnpm start

lint:
	pnpm lint

typecheck:
	pnpm typecheck

test:
	pnpm test

format:
	pnpm format

format-check:
	pnpm format:check

check:
	pnpm check
