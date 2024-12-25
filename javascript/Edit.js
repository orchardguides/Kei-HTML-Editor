/*Copyright (c) 2020 by Kei G. Gauthier, Longmeadow, MA, USA
*
* This software is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
*
* You should have received a copy of the license along with this
* work.  If not, see <http://creativecommons.org/licenses/by-nc-sa/3.0/>.
*/

'use strict';

//Collection of static functions to support HTML editing
class Edit {

//Useful function
	static getClonedNodeArray(arrayOfNodes) {
		let clonedNodeArray = [];
		for (node of arrayOfNodes) clonedNodeArray.push(node.cloneNode(true));
		return clonedNodeArray;
	}

//Function to escape javascript string for use by regex
	static escapeForRegex(string) {
		return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&').replace(/\s/g, '\\s');
	}

//Function to move focus to keieditable
	static focusInContentEditable() {
		setTimeout(
			function() {
				document.getElementById('keieditable').focus(); 
			}, 100
		);
	}

// Basic HTML tools
	static getNodeIndexInArray(node, nodes) {
		for (let i=0; i<nodes.length; i++) if (node === nodes[i]) return i;
	}
	static getNodeIndexInDocument(node) {
		return Edit.getNodeIndexInArray(node, document.getElementById('keieditable').getElementsByTagName('*'));
	}
	static getCaretNodeIndexInDocument() {
		return Edit.getNodeIndexInDocument(Edit.getNodeAboveCaret());
	}
	static putCaretInIndexedNode(nodeIndex) {
		Edit.selectRangeInNode(document.getElementById('keieditable').getElementsByTagName('*')[nodeIndex],0,0);
	}

	static cloneAttributes(element, target) {
		var attributes;
		if ((attributes = Array.prototype.slice.call(element.attributes)) == undefined) return;
		for (let i=0; i<attributes.length; i++) target.setAttribute(attributes[i].nodeName, attributes[i].nodeValue);
	}
	static getChildTextNodes(parent) {
		var textNode;
		var textNodes = [];
		var treeWalker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null, false);
		while (textNode = treeWalker.nextNode()) textNodes.push(textNode);
		return textNodes;
	}
	static getFirstLeaf(node) {
		if (node.firstChild) return Edit.getFirstLeaf(node.firstChild);
		else return node;
	}
	static getLastLeaf(node) {
		if (node.lastChild) return Edit.getLastLeaf(node.lastChild);
		else return node;
	}

	static getNextNode(node) {
    	if (node.firstChild) return node.firstChild;
    	while (node) {
        	if (node.nextSibling) return node.nextSibling;
        	node = node.parentNode;
    	}
	}

	static selectRange(range) {
	    var selection = window.getSelection();
	    selection.removeAllRanges();
	    selection.addRange(range);
	}
	static selectNode(node) {
	    var range = document.createRange();
	    range.setStartBefore(node);
	    range.setEndAfter(node);
	    Edit.selectRange(range);
	}
	static getRangeInNode(node, startOffset, endOffset) {
	    var range = document.createRange();
	    range.setStart(node, startOffset);
	    range.setEnd(node, endOffset);
	    return range;
	}
	static selectRangeInNode(node, startOffset, endOffset) {
	    Edit.selectRange(Edit.getRangeInNode(node, startOffset, endOffset));
	}
	static setCaretAfterNode(node) {
	    var range = document.createRange();
	    range.setStartAfter(node);
	    range.setEndAfter(node);
	    Edit.selectRange(range);
	}
	static setCaretBeforeNode(node) {
	    var range = document.createRange();
	    range.setStartBefore(node);
	    range.setEndBefore(node);
	    Edit.selectRange(range);
	}

// All editing commands are routed through the execCommand function.
	static execCommand(action, value) {
		document.execCommand(action, false, value);    //Only place where changes to the Document occur
		Edit.focusInContentEditable();
	}
