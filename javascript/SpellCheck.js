/*Copyright (c) 2020 by Kei G. Gauthier, Longmeadow, MA, USA
*
* This software is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
*
* You should have received a copy of the license along with this
* work.  If not, see <http://creativecommons.org/licenses/by-nc-sa/3.0/>.
*/

'use strict';

// Uses FindReplace.js and typo.js

// Class to facilitate spell check find and replace operations
class SpellCheck {
	constructor(typo) {
		this.typo = typo;
		this.ignoreWords = [];
		this.findReplace;
	}
	addIgnoreWord(word) {
		this.ignoreWords.push(word);
	}
	resetIgnoreWords() {
		this.ignoreWords = [];
	}
	getSuggestions(word) {
		return this.typo.suggest(word);
	}
	replaceSelectedWord(replacement) {
		this.findReplace.replacement = replacement;
		this.findReplace.replace();
		this.continue()
	}
	replaceSelectedWordAll(error, replacement) {
		var nodeIndex = this.findReplace.nodeIndex;
		var nodeStartOffset = this.findReplace.startOffset;
		this.findReplace.target = error;
		this.findReplace.replacement = replacement;
		this.findReplace.replaceAll();
		this.findReplace.nodeIndex = nodeIndex;
		this.findReplace.endOffset = nodeStartOffset + replacement.length;
		this.continue()
	}

	findNextError() {
		var textNodes = Edit.getChildTextNodes(document.getElementById("keieditable"));
		for (this.findReplace.nodeIndex; this.findReplace.nodeIndex<textNodes.length; this.findReplace.nodeIndex++) {
			let regex = /[A-Za-z\-]+/g; // Return groups of letters
			let text = textNodes[this.findReplace.nodeIndex].nodeValue.substring(this.findReplace.endOffset);
			let words;
			while (words = regex.exec(text)) {
				if (this.ignoreWords.includes(words[0])) continue;
				if (this.typo.check(words[0]) == false) {
					this.findReplace.startOffset = this.findReplace.endOffset + words.index;
					this.findReplace.endOffset = this.findReplace.startOffset + words[0].length;
					textNodes[this.findReplace.nodeIndex].parentElement.scrollIntoView();
					selection = this.findReplace.getSelection();
					return words[0];
				}
			}
			this.findReplace.startOffset = 0; // Reset for next node or next spell check session
			this.findReplace.endOffset = 0; // Reset for next node or next spell check session
		}
		return undefined;
	}

// In their 'this' and modal button calls, initialize() and continue() reference a global SpellCheck 
// instance that must be named 'spellCheck'
	initialize() {
		if (document.getElementById("keieditable").innerHTML == "") {
			return;
		}
		this.findReplace = new FindReplace();
		document.getElementById('mutableModalTitle').innerHTML = "Spell Check";
		this.continue();
	}

	continue() {
		let error = this.findNextError();
		if (error != undefined) {
			document.getElementById('mutableModalBody').innerHTML = 
				`<input ID="spellCheckReplacement" type="text" class="form-control" value="` +
				error
				+
				`"></input>
				<div class="row m-1">
					<span class="col-12 text-primary text-center">Suggestions</span>
				</div>`
			let suggestions = this.getSuggestions(error);
			for (let i=0; i<suggestions.length; i++) {
				document.getElementById('mutableModalBody').innerHTML = 
					document.getElementById('mutableModalBody').innerHTML +
					`<div class="list-group"><div class="list-group-item list-group-item-action"
					onclick="document.getElementById('spellCheckReplacement').value='` +
					suggestions[i] +
					`'">` + 
					suggestions[i] +
					"</div></div>"				
			}
			document.getElementById('mutableModalFooter').innerHTML = "";
			document.getElementById('mutableModalFooter')
				.appendChild(Menus.modalButtonNoDismiss("Replace", "spellCheck.replaceSelectedWord(" +
					"document.getElementById('spellCheckReplacement').value)"));
			document.getElementById('mutableModalFooter')
				.appendChild(Menus.modalButtonNoDismiss("Replace All", "spellCheck.replaceSelectedWordAll('" +
				error +
				"', document.getElementById('spellCheckReplacement').value)"));
			document.getElementById('mutableModalFooter')
				.appendChild(Menus.modalButtonNoDismiss("Ignore", "spellCheck.continue()"));
			document.getElementById('mutableModalFooter')
				.appendChild(Menus.modalButtonNoDismiss("Ignore All","spellCheck.addIgnoreWord('" +
				error + 
				"');spellCheck.continue()"));
			Menus.mutableModalShow();
		} else this.finish();
	}

	finish() {
		document.getElementById('mutableModalBody').innerHTML = 
			`<div>
				<div class="row m-1">Spell Check Complete</div>
					<div class="row m-1">
				</div>
			 </div>`;
		document.getElementById('mutableModalFooter').innerHTML = "";
		document.getElementById('mutableModalFooter').appendChild(Menus.modalButton("Finish"));
		Menus.mutableModalShow();
	}
}