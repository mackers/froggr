xpi:
	rm -f froggr.xpi
	zip -r froggr.xpi README chrome chrome.manifest install.rdf -x "*.DS_Store" -x "*.swp"
