/*Copyright (c) 2020 by Kei G. Gauthier, Longmeadow, MA, USA
*
* This software is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
*
* You should have received a copy of the license along with this
* work.  If not, see <http://creativecommons.org/licenses/by-nc-sa/3.0/>.
*/

'use strict';

// Uses Edit.js, FindReplace.js, SpellCheck.js, Style.js, Table.js, and typo.js

var selection;  				// Global Variable to persist selection in document across mouse click and other events
var findReplace;				// Global Variable to enable find and replace functions (MUST be named 'findReplace')
var typo;						// Global Variable to enable spellcheck (MUST be named 'typo')
var spellCheck;					// Global Variable to enable spellcheck (MUST be named 'spellCheck')
var	highlightedElementTag		// Global Variable to facilitate highlighting selected elements
var highlightedChildIndex		// Global Variable to facilitate highlighting selected elements
var highlightedParent			// Global Variable to facilitate highlighting selected elements

window.onload = function() {
	Edit.execCommand('styleWithCSS', true);
	Edit.focusInContentEditable();
}

// Accelerator keys not implemented in pywebview

document.addEventListener('keydown', function(event) {
	if (event.ctrlKey && ["A","a"].includes(event.key)) {
		event.preventDefault();
		Edit.execCommand('selectall');
		return;
	}
	if (event.ctrlKey && ["O","o"].includes(event.key)) {
		event.preventDefault();
		pywebview.api.open_file_dialog();
		return;
	}
	if (event.ctrlKey && ["S","s"].includes(event.key)) {
		event.preventDefault();
		pywebview.api.save_file_dialog();
		return;
	}
	if (event.ctrlKey  &&  event.shiftKey  &&  ["S","s"].includes(event.key)) {
		event.preventDefault();
		pywebview.api.save_file_dialog();
		return;
	}
	if ((event.key == "Delete") || (event.ctrlKey && ["X","x"].includes(event.key))) {
		event.preventDefault();
	    Edit.execCut();
		return;
	}
	if ((event.key == "Paste") || (event.ctrlKey && ["V","v"].includes(event.key))) {
		event.preventDefault();
	    Edit.execPaste();
		return;
	}
	if (event.ctrlKey  &&  event.shiftKey  &&  ["Z","z"].includes(event.key)) {
		event.preventDefault();
		Edit.execCommand('redo');
		return;
	}
	if (event.ctrlKey && ["Z","z"].includes(event.key)) {
		event.preventDefault();
		Edit.execCommand('undo');
		return;
	}
});

//Collection of static functions to create common Bootstrap menus

class Menus {

// Static function to persist selection through mouse clicks and other events
	static markSelection() {
		selection = window.getSelection().getRangeAt(0);
	}

// Static functions to show and hide menu choices
	static makeMenuReady() {
		if (Edit.isCaretInsideAttribute("id", "==", "keieditable")) {
			Menus.markSelection();

			if (highlightedElementTag) {
				$(".edit-dropdown-menu").addClass("invisible");
				$(".text-dropdown-menu").addClass("invisible");
				$(".list-dropdown-menu").addClass("invisible");
				$(".selection-dropdown-menu").removeClass("invisible");
			} else {
				$(".edit-dropdown-menu").removeClass("invisible");
				$(".text-dropdown-menu").removeClass("invisible");
				$(".list-dropdown-menu").removeClass("invisible");
				$(".selection-dropdown-menu").addClass("invisible");
			}
			if ((Edit.isCaretInsideTags(["ol", "ul"])) || (highlightedElementTag)) {
				$(".paragraph-dropdown-menu").addClass("invisible");
			} else {
				$(".paragraph-dropdown-menu").removeClass("invisible");
			}
			if ((Edit.isCaretInsideTags(["ol", "ul"])) && ((Edit.isCaretInsideTag("table") == false))) {
				$(".table-dropdown-menu").addClass("invisible");
			} else {
				$(".table-dropdown-menu").removeClass("invisible");
			}

			if ((Edit.isCaretInsideTags(["table", "ol", "ul"])) || (highlightedElementTag)) {
				$(".table-insert-dropdown-item").addClass("d-none");
			} else {
				$(".table-insert-dropdown-item").removeClass("d-none");
			}
			if (Edit.isCaretInsideTag("table")) {
				$(".table-select-dropdown-item").removeClass("d-none");
			} else {
				$(".table-select-dropdown-item").addClass("d-none");
			}

			if (Edit.isCaretInsideTags(["ol", "ul"])) {
				$(".list-only-dropdown-item").removeClass("d-none");
			} else {
				$(".list-only-dropdown-item").addClass("d-none");
			}
			if (highlightedElementTag == 'table') {
				$(".table-only-dropdown-item").removeClass("d-none");
			} else {
				$(".table-only-dropdown-item").addClass("d-none");
			}
			if (highlightedElementTag == 'col') {
				$(".column-only-dropdown-item").removeClass("d-none");
			} else {
				$(".column-only-dropdown-item").addClass("d-none");
			}
			if (highlightedElementTag == 'tr') {
				$(".row-only-dropdown-item").removeClass("d-none");
			} else {
				$(".row-only-dropdown-item").addClass("d-none");
			}
			if (highlightedElementTag == 'td') {
				$(".cell-only-dropdown-item").removeClass("d-none");
			} else {
				$(".cell-only-dropdown-item").addClass("d-none");
			}
		}
	}

//	Static functions to highlight and dehighlight selected elements
	static highlightTableElement(tag) {
		Edit.selectRange(selection);
		Menus.deHighlightTableElement();
		highlightedElementTag = tag;
		highlightedChildIndex = Edit.getNodeIndexInDocument(Edit.getTagNodeAboveCaret('td'));
		highlightedParent = (Edit.getTagNodeAboveCaret('table'));

		if (tag == 'td') Style.elementStyle(tag, ['backgroundColor', 'color'], ['highlight', 'white']);
		else Style.elementStyle(tag, ['backgroundColor', 'color'], ['highlight', 'white'], 'td');
		Edit.putCaretInIndexedNode(highlightedChildIndex);
	}
	static deHighlightTableElement() {
		if (highlightedParent) {
			Edit.selectRange(selection);
			Edit.execCommand('undo');
			Edit.replaceElement(highlightedParent,highlightedParent);
			Edit.execCommand('undo');
			Edit.putCaretInIndexedNode(highlightedChildIndex);
			Menus.markSelection();
			highlightedElementTag = highlightedChildIndex = highlightedParent = undefined;
		}
	}

//  Static functions to execute editing commands
	static selectAndExecCommand(action, value) {
		Edit.selectRange(selection);		
		Edit.execCommand(action, value);
	}

