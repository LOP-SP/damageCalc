#!/usr/bin/env bash

# Copy damageCalc's files to Mojambo's calc
if ls ../mojambo > /dev/null
then
	if ls ../mojambo/calc/stylesheet > /dev/null 
	then
		:
	else
		mkdir ../mojambo/calc/stylesheet
	fi
	
	if ls ../mojambo/calc/src > /dev/null 
	then
		:
	else
		mkdir ../mojambo/calc/src
	fi
	
	if ls ../mojambo/calc/lib > /dev/null 
	then
		:
	else
		mkdir ../mojambo/calc/lib
	fi
	
	cp -r stylesheet/* ../mojambo/calc/stylesheet/
	cp -r src/* ../mojambo/calc/src/
	cp -r lib/* ../mojambo/calc/lib/
	
else
	echo No Mojambo folder found.
fi