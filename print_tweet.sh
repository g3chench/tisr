#!/bin/bash

wget -O - -o /dev/null "http://twitter.com/$1" \
	| xmllint --xpath '(//div[contains(concat(" ", normalize-space(@class), " "), " tweet ")][not(contains(concat(" ", normalize-space(@class), " "), " user-pinned "))]//p[contains(concat(" ", normalize-space(@class), " "), " tweet-text ")])[1]' --html - 2>/dev/null \
	| lynx -force_html -dump -stdin -nolist --width=100000000 \
	| sed 's/^[ \t]*//;s/[ \t]*$//' \
	| grep .
