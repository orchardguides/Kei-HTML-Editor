/*Copyright (c) 2020 by Kei G. Gauthier, Longmeadow, MA, USA
*
* This software is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
*
* You should have received a copy of the license along with this
* work.  If not, see <http://creativecommons.org/licenses/by-nc-sa/3.0/>.
*/

'use strict';

var selection;  				// Global Variable to persist selection in document across mouse click and other events
var findReplace;			// Global Variable to enable find and replace functions

window.onload = function() {
	document.execCommand('defaultParagraphSeparator', false, 'div');
	document.execCommand('styleWithCSS', false, true);
}

//Collection of static functions to create common Bootstrap menus

class Menus {
	static makeMenuReady() {
		if (Edit.isCaretInsideAttribute("id", "==", "keieditable")) {
			Menus.markSelection();
			if (Edit.isCaretInsideTag("table")) {
				$(".table-dependent-dropdown").removeClass("disabled");
				$(".table-dependent-item").removeClass("disabled");
				$(".table-dependent-menu").removeClass("invisible");
				$(".table-dependent-nav-item").addClass("active");
				$(".table-dependent-nav-item").removeClass("disabled");
			} else {
				$(".table-dependent-dropdown").addClass("disabled");
				$(".table-dependent-item").addClass("disabled");
				$(".table-dependent-menu").addClass("invisible");
				$(".table-dependent-nav-item").addClass("disabled");
				$(".table-dependent-nav-item").removeClass("active");
			}
		}
	}

// Static function to persist selection through mouse clicks and other events
	static markSelection() {
		selection = window.getSelection().getRangeAt(0);
	}

//  Static functions to execute editing commands
	static execCommand(action, value) {
		Edit.selectRange(selection);
		Edit.execCommand(action, value);
		Edit.selectRange(selection);
	}
	static elementStyle(tag, style, value, childGroupTag) {
		Edit.selectRange(selection);
		Style.elementStyle(tag, style, value, childGroupTag);
	}
	static tableDeleteElement(tag) {
		Edit.selectRange(selection);
		Table.deleteElement(tag);
	}
	static tableJustify(alignment) {
		Edit.selectRange(selection);
		Table.justify(alignment);
	}
	static tableInsert(columns, rows, width) {
		Edit.selectRange(selection);
		Table.insert(columns, rows, width);
	}
	static tableSplit() {
		Edit.selectRange(selection);
		Table.split();
	}
	static tableInsertElement(tag, position) {
		Edit.selectRange(selection);
		Table.insertElement(tag, position);
	}
	static tableCellSpan(rowOrCol, span) {
		Edit.selectRange(selection);
		Table.cellSpan(rowOrCol, span);
	}
	static tableInsertLine(aboveBelow) {
		Edit.selectRange(selection);
		Table.insertLine(aboveBelow);
	}

//  Static function to format editing commands for use as onclick functions
	static constantOnclickStyle(tag, style, value, childGroupTag) {
		if (childGroupTag) return "Menus.elementStyle('" + tag + "', '" + style +  "',  " + value + ", '" + childGroupTag + "');";
		if (tag) return "Menus.elementStyle('" + tag + "', '" + style +  "', " +  value + ");"
		return  "Menus.execCommand('" + style + "',  " + value + ");"
	}
	static variableOnclickStyle(tag, style, childGroupTag) {
		return Menus.constantOnclickStyle(tag, style, "'*chosenOption*'", childGroupTag);
	}

//  Static functions to display custom Bootstrap Modals
	static mutableModalShow() {
		$('#mutableModalDialog').css({
			left:  ($(window).width() - $("#mutableModalDialog").width())/2,
			top: 0
		});
		$('#mutableModalDialog').draggable({
			containment: "window",
			handle: ".modal-header"
		});
		$('#mutableModal').modal("show");
		Edit.selectRange(selection);
	}

