#!/bin/bash

# Run playwright report, as unlike vitest unit report, it is not run automatically.
npx nyc report --reporter=json --report-dir=./coverage/e2e --temp-dir=./coverage/e2e/.tmp --exclude-after-remap=false

# Copy json coverages to a common directory so they can be merged.
mkdir ./coverage/reports
cp ./coverage/e2e/coverage-final.json ./coverage/reports/e2e.json
cp ./coverage/unit/coverage-final.json ./coverage/reports/unit.json

## Run the merge command.
npx nyc merge ./coverage/reports ./coverage/coverage-final.json

## Generate lcov report.
npx nyc report --reporter lcov --report-dir=coverage --temp-dir=./coverage/reports

## Clear the old directories.
rm -rf ./coverage/e2e ./coverage/unit ./coverage/reports
