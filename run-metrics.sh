#!/bin/bash

for i in {1..27}
do
  node ./fetch-copilot-metrics.js $i
done