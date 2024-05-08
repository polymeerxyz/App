# See https://tech.davis-hansson.com/p/make/
SHELL := bash
.ONESHELL:
.SHELLFLAGS := -eu -o pipefail -c
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

ifeq ($(origin .RECIPEPREFIX), undefined)
  $(error This Make does not support .RECIPEPREFIX. Please use GNU Make 4.0 or later)
endif
.RECIPEPREFIX = >

# Help
.PHONY: help
help:

.PHONY: package-ui
package-ui:
> rm -rf dist
> pnpm run package:ui --version $(version)
> pnpm run --filter=@polymeerxyz/hardware --filter=@polymeerxyz/lib --filter=@polymeerxyz/ui build
> pnpm deploy --filter=@polymeerxyz/ui --prod ./dist
> cd ./dist/dist && zip -r polymeerxyz.zip .
> mv -f ./polymeerxyz.zip ../..

.PHONY: upload-ui
upload-ui:
> pnpm run upload:ui --clientId $(clientId) --clientSecret $(clientSecret) --refreshToken $(refreshToken)