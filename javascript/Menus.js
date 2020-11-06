/*Copyright (c) 2020 by Kei G. Gauthier, Longmeadow, MA, USA
*
* This software is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
*
* You should have received a copy of the license along with this
* work.  If not, see <http://creativecommons.org/licenses/by-nc-sa/3.0/>.
*/

'use strict';

var selection;  // Global Variable to persist selection in document across mouse click and other events

window.onload = function() {
	document.execCommand('defaultParagraphSeparator', false, 'div');
	document.execCommand('styleWithCSS', false, true);

// Function to make all Bootstrap Modals draggable
	$(".modal-header").on("mousedown", function(mousedownEvt) {
		var $draggable = $(this);
		var x = mousedownEvt.pageX - $draggable.offset().left,
		y = mousedownEvt.pageY - $draggable.offset().top;
		$("body").on("mousemove.draggable", function(mousemoveEvt) {
			$draggable.closest(".modal-content").offset({
				"left": mousemoveEvt.pageX - x,
				"top": mousemoveEvt.pageY - y
			});
		});
		$("body").one("mouseup", function() {
			$("body").off("mousemove.draggable");
		});
		$draggable.closest(".modal").one("bs.modal.hide", function() {
			$("body").off("mousemove.draggable");
		});
	});
}

//Collection of static functions to create common Bootstrap menus

