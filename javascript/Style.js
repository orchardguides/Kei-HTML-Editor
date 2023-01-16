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
			'color', 'columnCount', 'fontFamily', 'fontSize', 'height', 'listStyleType', 'marginBottom', 'padding', 'textAlign', 'verticalAlign', 'width']
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
		if (tag.toLowerCase() == 'col') return Edit.getTagNodeAboveCaret('table');
		if (['ul','ol'].includes(tag.toLowerCase())) return Edit.getTagsNodeAboveCaret(['ul', 'ol']);
		return Edit.getTagNodeAboveCaret(tag);
	}

	static getStyledChildGroupClone(replaceableElement, tag, style, value, childGroupTag) {
		var clonedReplaceableElement = replaceableElement.cloneNode(true);
		var clonedChildren = [];
		if (tag.toLowerCase() == 'col') {
			let cell = Edit.getTagNodeAboveCaret('td');
			let visualColumnIndex = Table.getVisualColumnIndex(cell);

			let clonedCells = clonedReplaceableElement.getElementsByTagName('td');
			if (clonedCells) {
				for (let clonedCell of clonedCells) 
					if (visualColumnIndex == Table.getVisualColumnIndex(clonedCell)) clonedChildren.push(clonedCell);
			}
		} else clonedChildren = clonedReplaceableElement.getElementsByTagName(childGroupTag);
		if (childGroupTag.toLowerCase() == 'li') {
			for (let clonedChild of clonedChildren) {
				clonedChild.innerHTML = clonedChild.innerHTML.replace('<br>', '');
				clonedChild.innerHTML = clonedChild.innerHTML.replace('<BR>', '');
			}
		}

		for (let i=0; i<clonedChildren.length; i++) Style.styleElement(clonedChildren[i], style, value);
		return clonedReplaceableElement;
	}

	static elementStyle(tag, style, value, childGroupTag) {
		if (tag.toLowerCase() == 'td') childGroupTag = null;
		var caretNodeIndex = Edit.getCaretNodeIndexInDocument();

		if (childGroupTag) childGroupMultipleStyles(tag, ((Array.isArray(style)) ? style : [style]),  ((Array.isArray(value)) ? value : [value]), childGroupTag);
		else elementMutipleStyles(tag, ((Array.isArray(style)) ? style : [style]), ((Array.isArray(value)) ? value : [value]));

		if (caretNodeIndex) Edit.putCaretInIndexedNode(caretNodeIndex);

		function childGroupMultipleStyles(tag, styleArray, valueArray, childGroupTag) {
			let replaceableElement = Style.getChildGroupReplaceableElement(tag);
			let clonedReplaceableElement = replaceableElement.cloneNode(true);
			if (clonedReplaceableElement) {
				for (let i=0; i<styleArray.length; i++)
					if (Style.isStyleSupported(styleArray[i]))
						clonedReplaceableElement = Style.getStyledChildGroupClone(clonedReplaceableElement, tag, styleArray[i], valueArray[i], childGroupTag);
				if (replaceableElement.isEqualNode(clonedReplaceableElement) == false) Edit.replaceElement(replaceableElement, clonedReplaceableElement);
			}
		}

		function elementMutipleStyles(tag, styleArray, valueArray) {
			var element = Edit.getTagNodeAboveCaret(tag);
			var clonedElement = element.cloneNode(true);
			for (let i=0; i<styleArray.length; i++)
				if (Style.isStyleSupported(styleArray[i])) clonedElement = Style.getStyledElementClone(clonedElement, styleArray[i], valueArray[i]);
			if (element.isEqualNode(clonedElement) == false) Edit.replaceElement(element, clonedElement);	
		}
	}
}
