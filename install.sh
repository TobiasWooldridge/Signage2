#!/usr/bin/bash

echo "Installing dependencies"
bower install
npm install

echo ""
echo "Building /dist (run 'gulp watch' to continuously build)"
gulp