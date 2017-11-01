function _printPageHeader(doc, date) {
	doc.setFontSize(32);
	doc.text(4, 12, 'Who');
	doc.text(4, 25, 'What');
	doc.text(4, 38, 'Where (3W)');
	doc.setFontSize(12);
	var dy = 5;
	texts = ['An export from', 'ugandarefugees.org', 'on ' + new Date().toDateString(),
		'Data updated as of', date.toDateString(),
		'', 'More information from', 'khalifno@unhcr.org'];
	texts.forEach(function (text, index) {
		doc.text(text, 205, 6 + index * dy, 'right');
	})
}

function _printFilter(doc, filter, x, y) {
	doc.setFontSize(8);
	doc.text(x, y, 'Filters Applied');
	doc.setFontSize(12);
	doc.text(x, y + 5, filter.name);
	filter.values.forEach(function (value, index) {
		doc.text(x, y + 14 + index * 5, value.key);
	})
}

function makeRectangularCanvas(oldCanvas, callback) {
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	var imageObj = new Image();
	dx = oldCanvas.width - oldCanvas.height;

	canvas.width = oldCanvas.height;
	canvas.height = oldCanvas.height;

	imageObj.src = oldCanvas.toDataURL('image/png');
	imageObj.onload = function () {
		// draw cropped image
		var sourceX = dx / 2;
		var sourceY = 0;
		var sourceWidth = oldCanvas.width - dx;
		var sourceHeight = oldCanvas.height;
		var destWidth = sourceWidth;
		var destHeight = sourceHeight;
		var destX = canvas.width / 2 - destWidth / 2;
		var destY = canvas.height / 2 - destHeight / 2;

		context.drawImage(imageObj, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);

		callback(canvas);
	};
}

function _makeMapImage(map, callback) {
	// Generate map image first
	leafletImage(map, function (err, canvas) {
		var svg = document.querySelector('svg');
		var context = canvas.getContext('2d');

		// Make png from SVG D3 map
		svgAsPngUri(svg, {}, function (uri) {
			var drawing = new Image();
			drawing.src = uri;
			drawing.onload = function () {
				context.drawImage(drawing, 0, 0);

				makeRectangularCanvas(canvas, function (canvas) {
					callback(canvas);
				});
			};
		});
	});
}

function generatePdf(map, dataset, filters, lastModified) {
	var IMAGE_SIZE = 170;
	var DOC_WIDTH = 210;

	_makeMapImage(map, function (canvas) {
		var doc = new jsPDF();
		var ratio = canvas.height / canvas.width;
		doc.setFont('helvetica', 'normal');

		_printPageHeader(doc, lastModified);

		var image = canvas.toDataURL('image/png');
		var x = (DOC_WIDTH - IMAGE_SIZE)/2;
		var y = 50;
		var width = IMAGE_SIZE;
		var height = IMAGE_SIZE * ratio;
		doc.addImage(image, 'PNG', x, y, width, height, '', 'fast');

		filters.forEach(function (filter, index) {
			_printFilter(doc, filter, 5 + index * 50, 220);
		});

		doc.addPage();

		var columns = [
			{ title: 'District Name', dataKey: 'District' },
			{ title: 'Actor Name', dataKey: 'Actor Name' },
			{ title: 'Settlement Name', dataKey: 'Settlement Name' },
			{ title: 'Sector', dataKey: 'Sector' },
		];

		doc.autoTable(columns, dataset, {
			margin: { top: 60 },
			addPageContent: function (data) {
				_printPageHeader(doc, lastModified);
			}
		});

		doc.save();
	})
}