//	static execCommandWithoutCrossingBlock(action, value) {
//		Edit.execCommand(action, value);
//	}
	static insertHTML(html) {
		Edit.execCommand('insertHTML', html);
	}
	static insertText(text) {
		Edit.execCommand('insertText', text);
	}
	static selectAndReplaceNode(node, replacement) {
		Edit.selectNode(node);
		Edit.insertHTML(replacement.outerHTML);
	}
	static deleteNode(node) {  //Does not work with DIVs
		Edit.selectNode(node);
		Edit.execCommand('delete');
	}
	static selectDeleteAndReplaceNode(node, replacement) {
		Edit.deleteNode(node);
		Edit.insertHTML(replacement.outerHTML);
	}

//Functions to return parent nodes and information about parent nodes
	static getNodeAboveCaret() {
		return window.getSelection().getRangeAt(0).startContainer;
	}
	static getTagNodeAboveNode(node, tag) {
		while (node) 
			if ((node.tagName) && (node.tagName.toLowerCase() == tag.toLowerCase())) return node;
			else node = node.parentElement;
	}
	static getTagsNodeAboveNode(node, tagArray) {
		let ancestor;
		for (let tag of tagArray) if (ancestor = Edit.getTagNodeAboveNode(node, tag)) return ancestor;
	}
	static getTagNodeAboveCaret(tag) {
		var node = window.getSelection().getRangeAt(0).startContainer;
		return Edit.getTagNodeAboveNode(node, tag);
	}
	static getTagsNodeAboveCaret(tagArray) {
		let ancestor;
		for (let tag of tagArray) if (ancestor = Edit.getTagNodeAboveCaret(tag)) return ancestor;
	}
	static isCaretInsideTag(tag) {
		if (Edit.getTagNodeAboveCaret(tag)) return true;
		return false;
	}
	static isCaretInsideTags(tagArray) {
		if (!document.hasFocus()) return false;
		for (let tag of tagArray) if (Edit.isCaretInsideTag(tag)) return true;
		return false;
	}

	static isLogicalOperatorSupported(logicalOperator, value) {
		if (['==', '!=', '>', '>=', '<', '<='].includes(logicalOperator) == false) return false;
		if ((isNaN(value)) && (['==', '!='].includes(logicalOperator) == false)) return false;
		return true;
	}
	static doesElementHaveAttribute(element, attribute, logicalOperator, value) {
		if (Edit.isLogicalOperatorSupported(logicalOperator, value) == false) return false;
		if (eval('element.getAttribute(\"' + attribute + '\") ' + logicalOperator +  ' \"' + value + '\"')) return true;
		return false;
	}
	static getTagNodeWithAttributeAboveCaret(tag, attribute, logicalOperator, value) {
		var node = window.getSelection().getRangeAt(0).startContainer;
		while (node) {
			if ((node[attribute]) && (node.tagName) && (node.tagName.toLowerCase() == tag.toLowerCase()) && 
				(Edit.doesElementHaveAttribute(node, attribute, logicalOperator, value))) return node;
			else node = node.parentElement;
		}
	}
	static isCaretInsideTagNodeWithAttribute(tag, attribute, logicalOperator, value) {
		if (!document.hasFocus()) return false;
		if (Edit.getTagNodeWithAttributeAboveCaret(tag, attribute, logicalOperator, value)) return true;
		else return false;
	}
	static getParentWithAttributeAboveCaret(attribute, logicalOperator, value) {
		var node = window.getSelection().getRangeAt(0).startContainer;
		while (node) {
			if ((node[attribute]) && (Edit.doesElementHaveAttribute(node, attribute, logicalOperator, value))) return node;
			else node = node.parentElement;
		}
	}
	static isCaretInsideAttribute(attribute, logicalOperator, value) {
		if (!document.hasFocus()) return false;
		if (Edit.getParentWithAttributeAboveCaret(attribute, logicalOperator, value)) return true;
		else return false;
	}

