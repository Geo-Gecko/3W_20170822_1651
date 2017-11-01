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

function printFilter(doc, filter, x, y) {
	doc.setFontSize(8);
	doc.text(x, y, 'Filters Applied');
	doc.setFontSize(12);
	doc.text(x, y + 5, filter.name);
	filter.values.forEach(function(value, index) {
		doc.text(x, y + 14 + index * 5, value.key);
	})
}

function generatePdf(map, dataset, filters, lastModified) {
	console.log(filters);
	// Generate map image first
	leafletImage(map, function (err, canvas) {
		var svg = document.querySelector('svg');
		var context = canvas.getContext('2d');

		// Make png from SVG D3 map
		svgAsPngUri(svg, {}, function (uri) {
			var drawing = new Image();
			drawing.src = uri; // can also be a remote URL e.g. http://
			drawing.onload = function () {
				context.drawImage(drawing, 0, 0);

				var dataURL = canvas.toDataURL('image/png');

				var doc = new jsPDF();
				var ratio = canvas.height / canvas.width;
				doc.setFont('helvetica', 'normal');

				_printPageHeader(doc, lastModified);

				doc.addImage(dataURL, 'PNG', 0, 80, 220, ratio * 220);
				
				filters.forEach(function (filter, index) {
					printFilter(doc, filter, 5 + index * 50, 220);
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
			};

		});

	});
}

