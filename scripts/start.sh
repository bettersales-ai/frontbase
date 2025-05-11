#!/bin/sh

# TODO: Check if wordpress is installed in /app/wordpress
# if it is not installed, then install it and change the ownership of the files to www-data

# Check if it is running in fly.io

if [ -n "$FLY_APP_NAME" ]; then
  echo "Running in fly................"
  echo 'vm.swappiness = 95' >> /etc/sysctl.conf
else
  echo "Not running in fly.io"
fi

cleanup() {
  kill ${!}
  echo "Cleaning up"
  
  if [ -n "$FLY_APP_NAME" ]; then
    # Turn off swap
    echo "Cleanup... Turn off swap"
  fi
}


trap cleanup INT
trap cleanup TERM


$SHELL "$@" & wait ${!}