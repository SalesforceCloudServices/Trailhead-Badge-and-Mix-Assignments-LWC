#!/bin/bash

# delete the old mdapiRefresh
rm -rdf ../../mdapiRefresh

# retrieve the latest using the package
sfdx force:mdapi:retrieve -s -k ../../mdapi/package.xml -r ../../mdapiRefresh

# unzip the package so we can import it
unzip ../../mdapiRefresh/unpackaged.zip -d ../../mdapiRefresh/