	static modalButtonNoDismiss(text, onclick) {
		let button = document.createElement("button");
		button.className = "btn btn-primary btn-sm";
		button.setAttribute("onclick", onclick);
		button.innerHTML = text
		return button;
	}
	static modalButton(text, onclick) {
		let button = Menus.modalButtonNoDismiss(text, onclick);
		button.setAttribute("data-dismiss", "modal");
		return button;
	}

	static modalNumericSelect(labelText, id, min, max, step, selected, units) {
		let div = document.createElement("div");
		div.className = "row";
		let label = document.createElement("label");
		label.className = "col-sm-8";
		label.innerHTML = labelText;
		div.appendChild(label);
		let select = document.createElement("select");
		select.className = "col-sm-4 custom-select";
		select.id = id;
		div.appendChild(select);
		for (let value=min; value<=max; value=value+step) {
			let option = document.createElement("option");
			if (units) option.value = value.toString() + units;
			else option.value = value;
			if (units) option.innerHTML = value.toString() + " " + units;
			else option .innerHTML = value;
			if (value == selected) option.selected = true;
			select.add(option);
		}
		return div;
	}

	static markChosenStyle(dataValue, description, styleCellStyle, styleCellValue) {
		let chosenStyleCell = document.getElementById('chosenStyleCell');
		chosenStyleCell.dataset.value = dataValue;
		chosenStyleCell.innerHTML = description;
		if (styleCellStyle) chosenStyleCell.style[styleCellStyle] = styleCellValue;
		Edit.selectRange(selection);
	}

	static showStyleChooser(tag, style, values, childGroupTag, title, descriptions, styleCellStyle, stylCellStyleValues) {
		document.getElementById('mutableModalTitle').innerHTML = title;

		let styleTable = document.createElement("table");
		styleTable.className = "style-table";
		let styleRow;
		for (let i=0; i< descriptions.length; i++) {
			styleRow = styleTable.insertRow(-1);
			let styleCell= styleRow.insertCell(-1);
			styleCell.className = "style-option";
			styleCell.innerHTML = descriptions[i];
			if (styleCellStyle) {
				styleCell.style[styleCellStyle] = stylCellStyleValues[i];
				styleCell.setAttribute("onclick", "Menus.markChosenStyle('" + values[i] + "', '" + descriptions[i] + "', '" + styleCellStyle + "', '" + stylCellStyleValues[i] + "');");
			} else styleCell.setAttribute("onclick", "Menus.markChosenStyle('" + values[i] + "', '" + descriptions[i] + "', '" + "');");
		}
		let chosenStyleRow = styleTable.insertRow(-1);
		let chosenStyleCell = chosenStyleRow.insertCell(-1);
		chosenStyleCell.setAttribute("Id", "chosenStyleCell");
		chosenStyleCell.className = "chosen-style";
		document.getElementById('mutableModalBody').innerHTML = styleTable.outerHTML;

		document.getElementById('mutableModalFooter').innerHTML = "";
		document.getElementById('mutableModalFooter').appendChild(Menus.modalButton("Cancel"));
		document.getElementById('mutableModalFooter').appendChild(Menus.modalButton("Submit", 
			Menus.constantOnclickStyle(tag, style, "document.getElementById('chosenStyleCell').dataset.value", childGroupTag)));

		Menus.mutableModalShow();
		Edit.selectRange(selection);
	}

	static fontNames() {
		return ["Arial", "Arial Black", "Calibri", "Cursive", "Courier New",  "Times New Roman", "Verdana"];
	}
	static showFontFamilyChooser(tag, childGroupTag) {
		let style = "fontFamily";
		let values = Menus.fontNames();
		let title = "Font Family";
		let descriptions = Menus.fontNames();
		let styleCellStyle = "fontFamily";
		let stylCellStyleValues = Menus.fontNames();
		Menus.showStyleChooser(tag, style, values, childGroupTag, title, descriptions, styleCellStyle, stylCellStyleValues);
	}
	static showTextFontFamilyChooser() {
		let style = "fontName";
		let values = Menus.fontNames();
		let title = "Font Family";
		let descriptions = Menus.fontNames();
		let styleCellStyle = "fontFamily";
		let stylCellStyleValues = Menus.fontNames();
		Menus.showStyleChooser(null, style, values, null, title, descriptions, styleCellStyle, stylCellStyleValues);
	}