	static dehighlightAndSelect() {
		Menus.deHighlightTableElement();
		Edit.selectRange(selection);		
	}
	static elementStyle(tag, style, value, childGroupTag) {
		Menus.dehighlightAndSelect();
		Style.elementStyle(tag, style, value, childGroupTag);
	}
	static tableDeleteElement(tag) {
		Menus.dehighlightAndSelect();
		Table.deleteElement(tag);
	}
	static tableJustify(alignment) {
		Menus.dehighlightAndSelect();
		Table.justify(alignment);
	}
	static tableInsert(columns, rows, width) {
		Menus.dehighlightAndSelect();
		Table.insert(columns, rows, width);
	}
	static tableSplit() {
		Menus.dehighlightAndSelect();
		Table.split();
	}
	static tableInsertElement(tag, position) {
		Menus.dehighlightAndSelect();
		Table.insertElement(tag, position);
	}
	static tableCellSpan(rowOrCol, span) {
		Menus.dehighlightAndSelect();
		Table.cellSpan(rowOrCol, span);
	}
	static tableInsertLine(aboveBelow) {
		Menus.dehighlightAndSelect();
		Table.insertLine(aboveBelow);
	}

	static toggleList() {
		Edit.trimTagFromSelection('table');
		Edit.execCommand('insertunorderedlist');
	}
//  Static function to format editing commands for use as onclick functions
	static constantOnclickStyle(tag, style, value, childGroupTag) {
		if (childGroupTag) return "Menus.elementStyle('" + tag + "', '" + style +  "',  " + value + ", '" + childGroupTag + "');";
		if (tag) return "Menus.elementStyle('" + tag + "', '" + style +  "', " +  value + ");"
		return  "Menus.selectAndExecCommand('" + style + "',  " + value + ");"
	}

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
		label.className = "col-8";
		label.innerHTML = labelText;
		div.appendChild(label);
		let select = document.createElement("select");
		select.className = "col-4 custom-select";
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

