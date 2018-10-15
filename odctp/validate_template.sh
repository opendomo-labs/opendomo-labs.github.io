#!/bin/sh

URL="http://cloud.opendomo.com/odctp/"
if test -z "$1"
then
	echo -n "ODControl's IP: "
	read ip
else
	ip="$1"
fi

if test -z "$2"
then
	echo "No tests was specified. Trying all of them."
	test="1"
	
else
	test="$2"
fi

mkdir -p tmp
wget $URL/get.php?test=$test -q -O tmp/testfile.txt
wget $URL/get.php?res=$test -q -O tmp/resultfile.txt

cat tmp/testfile.txt | nc $ip 1729
echo "lst" | nc $ip 1729 > tmp/realresult.txt

