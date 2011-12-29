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
	
	cp stylesheet/stylesheet.css ../mojambo/calc/stylesheet/stylesheet.css
	cp src/damagecalc.js ../mojambo/calc/src/damagecalc.js
	cp lib/jquery.min.js ../mojambo/calc/lib/jquery.min.js
	
else
	echo No Mojambo folder found.
fi