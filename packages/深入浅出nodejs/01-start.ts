const showMem = function () {
	const mem = process.memoryUsage();
	const format = function (bytes: number) {
		return (bytes / 1024 / 1024).toFixed(2) + " MB";
	};
	console.log(
		"Process: heapTotal " +
			format(mem.heapTotal) +
			" heapUsed " +
			format(mem.heapUsed) +
			" rss " +
			format(mem.rss)
	);
	console.log("-----------------------------------------------------------");
};
showMem();
export = {};
