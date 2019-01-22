#!/bin/bash
set -eo pipefail

pushd "${SRCROOT}/.."
export PATH="$(if [ -f ~/.expo/PATH ]; then echo $PATH:$(cat ~/.expo/PATH); else echo $PATH; fi)"
expo prepare-detached-build --platform ios
popd

