#!/bin/bash
set -e

echo "Start Executing the DEPLOT Script"
docker-compose up -d --build --force-recreate
docker ps
echo "Start Executing the DEPLOT Script has been completed"