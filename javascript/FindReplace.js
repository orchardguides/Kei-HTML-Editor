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
	constructor(target, replacement, matchCase) {
		this.TARGET = target;
		this.REPLACEMENT = replacement;
		this.MATCHCASE = matchCase;
		this.NODEINDEX = 0;
		this.STARTOFFSET = 0;
		this.ENDOFFSET = 0;
	}

	get endOffset() {
		return this.ENDOFFSET;
	}
	set endOffset(endOffset) {
		this.ENDOFFSET = endOffset;
	}
	get matchCase() {
		return this.MATCHCASE;
	}
	set matchCase(matchCase) {
		this.MATCHCASE = matchCase;
	}
	get nodeIndex() {
		return this.NODEINDEX;
	}
	set nodeIndex(nodeIndex) {
		this.NODEINDEX = nodeIndex;
	}
	get replacement() {
		return this.REPLACEMENT;
	}
	set replacement(replacement) {
		this.REPLACEMENT = replacement;
	}
	get startOffset() {
		return this.STARTOFFSET;
	}
	set startOffset(startOffset) {
		this.STARTOFFSET = startOffset;
	}
	get target() {
		return this.TARGET;
	}
	set target(target) {
		this.TARGET = target;
	}

// Find and replace functions
	find() {
		var textNodes = Edit.getChildTextNodes(document.getElementById('keieditable'));
		for (this.nodeIndex; this.nodeIndex<textNodes.length; this.nodeIndex++) {
			let regex = new RegExp(Edit.escapeForRegex(this.target), ((this.matchCase) ? 'g' : 'gi'));
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
	replace() {
		var textNodes = Edit.getChildTextNodes(document.getElementById('keieditable'));
		Edit.selectRangeInNode(textNodes[this.nodeIndex], this.startOffset, this.endOffset);
		Edit.insertText(this.replacement);
		this.endOffset = this.startOffset + this.replacement.length;
	}
	replaceAll() {
		this.replace();
		while (this.find()) this.replace();
	}
	getSelection() {
		var textNodes = Edit.getChildTextNodes(document.getElementById('keieditable'));
		return Edit.getRangeInNode(textNodes[this.nodeIndex], this.startOffset, this.endOffset);
	}

	findNext() {
		if (this.find()) {
			selection = this.getSelection();
			Menus.mutableModalShow();
		}  else FindReplace.finish();
	}
	replaceAndNext() {
		this.replace();
		this.findNext();
	}
	replaceAllAndFinish() {
			this.replaceAll();
			FindReplace.finish();
	}

	static initialize() {
		document.getElementById('mutableModalTitle').innerHTML = "Find & Replace";
		document.getElementById('mutableModalBody').innerHTML = 
			`<div>
				<div class="row m-1">
					<span class="col-12 text-primary text-center">Find</span>
				</div>
				<div class="row m-1">
					<input type="text" id="target" class="col-12"></input>
				</div>
				<div class="row m-1">
					<span class="col-12 text-primary text-center">Replace</span>
				</div>
				<div class="row m-1">
					<input type="text" id="replacement" class="col-12"></input>
				</div>
				<div class="row mt-2 mr-1 mb-1 ml-1">
					<input type="checkbox" id="matchCase" class="col-1"></input>
					<span class="col-7 text-primary text-center">Match Case</span>
				</div>
			 </div>`;
		document.getElementById('mutableModalFooter').innerHTML = "";
		document.getElementById('mutableModalFooter').appendChild(Menus.modalButtonNoDismiss("Find",  "FindReplace.continue()"));
		Menus.mutableModalShow();
	}

// In their code and modal button calls, continue() and finish() reference a global FindReplace instance 
// which must be named 'findReplace'
	static continue() {
		if (document.getElementById("target").value == "") {
			$('#mutableModal').modal("hide");
			return;
		}

		findReplace = new FindReplace(document.getElementById("target").value, 
											document.getElementById("replacement").value, 
											document.getElementById("matchCase").checked);
		if (findReplace.find()) {
			document.getElementById('mutableModalBody').innerHTML = 
				`<div>
					<div class="row m-1">
						<span class="col-12 text-primary text-center">Find</span>
					</div>
					<div class="row m-1">
						<span class="col-12">` + findReplace.target + `</span>
					</div>
					<div class="row m-1">
						<span class="col-12 text-primary text-center">Replace With</span>
					</div>
					<div class="row m-1">
						<span class="col-12">` + findReplace.replacement + `</span>
					</div>
					<div class="row m-1">
						<span class="col-12 text-primary text-center">` + ((findReplace.matchCase) ? 'Match Case' : 'Case Insensitive') + `</span>
					</div>
			 	</div>`;
			document.getElementById('mutableModalFooter').innerHTML = "";
			document.getElementById('mutableModalFooter').appendChild(Menus.modalButtonNoDismiss("Replace",  "findReplace.replaceAndNext()"));
			document.getElementById('mutableModalFooter').appendChild(Menus.modalButtonNoDismiss("Replace All",  "findReplace.replaceAllAndFinish()"));
			document.getElementById('mutableModalFooter').appendChild(Menus.modalButtonNoDismiss("Find Next",  "findReplace.findNext()"));

			selection = findReplace.getSelection();
			Menus.mutableModalShow();
		} else FindReplace.finish(); 
	}
	static finish() {
		document.getElementById('mutableModalBody').innerHTML = 
			`<div>
				<div class="row m-1">
					<label class="col-12 text-primary text-center">Find</label>
					</div>
					<div class="row m-1">
					<label class="col-12">` + findReplace.target + `</label>
				</div>
				<div class="row m-1">
					<h6 class="col-12 text-primary text-center">No More Matches</h6>
				</div>
			 </div>`;
		document.getElementById('mutableModalFooter').innerHTML = "";
		document.getElementById('mutableModalFooter').appendChild(Menus.modalButton("Finish"));
		Menus.mutableModalShow();
	}
}