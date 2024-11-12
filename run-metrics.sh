#!/bin/bash

for i in {1..28}
do
  node ./fetch-copilot-metrics.js $i
done