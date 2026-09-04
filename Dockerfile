# syntax=docker/dockerfile:1
# The published image is the built static tree and nothing else, meant to be
# mounted as a Kubernetes image volume rather than executed. scratch keeps it
# to a single layer with a normal image config, which is what containerd needs
# to unpack it — an OCI artifact with an empty config does not mount there.
#
# nginx.conf is left out on purpose: make build drops it into build/ for the
# tsuru static deploy, but whatever serves this volume brings its own config,
# and here the file would just sit in the web root waiting to be served.
#
# The build context is build/, not the repository root, so run `make build`
# first: docker build -f Dockerfile build
FROM scratch
COPY --exclude=nginx.conf . /
