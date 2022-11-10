/*Copyright (c) 2020 by Kei G. Gauthier, Longmeadow, MA, USA
*
* This software is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
*
* You should have received a copy of the license along with this
* work.  If not, see <http://creativecommons.org/licenses/by-nc-sa/3.0/>.
*/

'use strict';

// Requires Edit.js

// Collection of static functions to create and manipulate TABLEs
class Table {
//  Because this is an editor, styles that normally would be set in css are applied directly to ELEMENTS so the style will carry through save, cut, and paste actions.
	static initializeTableStyle(table) {
		table.style.border = 'solid #000000 1px';
		table.style.borderCollapse = 'separate';
		table.style.marginLeft = 'auto';
		table.style.marginRight = 'auto';
		table.style.width = 'auto';
	}
	static initializeRowStyle(row) {
		row.style.height = '1cm';
	}
	static initializeCellStyle(cell) {
		cell.style.border = 'dotted #a9a9a9 1px';
		cell.style.color = 'inherit';
		cell.style.minHeight = '1em';
		cell.style.padding = '5px';
	}

	static getVisualColumnIndex(cell) {
		var visualColumnIndex = 0;
		var rowCells = Edit.getTagNodeAboveNode(cell, 'tr').getElementsByTagName('td');
		for (let rowCell of rowCells) {
			if (cell == rowCell) return visualColumnIndex;
			else if (rowCell.colSpan) visualColumnIndex = visualColumnIndex + rowCell.colSpan;
			else visualColumnIndex = visualColumnIndex + 1;
		}
	}

	static insert(columns, rows, width) {
		var table = document.createElement('table');
		Table.initializeTableStyle(table);
		for (let r=0; r<rows; r++) {
			let row = table.insertRow(-1);
			Table.initializeRowStyle(row);
			for (let c=0; c<columns; c++) {
				let cell = document.createElement('td');
				Table.initializeCellStyle(cell);
				cell.style.width = width;
				row.appendChild(cell);
			}
		}
		Edit.insertHTML(table.outerHTML);
	}

	static split() {
		var table = Edit.getTagNodeAboveCaret('table');
		var row = Edit.getTagNodeAboveCaret('tr');
		if ((table) && (row) && (row.rowIndex > 0)) {
			let clonedTableUpper = table.cloneNode(true);
			for (let i=row.rowIndex; i<table.rows.length; i++) clonedTableUpper.deleteRow(row.rowIndex);
			let clonedTableLower = table.cloneNode(true);
			for (let i=0; i<row.rowIndex; i++) clonedTableLower.deleteRow(0);
			Edit.selectNode(table);
			Edit.insertHTML(clonedTableUpper.outerHTML + '<div>&nbsp;</div>' + clonedTableLower.outerHTML);
		}
	}