	static fontSizes() {
		return ["xx-small", "x-small", "small", "medium", "large", "x-large", "xx-large"];
	}
	static showFontSizeChooser(tag, childGroupTag) {
		let style = "fontSize";
		let values = Menus.fontSizes();
		let title = "Font Size";
		let descriptions = Menus.fontSizes();
		let styleCellStyle = "fontSize";
		let stylCellStyleValues = Menus.fontSizes();
		Menus.showStyleChooser(tag, style, values, childGroupTag, title, descriptions, styleCellStyle, stylCellStyleValues);
	}
	static showTextFontSizeChooser() {
		let style = "fontSize";
		let values = [1,2,3,4,5,6,7];
		let title = "Font Size";
		let descriptions = Menus.fontSizes();
		let styleCellStyle = "fontSize";
		let stylCellStyleValues = Menus.fontSizes();
		Menus.showStyleChooser(null, style, values, null, title, descriptions, styleCellStyle, stylCellStyleValues);
	}
	static showBorderCollapseChooser(tag, childGroupTag) {
		let style = "borderCollapse";
		let values = ["collapse", "separate"];
		let title = "Border Collapse";
		let descriptions = ["Collapse", "Separate"];
		Menus.showStyleChooser(tag, style, values, childGroupTag, title, descriptions);
	}
	static showBorderStyleChooser(tag, childGroupTag) {
		let style = "borderStyle";
		let values = ["solid", "dotted", "dashed", "none", "hidden"];
		let title = "Border Style";
		let descriptions = ["Solid", "Dotted", "Dashed", "None", "Hidden"];
		Menus.showStyleChooser(tag, style, values, childGroupTag, title, descriptions);
	}
	static showTextAlignChooser(tag, childGroupTag) {
		let style = "textAlign";
		let values = ["left", "center", "right"];
		let title = "Text Alignment";
		let descriptions = ["Left", "Center", "Right"];
		Menus.showStyleChooser(tag, style, values, childGroupTag, title, descriptions);
	}
	static showVerticalAlignChooser(tag, childGroupTag) {
		let style = "verticalAlign";
		let values = ["top", "middle", "bottom"];
		let title = "Vertical Alignment";
		let descriptions = ["Top", "Middle", "Bottom"];
		Menus.showStyleChooser(tag, style, values, childGroupTag, title, descriptions);
	}

