# The published image is the built static tree and nothing else, meant to be
# mounted as a Kubernetes image volume rather than executed. scratch keeps it
# to a single layer with a normal image config, which is what containerd needs
# to unpack it — an OCI artifact with an empty config does not mount there.
#
# The build context is build/, not the repository root, so run `make build`
# first: docker build -f Dockerfile build
FROM scratch
COPY . /
