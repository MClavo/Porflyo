# Prevent Entering/Leaving directory spam
MAKEFLAGS += --no-print-directory

# Configurable variables
LOCALSTACK_IMAGE=local-aws
LOCALSTACK_PORT=4566
SAM_TEMPLATE=template-dev.yml

# General
.PHONY: build start aws clean dev stop-aws docker-check

# ────────────────────────── Base commands ──────────────────────────

build:
	@echo [Build] Running sam build...
	sam build -t $(SAM_TEMPLATE)

start:
	@echo [Start] Running sam local start-api...
	sam local start-api \
		--port 8080 \
		--env-vars env.json \
		--warm-containers EAGER \
		--container-host-interface 0.0.0.0

aws: docker-check stop-aws
	@echo [AWS] Building local Docker image for AWS...
	docker build -f Dockerfile.localstack -t $(LOCALSTACK_IMAGE) .

	@echo [AWS] Running LocalStack container...
	docker run -d --rm -it -p 8000:$(LOCALSTACK_PORT) --name local-aws-container $(LOCALSTACK_IMAGE)

stop-aws:
	@echo [Stop] Stopping AWS container named 'local-aws-container'...
	-@docker stop local-aws-container 2> NUL || powershell -NoProfile -Command Write-Host 'No running container to stop.'

clean: stop-aws
	@echo [Clean] Deleting SAM resources...
	@sam delete --stack-name porflyo-dev || true

# ────────────────────────── Docker check ──────────────────────────

docker-check:
	@echo [Check] Verifying if Docker is running...
	@docker info > NUL 2>&1 || (powershell -Command Write-Error 'Docker is not running. Aborting.'; exit 1)

# ────────────────────────── Full dev flow ──────────────────────────

dev:
	@echo [Dev] Running full development flow...
	@$(MAKE) docker-check
	@$(MAKE) stop-aws
	@$(MAKE) build
	@$(MAKE) aws
	@$(MAKE) start

# ────────────────────────── Subcommands inside dev ──────────────────────────

dev-%:
	@$(MAKE) $*