	static markChosenColor(color) {
		let chosenColorCell = document.getElementById('chosenColorCell');
		chosenColorCell.style.backgroundColor = color;
		Edit.selectRange(selection);
	}
	static showTextColorChooser(title, style) {
		Menus.showColorChooser(title, null, style);
	}
	static showColorChooser(title, tag, style, childGroupTag) {
		document.getElementById('mutableModalTitle').innerHTML = title;

		let colors = ["#000000", "#191919", "#323232", "#4b4b4b", "#646464", "#7d7d7d", "#969696", "#afafaf", "#c8c8c8", "#e1e1e1", "#ffffff",
					"#820000", "#9b0000", "#b40000", "#cd0000", "#e60000", "#ff0000", "#ff1919", "#ff3232", "#ff4b4b", "#ff6464", "#ff7d7d",
					"#823400", "#9b3e00", "#b44800", "#cd5200", "#e65c00", "#ff6600", "#ff7519", "#ff8532", "#ff944b", "#ffa364", "#ffb27d",
					"#828200", "#9b9b00", "#b4b400", "#cdcd00", "#e6e600", "#ffff00", "#ffff19", "#ffff32", "#ffff4b", "#ffff64", "#ffff7d",
					"#003300", "#004d00", "#008000", "#00b300", "#00cc00", "#00e600", "#1aff1a", "#4dff4d", "#66ff66", "#80ff80", "#b3ffb3",
					"#001a4d", "#002b80", "#003cb3", "#004de6", "#0000ff", "#0055ff", "#3377ff", "#4d88ff", "#6699ff", "#80b3ff", "#b3d1ff",
					"#003333", "#004d4d", "#006666", "#009999", "#00cccc", "#00ffff", "#1affff", "#33ffff", "#4dffff", "#80ffff", "#b3ffff",
					"#4d004d", "#602060", "#660066", "#993399", "#ac39ac", "#bf40bf", "#c653c6", "#cc66cc", "#d279d2", "#d98cd9", "#df9fdf",
					"#660029", "#800033", "#b30047", "#cc0052", "#e6005c", "#ff0066", "#ff1a75", "#ff3385", "#ff4d94", "#ff66a3", "#ff99c2"];
		let columns = 11;
		let colorTable = document.createElement("table");
		colorTable.className = "color-table";
		let colorRow;
		for (let color of colors) {
			if ((colors.indexOf(color) % columns) == 0) colorRow = colorTable.insertRow(-1);
			let colorCell= colorRow.insertCell(-1);
			colorCell.className = "color-option";
			colorCell.style.backgroundColor = color;
			colorCell.setAttribute("onclick", "Menus.markChosenColor('" + color + "');");
		}
		let chosenStyleRow = colorTable.insertRow(-1);
		let chosenColorCell = chosenStyleRow.insertCell(-1);
		chosenColorCell.setAttribute("Id", "chosenColorCell");
		chosenColorCell.className = "chosen-color";
		document.getElementById('mutableModalBody').innerHTML = colorTable.outerHTML;

		document.getElementById('mutableModalFooter').innerHTML = "";
		document.getElementById('mutableModalFooter').appendChild(Menus.modalButton("Submit", 
			Menus.constantOnclickStyle(tag, style, "document.getElementById('chosenColorCell').style.backgroundColor", childGroupTag)));

		Menus.mutableModalShow();
		Edit.selectRange(selection);
	}

	static showTableInsert() {
		document.getElementById('mutableModalTitle').innerHTML = "Insert Table";

		document.getElementById('mutableModalBody').innerHTML = "";
		document.getElementById('mutableModalBody').appendChild(Menus.modalNumericSelect("Columns", "columnsSelect", 1, 8, 1, 3));
		document.getElementById('mutableModalBody').appendChild(Menus.modalNumericSelect("Rows", "rowsSelect", 1, 20, 1, 3));
		document.getElementById('mutableModalBody').appendChild(Menus.modalNumericSelect("Column Width", "widthSelect", 2, 40, 2, 2, "cm"));

		document.getElementById('mutableModalFooter').innerHTML = "";
		document.getElementById('mutableModalFooter').appendChild(Menus.modalButton("Submit",
			"Menus.tableInsert(document.getElementById('columnsSelect').value, " +
				"document.getElementById('rowsSelect').value, " +
				"document.getElementById('widthSelect').value)"));

		Menus.mutableModalShow();
	}

	static showCellSpanChooser(title, rowOrColumn) {
		document.getElementById('mutableModalTitle').innerHTML = title;

		document.getElementById('mutableModalBody').innerHTML = "";
		document.getElementById('mutableModalBody').appendChild(Menus.modalNumericSelect("Span", "cellSpanSelect", 1, 8, 1, 1));

		document.getElementById('mutableModalFooter').innerHTML = "";
		document.getElementById('mutableModalFooter').appendChild(Menus.modalButton("Submit", "Menus.tableCellSpan('" + rowOrColumn + 
				"', document.getElementById('cellSpanSelect').value)"));

		Menus.mutableModalShow();
	}