class Menus {
	static makeMenuReady() {
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
		if (tag.toLowerCase() == "col") Table.insertColumn(position);
		if (tag.toLowerCase() == "tr") Table.insertRow(position);
		if (tag.toLowerCase() == "td") Table.insertCell(position);
	}
	static tableCellSpan(rowOrCol, span) {
		Edit.selectRange(selection);
		Table.cellSpan(rowOrCol, span);
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

//  Static Functions to format and display Pick Lists in Bootstrap Menus
	static connectToMenu(parentMenu, title) {
		var dropdownSubmenu = document.createElement("li");
		dropdownSubmenu.className = "dropdown-submenu";
		parentMenu.appendChild(dropdownSubmenu);
		var div = document.createElement("div");
		div.className = "dropdown-item";
		div.innerHTML = title + " &rarr;";
		dropdownSubmenu.appendChild(div);
		var dropdownMenu = document.createElement("ul");
		dropdownMenu.className = "dropdown-menu";
		dropdownSubmenu.appendChild(dropdownMenu);
		return dropdownMenu;
	}
	static pickListItem(description, onclickCommand, listItemStyle, listItemStyleValue) {
		let li = document.createElement("li");
		li.className = "dropdown-item";
		li.setAttribute("onclick", onclickCommand);
		if (listItemStyle) {
			let span = document.createElement("span");
			span.style[listItemStyle] = listItemStyleValue;
			span.innerHTML = description;
			li.appendChild(span);
		} else li.innerHTML = description;
		return li;
	}
	static pickList(parent, title, descriptions, onclickCommand, commandOptions, listItemStyle, listItemStyleValues) {
		let dropdownMenu = Menus.connectToMenu(parent, title);
		for (let i=0; i<commandOptions.length; i++) {
			if (listItemStyle) {
				dropdownMenu.appendChild(Menus.pickListItem(descriptions[i], onclickCommand.replace( '*chosenOption*', commandOptions[i]),
					listItemStyle, listItemStyleValues[i]));
			} else dropdownMenu.appendChild(Menus.pickListItem(descriptions[i], onclickCommand.replace( '*chosenOption*', commandOptions[i])));
		}
	}

	static fontNames() {
		return ["Arial", "Arial Black", "Calibri", "Cursive", "Courier New",  "Times New Roman", "Verdana"];
	}
	static fontNameTextList(parent) {
		let title = "Font Family";
		let descriptions = Menus.fontNames();
		let onclickCommand = Menus.variableOnclickStyle(null, "fontName");
		let commandOptions = descriptions;
		let listItemStyle = "fontFamily";
		let listItemStyleValues = descriptions;
		Menus.pickList(parent, title, descriptions, onclickCommand, commandOptions, listItemStyle, listItemStyleValues);
	}
	static fontFamilyList(parent, tag, childGroupTag) {
		let title = "Font Family";
		let descriptions = Menus.fontNames();
		let onclickCommand = Menus.variableOnclickStyle(tag, "fontFamily", childGroupTag);
		let commandOptions = descriptions;
		let listItemStyle = "fontFamily";
		let listItemStyleValues = descriptions;
		Menus.pickList(parent, title, descriptions, onclickCommand, commandOptions, listItemStyle, listItemStyleValues);
	}

	static fontSizes() {
		return ["xx-small", "x-small", "small", "medium", "large", "x-large", "xx-large"];
	}
	static fontSizeTextList(parent) {
		let title = "Font Size";
		let descriptions = Menus.fontSizes();
		let onclickCommand = Menus.variableOnclickStyle(null, "fontSize");
		let commandOptions  = [1, 2, 3, 4, 5, 6, 7];
		let listItemStyle = "fontSize";
		let listItemStyleValues = descriptions;
		Menus.pickList(parent, title, descriptions, onclickCommand, commandOptions, listItemStyle, listItemStyleValues);
	}
	static fontSizeList(parent, tag, childGroupTag) {
		let title = "Font Size";
		let descriptions = Menus.fontSizes();
		let onclickCommand = Menus.variableOnclickStyle(tag, "fontSize", childGroupTag);
		let commandOptions = descriptions;
		let listItemStyle = "fontSize";
		let listItemStyleValues = descriptions;
		Menus.pickList(parent, title, descriptions, onclickCommand, commandOptions, listItemStyle, listItemStyleValues);
	}

	static borderCollapseList(parent, tag, childGroupTag) {
		let title = "Collapse";
		let descriptions = ["Collapse", "Separate"];
		let onclickCommand = Menus.variableOnclickStyle(tag, "borderCollapse", childGroupTag);
		let commandOptions = ["collapse", "separate"];
		Menus.pickList(parent, title, descriptions, onclickCommand, commandOptions);
	}
	static borderStyleList(parent, tag, childGroupTag) {
		let title = "Style";
		let descriptions = ["Solid", "Dotted", "Dashed", "None", "Hidden"];
		let onclickCommand = Menus.variableOnclickStyle(tag, "borderStyle", childGroupTag);
		let commandOptions = ["solid", "dotted", "dashed", "none", "hidden"];
		Menus.pickList(parent, title, descriptions, onclickCommand, commandOptions);
	}
	static textAlingList(parent, tag, childGroupTag) {
		let title = "Text Alignment";
		let descriptions = ["Left", "Center", "Right"];
		let onclickCommand = Menus.variableOnclickStyle(tag, "textAlign", childGroupTag);
		let commandOptions = ["left", "center", "right"];
		Menus.pickList(parent, title, descriptions, onclickCommand, commandOptions);
	}
	static tableDeleteList(parent) {
		let title = "Delete";
		let descriptions = ["Table", "Column", "Row", "Cell"];
		let onclickCommand = "Menus.tableDeleteElement('*chosenOption*');";
		let commandOptions = ["table", "col", "tr", "td"];
		Menus.pickList(parent, title, descriptions, onclickCommand, commandOptions);
	}
	static tableJustifyList(parent) {
		let title = "Justify Table";
		let descriptions = ["Left", "Right", "Center"];
		let onclickCommand = "Menus.tableJustify('*chosenOption*')";
		let commandOptions = ["left", "right", "center"];
		Menus.pickList(parent, title, descriptions, onclickCommand, commandOptions);
	}
	static tableInsertElementList(parent) {
		let dropdownMenu = Menus.connectToMenu(parent, "Insert");
		dropdownMenu.appendChild(Menus.pickListItem("Column Left", "Menus.tableInsertElement('col', 'left');"));
		dropdownMenu.appendChild(Menus.pickListItem("Column Right", "Menus.tableInsertElement('col', 'right');"));
		dropdownMenu.appendChild(Menus.pickListItem("Row Above", "Menus.tableInsertElement('tr', 'above');"));
		dropdownMenu.appendChild(Menus.pickListItem("Row Below", "Menus.tableInsertElement('tr', 'below');"));
		dropdownMenu.appendChild(Menus.pickListItem("Cell Left", "Menus.tableInsertElement('td', 'left');"));
		dropdownMenu.appendChild(Menus.pickListItem("Cell Right", "Menus.tableInsertElement('td', 'right');"));
	}
	static verticalAlingList(parent, tag, childGroupTag) {
		let title = "Vertical Alignment";
		let descriptions = ["Top", "Middle", "Bottom"];
		let onclickCommand = Menus.variableOnclickStyle(tag, "verticalAlign", childGroupTag);
		let commandOptions = ["top", "middle", "bottom"];
		Menus.pickList(parent, title, descriptions, onclickCommand, commandOptions);
	}

//  Static functions to format and display custom Bootstrap Modals
	static modalButton(text) {
		let cancelButton = document.createElement("button");
		cancelButton.className = "btn btn-primary btn-sm";
		cancelButton.setAttribute("data-dismiss", "modal");
		cancelButton.innerHTML = text;
		return cancelButton;
	}

	static modalSelect(labelText, id, min, max, step, selected, units) {
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
			colorCell.setAttribute("onclick", "document.getElementById('color-chosen').style.backgroundColor = '" + color + "';");
		}
		let chosenRow = colorTable.insertRow(-1);
		let colorChosen = chosenRow.insertCell(-1);
		colorChosen.setAttribute("Id", "color-chosen");
		colorChosen.className = "color-chosen";
		document.getElementById('mutableModalBody').innerHTML = colorTable.outerHTML;

		document.getElementById('mutableModalFooter').innerHTML = Menus.modalButton("Cancel").outerHTML;
		let submitButton = Menus.modalButton("Submit");
		submitButton.setAttribute("onclick", Menus.constantOnclickStyle(tag, style, "document.getElementById('color-chosen').style.backgroundColor" ,childGroupTag)); 
		document.getElementById('mutableModalFooter').appendChild(submitButton);

		$('#mutableModal').modal();
	}

