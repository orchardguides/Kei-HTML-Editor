/*Copyright (c) 2020 by Kei G. Gauthier, Longmeadow, MA, USA
*
* This software is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
*
* You should have received a copy of the license along with this
* work.  If not, see <http://creativecommons.org/licenses/by-nc-sa/3.0/>.
*/

'use strict';

// Uses Edit.js

// Class to handle finding and replacing text selections in HTML documents
class FindReplace {
	constructor(nodeIndex, startOffset, endOffset) {
		this.nodeIndex = ((nodeIndex) ? nodeIndex : 0);
		this.startOffset = ((startOffset) ? startOffset : 0);
		this.endOffset = ((endOffset) ? endOffset : 0);
	}

	getNodeIndex() {
		return this.nodeIndex;
	}
	setNodeIndex(nodeIndex) {
		this.nodeIndex = nodeIndex;
	}
	incrementNodeIndex() {
		this.nodeIndex++;
	}

	getStartOffset() {
		return this.startOffset;
	}
	setStartOffset(startOffset) {
		this.startOffset = startOffset;
	}
	getEndOffset() {
		return this.endOffset;
	}
	setEndOffset(endOffset) {
		this.endOffset = endOffset;
	}

	getSelection() {
		var textNodes = Edit.getChildTextNodes(document.body);
		Edit.selectRangeInNode(textNodes[this.nodeIndex], this.startOffset, this.endOffset);
		return window.getSelection().toString();
	}
	highlightSelection() {
		var textNodes = Edit.getChildTextNodes(document.body);
		Edit.selectRangeInNode(textNodes[this.nodeIndex], this.startOffset, this.endOffset);
	}
	replaceSelection(replacement) {
		var textNodes = Edit.getChildTextNodes(document.body);
		Edit.selectRangeInNode(textNodes[this.nodeIndex], this.startOffset, this.endOffset);
		Edit.insertText(replacement);
		this.endOffset = this.startOffset + replacement.length;
	}

// Find and replace functions
	findNextMatch(string, matchCase) {
		var textNodes = Edit.getChildTextNodes(document.body);
		for (this.nodeIndex; this.nodeIndex<textNodes.length; this.nodeIndex++) {
			let regex = new RegExp(Edit.escapeForRegex(string), ((matchCase) ? 'g' : 'gi'));
			let text = textNodes[this.nodeIndex].nodeValue.substring(this.endOffset);
			let words;
			while (words = regex.exec(text)) {
				this.startOffset = this.endOffset + words.index;
				this.endOffset = this.startOffset + words[0].length;
				return true;
			}
			this.startOffset = 0;                           // Reset for next node
			this.endOffset = 0;                             // Reset for next node
		}
		return false;
	} 
	replaceSelectionAll(replacement, matchCase) {
		var selection = this.getSelection();
		this.replaceSelection(replacement);
		while (this.findNextMatch(selection, matchCase)) this.replaceSelection(replacement);
	}

	findNextWordMatch(word) {
		var textNodes = Edit.getChildTextNodes(document.body);
		for (this.nodeIndex; this.nodeIndex<textNodes.length; this.nodeIndex++) {
			let regex = /[A-Za-z]+/g; // Return groups of letters
			let text = textNodes[this.nodeIndex].nodeValue.substring(this.endOffset);
			let words;
			while (words = regex.exec(text)) {
				if (words[0] == word) {
					this.startOffset = this.endOffset + words.index;
					this.endOffset = this.startOffset + words[0].length;
					return true;
				}
			}
			this.startOffset = 0;                           // Reset for next node
			this.endOffset = 0;                             // Reset for next node
		}
		return false;
	}
	replaceSelectedWordAll(replacement) {
		var selection = this.getSelection();
		this.replaceSelection(replacement);
		while (this.findNextWordMatch(selection)) this.replaceSelection(replacement);
	}

}