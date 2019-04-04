#!/bin/bash

# remove the old mdapi folder
rm -rdf ../../mdapi

# refresh the mdapi folder - for the latest package.xml file
sfdx force:source:convert -r ../force-app -d ../../mdapi