	static showStyleChooser(tag, style, values, childGroupTag, title, descriptions, styleCellStyle, styleCellStyleValues) {
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
				styleCell.style[styleCellStyle] = styleCellStyleValues[i];
				styleCell.setAttribute("onclick", "Menus.markChosenStyle('" + values[i] + "', '" + descriptions[i] + "', '" + 
						styleCellStyle + "', '" + styleCellStyleValues[i] + "');");
			} else styleCell.setAttribute("onclick", "Menus.markChosenStyle('" + values[i] + "', '" + descriptions[i] + "', '" + "');");
		}
		let chosenStyleRow = styleTable.insertRow(-1);
		let chosenStyleCell = chosenStyleRow.insertCell(-1);
		chosenStyleCell.setAttribute("Id", "chosenStyleCell");
		chosenStyleCell.className = "style-chosen";
		document.getElementById('mutableModalBody').innerHTML = styleTable.outerHTML;

		document.getElementById('mutableModalFooter').innerHTML = "";
		document.getElementById('mutableModalFooter').appendChild(Menus.modalButton("Cancel"));
		document.getElementById('mutableModalFooter').appendChild(Menus.modalButton("Submit", 
			Menus.constantOnclickStyle(tag, style, "document.getElementById('chosenStyleCell').dataset.value", childGroupTag)));

		Menus.mutableModalShow();
		Edit.selectRange(selection);
	}

	static fontNames() {
		return ["Arial", "Arial Black", "Brush Script MT", "Calibri", "Comic Sans MS", "Lucinda Console", "Times New Roman"];
	}
	static fontFamilies() {
		return ["Arial, Helvetica, sans-serif", "Arial Black, Gadget, sans-serif", "Brush Script MT, Purisa, cursive, san-serif", 
				"Calibri, Georgia, serif", "Comic Sans MS, cursive, sans-serif", "Lucinda Console, Monaco, monospace", "Times New Roman, Times, serif"];
	}
	static showFontFamilyChooser(tag, childGroupTag) {
		let style = "fontFamily";
		let values = Menus.fontFamilies();
		let title = "Font Family";
		let descriptions = Menus.fontNames();
		let styleCellStyle = "fontFamily";
		let styleCellStyleValues = Menus.fontFamilies();
		Menus.showStyleChooser(tag, style, values, childGroupTag, title, descriptions, styleCellStyle, styleCellStyleValues);
	}
	static showTextFontFamilyChooser() {
		let style = "fontName";
		let values = Menus.fontFamilies();
		let title = "Font Family";
		let descriptions = Menus.fontNames();
		let styleCellStyle = "fontFamily";
		let styleCellStyleValues = Menus.fontFamilies();
		Menus.showStyleChooser(null, style, values, null, title, descriptions, styleCellStyle, styleCellStyleValues);
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
		let styleCellStyleValues = Menus.fontSizes();
		Menus.showStyleChooser(tag, style, values, childGroupTag, title, descriptions, styleCellStyle, styleCellStyleValues);
	}
	static showTextFontSizeChooser() {
		let style = "fontSize";
		let values = [1,2,3,4,5,6,7];
		let title = "Font Size";
		let descriptions = Menus.fontSizes();
		let styleCellStyle = "fontSize";
		let styleCellStyleValues = Menus.fontSizes();
		Menus.showStyleChooser(null, style, values, null, title, descriptions, styleCellStyle, styleCellStyleValues);
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
	static showListStyleChooser(tag, childGroupTag) {
		let style = "listStyleType";
		let values = ["disc", "circle", "square", "decimal", "upper-alpha", "lower-alpha", "upper-roman", "lower-roman", "none"];
		let title = "List Type";
		let descriptions = ["&#9679;&nbsp;&nbsp;Disc", "&#9675;&nbsp;&nbsp;Circle", "&#9632;&nbsp;&nbsp;Square", "1, 2, 3, 4 ...", 
			"A, B, C, D ...", "a, b, c, d ...", "I, II, III, IV ...", "i, ii, iii, iv ...", "None"];
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
		chosenColorCell.className = "color-chosen";
		document.getElementById('mutableModalBody').innerHTML = colorTable.outerHTML;

		document.getElementById('mutableModalFooter').innerHTML = "";
		document.getElementById('mutableModalFooter').appendChild(Menus.modalButton("Submit", 
			Menus.constantOnclickStyle(tag, style, "document.getElementById('chosenColorCell').style.backgroundColor", childGroupTag)));

		Menus.mutableModalShow();
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
		FindReplace.initialize();
	}

	static showSpellCheck() {
		spellCheck.initialize();
	}
	static resetIgnoreWords() {
		spellCheck.resetIgnoreWords();
	}

	static showMessageInLinkModal(title, link) {
		document.getElementById('mutableModalTitle').innerHTML = title;
		document.getElementById('mutableModalBody').innerHTML = "<embed type='text/html' src='" + link + "'>";
		document.getElementById('mutableModalFooter').innerHTML = "";
		document.getElementById('mutableModalFooter').appendChild(Menus.modalButton("Okay"));
		Menus.mutableModalShow();
	}
}

//Spell Check Initialization

typo = new Typo('en_US', affData, wordsData, {}); //affData and wordsData dictionaries are loaded as separate files
spellCheck = new SpellCheck(typo);