	static showNumericChooser(tag, style, title, labelText, min, max, step, selected, units, childGroupTag) {
		document.getElementById('mutableModalTitle').innerHTML = title;

		document.getElementById('mutableModalBody').innerHTML = Menus.modalNumericSelect(labelText, "numericSelect", min, max, step, selected, units).outerHTML;

		document.getElementById('mutableModalFooter').innerHTML = "";
		let command;
		if (childGroupTag) command = "Menus.elementStyle('" + tag  + "', '" +  style + "', document.getElementById('numericSelect').value, '" + childGroupTag +"')";
		else command =  "Menus.elementStyle('" + tag  +"', '" + style + "', document.getElementById('numericSelect').value)";
		document.getElementById('mutableModalFooter').appendChild(Menus.modalButton("Submit", command));

		Menus.mutableModalShow();
	}

	static showFindReplace() {
		document.getElementById('mutableModalTitle').innerHTML = "Find & Replace";
		document.getElementById('mutableModalBody').innerHTML = 
			`<table>
				<div class="row">
					<label class="col-sm-4">Find</label>
					<input type="text" id="target" class="col-sm-8"></input>
				</div>
				<div class="row">
					<label class="col-sm-4";>Replace</label>
					<input type="text" id="replacement" class="col-sm-8"></input>
				</div>
				<div class="row">
					<label class="col-sm-4"></label>
					<input type="checkbox" id="matchCase" class="col-sm-1"></input>
					<label class="col-sm-7">Match Case</label>
				</div>
			 </table>`;

		document.getElementById('mutableModalFooter').innerHTML = "";
		document.getElementById('mutableModalFooter').appendChild(Menus.modalButtonNoDismiss("Find",  "Menus.initializeFindReplace()"));
		Menus.mutableModalShow();
	}
	static initializeFindReplace() {
		if (document.getElementById("target").value == "") {
			$('#mutableModal').modal("hide");
			return;
		}
		findReplace = new FindReplace(document.getElementById("target").value, 
											document.getElementById("replacement").value, 
											document.getElementById("matchCase").checked);
		if (findReplace.textIncludesTarget()) {
		document.getElementById('mutableModalBody').innerHTML = 
			`<table>
				<div class="row">
					<label class="col-sm-5">Find</label>
					<label class="col-sm-7">` + findReplace.target + `</label>
				</div>
				<div class="row">
					<label class="col-sm-5";>Replace</label>
					<label class="col-sm-7">` + findReplace.replacement + `</label>
				</div>
				<div class="row">
					<label class="col-sm-5">Match Case</label>
					<label class="col-sm-7">` + ((findReplace.matchCase) ? 'Yes' : 'No') + `</label>
				</div>
			 </table>`;

			document.getElementById('mutableModalFooter').innerHTML = "";
			document.getElementById('mutableModalFooter').appendChild(Menus.modalButtonNoDismiss("Replace",  "Menus.replace()"));
			document.getElementById('mutableModalFooter').appendChild(Menus.modalButtonNoDismiss("Replace All",  "Menus.replaceAll()"));
			document.getElementById('mutableModalFooter').appendChild(Menus.modalButtonNoDismiss("Find Next",  "Menus.find()"));
			Menus.find();
		} else Menus.finishFindReplace(); 
	}
	static find() {
		if (findReplace.find()) {
			selection = findReplace.getSelection();
			Menus.mutableModalShow();
		}  else Menus.finishFindReplace();
	}
	static replace() {
		findReplace.replace();
		Menus.find();
	}
	static replaceAll() {
			findReplace.replaceAll();
			Menus.finishFindReplace();
	}
	static finishFindReplace() {
		document.getElementById('mutableModalBody').innerHTML = 
			`<table>
				<div class="row">
					<label class="col-sm-5">Find</label>
					<label class="col-sm-7">` + findReplace.target + `</label>
				</div>
				<div class="row">
					<h6 class="col-sm-12" style="text-align:center">No More Matches</h6>
				</div>
			 </table>`;
		document.getElementById('mutableModalFooter').innerHTML = "";
		document.getElementById('mutableModalFooter').appendChild(Menus.modalButton("Finish"));
		Menus.mutableModalShow();
	}
}