	static insertElement(tag, position) {
		if (tag.toLowerCase() == 'col') Table.insertColumn(position);
		else if (tag.toLowerCase() == 'tr') Table.insertRow(position);
		else if (tag.toLowerCase() == 'td') Table.insertCell(position);
	}
	static insertColumn(leftOrRight) {
		var cell = Edit.getTagNodeAboveCaret('td');
		var row = Edit.getTagNodeAboveCaret('tr');
		var table = Edit.getTagNodeAboveCaret('table');
		if ((cell) && (row) && (table)) {
			let visualColumnIndex = Table.getVisualColumnIndex(cell);

			let clonedTable = table.cloneNode(true);
			let clonedRows = clonedTable.getElementsByTagName('tr');
			for (let clonedRow of clonedRows) {
				let clonedCells = clonedRow.getElementsByTagName('td');
				for (let clonedCell of clonedCells) {
					if (visualColumnIndex == Table.getVisualColumnIndex(clonedCell)) {
						let columnIndex = Edit.getNodeIndexInArray(clonedCell, clonedRow.getElementsByTagName('td'));
						let newCell;
						if (leftOrRight == 'left') newCell = clonedRow.insertCell(columnIndex);
						else newCell = clonedRow.insertCell(columnIndex+1);
						Edit.cloneAttributes(clonedCell, newCell)
						break;
					}
				}
			}
			Edit.replaceElement(table, clonedTable); 
		}
	}
	static insertRow(aboveOrBelow) {
		var targetRow = Edit.getTagNodeAboveCaret('tr');
		var table = Edit.getTagNodeAboveCaret('table');

		if ((targetRow) && (table)) {
			let clonedRow = document.createElement('tr');
			Edit.cloneAttributes(targetRow, clonedRow);
			for (let cell of targetRow.cells) {
				let clonedCell = document.createElement('td');
				Edit.cloneAttributes(cell, clonedCell);
				clonedRow.appendChild(clonedCell);
			}

			let clonedTable = document.createElement('table');;
			Edit.cloneAttributes(table, clonedTable);
			for (let row of table.rows) {
				if ((aboveOrBelow == 'above') && (targetRow === row)) clonedTable.appendChild(clonedRow);
				clonedTable.appendChild(row.cloneNode(true));
				if ((aboveOrBelow == 'below') && (targetRow === row)) clonedTable.appendChild(clonedRow);
			}
			Edit.replaceElement(table,clonedTable);
		}
	}
	static insertCell(leftOrRight) {
		let targetCell = Edit.getTagNodeAboveCaret('td');
		let targetRow = Edit.getTagNodeAboveCaret('tr');
		let table = Edit.getTagNodeAboveCaret('table');
	
		if ((targetCell) && (targetRow) && (table)) {
			let clonedTable = document.createElement('table');
			Edit.cloneAttributes(table, clonedTable);

			let clonedCell = document.createElement('td');
			Edit.cloneAttributes(targetCell, clonedCell);

			for (let row of table.rows) {
				if (targetRow === row) {
					let clonedRow = document.createElement('tr');
					Edit.cloneAttributes(row, clonedRow);
					for (let cell of row.cells) {
						if ((leftOrRight == 'left') && (targetCell === cell)) clonedRow.append(clonedCell);
						clonedRow.appendChild(cell.cloneNode(true));
						if ((leftOrRight == 'right') && (targetCell === cell)) clonedRow.append(clonedCell);
					}
					clonedTable.appendChild(clonedRow);
				}
				else clonedTable.appendChild(row.cloneNode(true));
			}
			Edit.replaceElement(table, clonedTable); 
		}
	}
	static insertLine(aboveBelow) {
		var table = Edit.getTagNodeAboveCaret('table');	
		if ((table) &&(['above','below'].includes(aboveBelow.toLowerCase()))) {
			let range = document.createRange();
			if (aboveBelow.toLowerCase() == 'above') {
				range.setStartBefore(table);
				range.setEndBefore(table);
			} else {
				range.setStartAfter(table);
				range.setEndAfter(table);
			}
			Edit.selectRange(range);
			Edit.execCommand('insertparagraph');
		}
	}

// Function to delete various types of TABLE elements
	static deleteElement(tag) {
		if (tag.toLowerCase() == 'col') {
			let cell = Edit.getTagNodeAboveCaret('td');
			let table = Edit.getTagNodeAboveCaret('table');
			if ((cell) && (table)) {
				let visualColumnIndex = Table.getVisualColumnIndex(cell);

				let clonedTable = table.cloneNode(true);
				let clonedCells = clonedTable.getElementsByTagName('td');
				for (let clonedCell of clonedCells)
					if (visualColumnIndex == Table.getVisualColumnIndex(clonedCell)) clonedCell.remove();
				Edit.replaceElement(table, clonedTable);
			}
		}
		else if (tag.toLowerCase() == 'td') {
			let cell = Edit.getTagNodeAboveCaret('td');
			if (cell) {
				let parent = cell.parentElement;
				let childIndex = Edit.getNodeIndexInArray(cell, parent.childNodes);
				let clonedParent = parent.cloneNode(true);
				clonedParent.removeChild(clonedParent.childNodes[childIndex]);
				Edit.replaceElement(parent, clonedParent);
			}
		}
		else {
			let element = Edit.getTagNodeAboveCaret(tag);
			if (element) Edit.deleteNode(element);
		}
	}

	static justify(justify) {
		var table = Edit.getTagNodeAboveCaret('table');
		if (table) {
			let clonedTable = table.cloneNode(true);
			if (justify == 'right') clonedTable.style.marginRight = '0%';
			else clonedTable.style.marginRight = 'auto';
			if (justify == 'left') clonedTable.style.marginLeft = '0%';
			else clonedTable.style.marginLeft = 'auto';
			Edit.replaceElement(table, clonedTable);
		}
	}

	static cellSpan(rowOrCol, span) {
		if ((['row', 'col'].includes(rowOrCol)) && (span > 0)) {
			var cell = Edit.getTagNodeAboveCaret('td');
			if (cell) {
				var clonedCell = cell.cloneNode(true);
				if (rowOrCol == 'row') clonedCell.rowSpan = span;
				else clonedCell.colSpan = span;
				Edit.replaceElement(cell, clonedCell);
			}
		}
	}
}
