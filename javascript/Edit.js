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

// HTML selection functions
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
//	static setCaretAfterNode(node) {			//These probably work but I haven't tested them yet
//	    var range = document.createRange();
//	    range.setStartAfter(node);
//	    range.setEndAfter(node);
//	    Edit.selectRange(range);
//	}
//	static setCaretBeforeNode(node) {
//	    var range = document.createRange();
//	    range.setStartBefore(node);
//	    range.setEndBefore(node);
//	    Edit.selectRange(range);
//	}

// All editing commands are routed through the execCommand function.
	static execCommand(action, value) {
		document.execCommand(action, false, value);    //Only place where changes to the Document occur
		Edit.focusInContentEditable();
	}
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
	
// Function to tame unruly tables created by other word processors. In this editor, width and and other column styles are 
// handled exclusively at the cell level. Allowing these styles to be managed by (1) the table itself, (2) at the col level, 
// and (3) at the cell level creates more dependencies than can be handled by a simple editor of this type. Total table
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

		if (['ol','ul'].includes(element.tagName.toLowerCase())) Edit.selectDeleteAndReplaceNode(element, replacement);
		else Edit.selectAndReplaceNode(element, replacement);
	}
}