	static showTableInsert() {
		document.getElementById('mutableModalTitle').innerHTML = "Insert Table";

		document.getElementById('mutableModalBody').innerHTML = "";
		document.getElementById('mutableModalBody').appendChild(Menus.modalSelect("Columns", "table_Insert_columns", 1, 8, 1, 3));
		document.getElementById('mutableModalBody').appendChild(Menus.modalSelect("Rows", "table_Insert_rows", 1, 20, 1, 3));
		document.getElementById('mutableModalBody').appendChild(Menus.modalSelect("Column Width", "table_Insert_width", 2, 40, 2, 2, "cm"));
		document.getElementById('mutableModalFooter').innerHTML = Menus.modalButton("Cancel").outerHTML;

		document.getElementById('mutableModalFooter').innerHTML = Menus.modalButton("Cancel").outerHTML;
		let submitButton = Menus.modalButton("Submit");
		submitButton.setAttribute("onclick",
			"Menus.tableInsert(document.getElementById('table_Insert_columns').value, " +
				"document.getElementById('table_Insert_rows').value, " +
				"document.getElementById('table_Insert_width').value)");
		document.getElementById('mutableModalFooter').appendChild(submitButton);

		$('#mutableModal').modal();
	}

	static showCellSpanChooser(title, rowOrColumn) {
		document.getElementById('mutableModalTitle').innerHTML = title;

		document.getElementById('mutableModalBody').innerHTML = "";
		document.getElementById('mutableModalBody').appendChild(Menus.modalSelect("Span", "select_chooser", 1, 8, 1, 1));

		document.getElementById('mutableModalFooter').innerHTML = Menus.modalButton("Cancel").outerHTML;
		let submitButton = Menus.modalButton("Submit");
		submitButton.setAttribute("onclick", "Menus.tableCellSpan('" + rowOrColumn + 
				"', document.getElementById('select_chooser').value)");
		document.getElementById('mutableModalFooter').appendChild(submitButton);

		$('#mutableModal').modal();
	}

	static showSelectChooser(tag, style, title, labelText, min, max, step, selected, units, childGroupTag) {
		document.getElementById('mutableModalTitle').innerHTML = title;

		document.getElementById('mutableModalBody').innerHTML = Menus.modalSelect(labelText, "select_chooser", min, max, step, selected, units).outerHTML;

		document.getElementById('mutableModalFooter').innerHTML = Menus.modalButton("Cancel").outerHTML;
		let submitButton = Menus.modalButton("Submit");
		if (childGroupTag) submitButton.setAttribute("onclick", "Menus.elementStyle('" + tag  +"', '" + 
				style +  
				"', document.getElementById('select_chooser').value, '" + 
				childGroupTag +"')");
		else submitButton.setAttribute("onclick", "Menus.elementStyle('" + tag  +"', '" + 
				style + 
				 "', document.getElementById('select_chooser').value)");
		document.getElementById('mutableModalFooter').appendChild(submitButton);

		$('#mutableModal').modal();
	}
}