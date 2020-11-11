/*Copyright (c) 2020 by Kei G. Gauthier, Longmeadow, MA, USA
*
* This software is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
*
* You should have received a copy of the license along with this
* work.  If not, see <http://creativecommons.org/licenses/by-nc-sa/3.0/>.
*/

'use strict';

// Uses Edit.js

// Collection of static functions to style HTML elements
class Style {
	static isStyleSupported(style) {
		return (['backgroundColor', 'borderCollapse', 'borderColor', 'borderRadius', 'borderStyle', 'borderWidth', 'borderSpacing',
			'color', 'columnCount', 'fontFamily', 'fontSize', 'marginBottom', 'padding', 'textAlign', 'verticalAlign', 'width']
			.includes(style));
	}

	static styleElement(element, style, value) {
		element.style[style] = value;
	}

	static getStyledElementClone(element, style, value) {
		var clonedElement = element.cloneNode(true);
		Style.styleElement(clonedElement, style, value);
		return clonedElement;
	}

	static getChildGroupReplaceableElement(tag) {
		if (tag.toLowerCase() == 'col') return Edit.getTagAboveCaret('table');
		if (['ul','ol'].includes(tag.toLowerCase())) return Edit.getTagsAboveCaret(['ul', 'ol']);
		return Edit.getTagAboveCaret(tag);
	}

	static getStyledChildGroupClone(replaceableElement, tag, style, value, childGroupTag) {
		var clonedReplaceableElement = replaceableElement.cloneNode(true);
		var clonedChildren = [];
		if (tag.toLowerCase() == 'col') {
			let cell = Edit.getTagAboveCaret('td');
			let visualColumnIndex = Table.getVisualColumnIndex(cell);

			let clonedCells = clonedReplaceableElement.getElementsByTagName('td');
			if (clonedCells) {
				for (let clonedCell of clonedCells) 
					if (visualColumnIndex == Table.getVisualColumnIndex(clonedCell)) clonedChildren.push(clonedCell);
			}
		} else clonedChildren = clonedReplaceableElement.getElementsByTagName(childGroupTag);

		for (let i=0; i<clonedChildren.length; i++) Style.styleElement(clonedChildren[i], style, value);
		return clonedReplaceableElement;
	}

	static styleChildGroup(tag, style, value, childGroupTag) {
		var replaceableElement;
		if (replaceableElement = Style.getChildGroupReplaceableElement(tag))
			Edit.replaceElement(replaceableElement, 
					Style.getStyledChildGroupClone(replaceableElement, tag, style, value, childGroupTag));
	}

	static elementStyle(tag, style, value, childGroupTag) {
		if (Style.isStyleSupported(style)) {
			var cell = Edit.getTagAboveCaret('td');
			var table = Edit.getTagAboveCaret('table');
			if ((cell) && (table)) var indexOfSelectedCell = Edit.getNodeIndex(cell, table.getElementsByTagName('*')); //Mark cell

			if (childGroupTag) Style.styleChildGroup(tag, style, value, childGroupTag)
			else {
				let element = Edit.getTagAboveCaret(tag);
				if (element) Edit.replaceElement(element, Style.getStyledElementClone(element, style, value));
			}

			if (indexOfSelectedCell) {                                                             //Return caret to marked cell
				table = Edit.getTagAboveCaret('table');
				Edit.selectRangeInNode(table.getElementsByTagName('*')[indexOfSelectedCell],0,0);
			}
		}
	}
}