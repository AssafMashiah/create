#!/bin/sh

echo "Check if PhantomJS is installed..."

WHICH_PHANTOM=`which phantomjs`
NO_PHANTOMJS="which: no phantomjs"

if ! [[ $NO_PHANTOMJS =~ ^.*$WHICH_PHANTOM.* ]]; then
    echo "PhantomJS is already installed - no need to install it."
    exit
fi

echo "PhantomJS is not installed - Installing PhantomJS..."

# Download wget for downloading PhantomJS
yum -y install wget

# Download bzip2 library for extracting *.bz2 files
yum -y install bzip2

# Download PhantomJS
wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2

# Extract directory
tar -xvf phantomjs-2.1.1-linux-x86_64.tar.bz2

# Copy binary to bin folder
sudo cp phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/bin

echo "PhantomJS was successfully installed"
# Run PhantomJS by calling: phabtomjs <some script.js>