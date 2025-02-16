FROM mcr.microsoft.com/devcontainers/base:debian-12

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

ENV MISE_DATA_DIR="/mise"
ENV MISE_CONFIG_DIR="/mise"
ENV MISE_CACHE_DIR="/mise/cache"
ENV MISE_INSTALL_PATH="/usr/local/bin/mise"
ENV PATH="/mise/shims:$PATH"

# Create the user
RUN apt-get update \
    && apt-get -y --no-install-recommends install \
      sudo curl git ca-certificates build-essential \
    && rm -rf /var/lib/apt/lists/*


RUN curl https://mise.run | sh \
  && mise install -y \
  && chown -R $USER_UID:$USER_GID $MISE_DATA_DIR

USER $USERNAME

CMD sleep infinity
