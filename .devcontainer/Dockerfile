FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:22-bookworm

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y --no-install-recommends install \
      curl ca-certificates build-essential git \
    && rm -rf /var/lib/apt/lists/*