// Functions to prevent document changes from crossing into other block elements
	static execCut() {
	    var range = window.getSelection().getRangeAt(0);
	    if (range == undefined) return;

	    var startParent = Edit.getTagsNodeAboveNode(range.startContainer, ['table', 'ol', 'ul']);
	    var endParent = Edit.getTagsNodeAboveNode(range.endContainer, ['table', 'ol', 'ul']);
	    if (startParent == endParent) { //Also handles when both are undefined
			Edit.execCommand('cut');
			return;
		}
		if (endParent) {
			let endParentRange = document.createRange();
			endParentRange.setStartBefore(Edit.getFirstLeaf(endParent));
	    	endParentRange.setEnd(range.endContainer, range.endOffset);
			Edit.selectRange(endParentRange);			
			Edit.execCommand('cut');
		}
		let beforeBetweenRange = document.createRange();
		if (startParent) beforeBetweenRange.setStartAfter(startParent);
		else beforeBetweenRange.setStart(range.startContainer, range.startOffset);
		if (endParent) beforeBetweenRange.setEndBefore(endParent);
		else beforeBetweenRange.setEnd(range.endContainer, range.endOffset);
		Edit.selectRange(beforeBetweenRange);
		Edit.execCommand('cut');
		if ((startParent) && (endParent)) Edit.insertHTML('<br>');

		if (startParent == undefined) return;

		let startParentRange = document.createRange();
		startParentRange.setStart(range.startContainer, range.startOffset);
		startParentRange.setEndAfter(Edit.getLastLeaf(startParent));
		Edit.selectRange(startParentRange);
		Edit.execCommand('cut');
	}

	static execPaste() {
		Edit.execCommand('paste');
	}

	static trimTagFromSelection(tag) {
	    var range = window.getSelection().getRangeAt(0);
	    var startParent = Edit.getTagNodeAboveNode(range.startContainer, tag);
	    var endParent = Edit.getTagNodeAboveNode(range.endContainer, tag);
		if (startParent == endParent) return;
		if (startParent) range.setStartAfter(startParent);
		if (endParent) range.setEndBefore(endParent);
		Edit.selectRange(range);
	}

// Function to tame unruly tables created by other word processors. In this editor, width and and other column styles are 
// handled exclusively at the cell level. Allowing these styles to be managed by (1) the table itself, (2) at the col level, 
// or (3) at the cell level creates more dependencies than can be handled by a simple editor of this type. Total table
// width is simply the sum of widths of the cells in the widest table row.
	static sanitizeTable(table) {
		var colgroups = table.getElementsByTagName('colgroup');
		for (let colgroup of colgroups) table.removeChild(colgroup);
		table.style.width = null;
	}

// HTML ELEMENT replacement functions
	static replaceElement(element, replacement) {  //Does not work with DIVs
		if (['tr','td'].includes(element.tagName.toLowerCase())) {
			let table = Edit.getTagNodeAboveNode(element, 'table');
			if (table) {
				let clonedTable = table.cloneNode(true);
				let children = table.getElementsByTagName('*');
				for (let i=0; i<children.length; i++) {
					if (children[i] == element) {
						clonedTable.getElementsByTagName('*')[i].outerHTML = replacement.outerHTML;
						break;
					}
				}
				element = table;
				replacement = clonedTable;
			} else return;
		}
		if (replacement.tagName.toLowerCase() == 'table') Edit.sanitizeTable(replacement); // Edit.sanitizeTable(table) call

		if (['ol','ul'].includes(element.tagName.toLowerCase())) {
			Edit.setCaretAfterNode(element);
			Edit.insertHTML('<br>');				// Kludge to ensure that the list does not absorb the block element that follows
			Edit.selectDeleteAndReplaceNode(element, replacement);
		}
		else Edit.selectAndReplaceNode(element, replacement);
	}
}
