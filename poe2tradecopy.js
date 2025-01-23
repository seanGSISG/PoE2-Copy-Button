// ==UserScript==
// @name         PoE2 Trade Copy Item Button
// @version      0.6
// @description  Adds a button to the PoE2 Trade page that allows you to copy the item description and affixes to your clipboard.
// @author       Kevin M - Modified by seanGSISG
// @match        https://www.pathofexile.com/trade2/*
// @icon         https://www.google.com/s2/favicons?domain=pathofexile.com
// @updateURL    https://gist.github.com/seanGSISG/d2efc1d4355456e3b7d7b89b1b804b54/raw/poe2tradecopy.user.js
// @downloadURL  https://gist.github.com/seanGSISG/d2efc1d4355456e3b7d7b89b1b804b54/raw/poe2tradecopy.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const processedRows = new Set();

    function processRow(row) {
        if (processedRows.has(row)) return;

        try {
            const leftDiv = row.querySelector('div.left');
            if (!leftDiv || !leftDiv.children || leftDiv.children.length < 2) return;

            let copy_button = leftDiv.children[1];
            copy_button.className = "copy";
            copy_button.removeAttribute("style");

            copy_button.addEventListener('click', function () {
                const itemHeader = row.querySelector('div.itemHeader.doubleLine') ?? row.querySelector('div.itemHeader');
                const content = row.querySelector('div.content');

                if (!itemHeader || !content) {
                    console.log('Item header or content not found');
                    return;
                }

                let outputText = '';

                // Rarity
                const rarity = row.querySelector('.normalPopup, .magicPopup, .rarePopup, .uniquePopup');
                if (rarity) {
                    outputText += `Rarity: ${rarity.classList[0].replace('Popup', '')}\n`;
                }

                // Item Name & Type Line
                const typeLineElem = itemHeader.querySelector('.itemName.typeLine .lc');
                const itemNameElem = itemHeader.querySelector('.itemName:not(.typeLine) .lc');
                if (itemNameElem) outputText += `${itemNameElem.innerText}\n`;
                if (typeLineElem) outputText += `${typeLineElem.innerText}\n`;

                // Quality
                const quality = content.querySelector('span[data-field="quality"] .colourAugmented');
                if (quality) {
                    outputText += '--------\n';
                    outputText += `Quality: ${quality.innerText} (augmented)\n`;
                }

                // Requirements
                const requirements = content.querySelector('.requirements');
                if (requirements) {
                    outputText += '--------\nRequirements:\n';
                    let level = requirements.querySelector('span[data-field="lvl"] .colourDefault').innerText;
                    let str = requirements.querySelector('span[data-field="str"] .colourDefault');
                    let int = requirements.querySelector('span[data-field="int"] .colourDefault');
                    let dex = requirements.querySelector('span[data-field="dex"] .colourDefault');
                    outputText += `Level: ${level}\n`;
                    if (str) outputText += `Str: ${str.innerText}\n`;
                    if (int) outputText += `Int: ${int.innerText}\n`;
                    if (dex) outputText += `Dex: ${dex.innerText}\n`;
                    outputText += '--------\n';
                }

                // Sockets
                const socketsDiv = leftDiv.querySelector('.sockets');
                if (socketsDiv && socketsDiv.children.length > 0) {
                    outputText += `Sockets: ${"S ".repeat(socketsDiv.childElementCount)}\n`;
                    outputText += '--------\n';
                }

                // Item Level
                const itemLevel = content.querySelector('.itemLevel');
                if (itemLevel) {
                    outputText += `${itemLevel.innerText.trim()}\n`;
                    outputText += '--------\n';
                }

                // Enchantments
                const enchantments = content.querySelectorAll('.enchantMod');
                if (enchantments.length > 0) {
                    let enchantSection = Array.from(enchantments).map(enchant => enchant.innerText.trim() + ' (enchant)');
                    outputText += enchantSection.join('\n') + '\n';
                    outputText += '--------\n';
                }

                // Rune & Implicit Mods
                const runeMods = content.querySelectorAll('.runeMod');
                const implicitMods = content.querySelectorAll('.implicitMod');
                if (runeMods.length > 0) {
                    outputText += Array.from(runeMods).map(rune => rune.innerText.trim() + ' (rune)').join('\n') + '\n';
                    outputText += '--------\n';
                }
                if (implicitMods.length > 0) {
                    outputText += Array.from(implicitMods).map(implicit => implicit.innerText.trim() + ' (implicit)').join('\n') + '\n';
                    outputText += '--------\n';
                }

                // Explicit Mods
                const explicitMods = content.querySelectorAll('.explicitMod');
                if (explicitMods.length > 0) {
                    outputText += Array.from(explicitMods).map(mod => mod.querySelector('.lc.s').innerText.trim()).join('\n') + '\n';
                }

                // Corrupted state
                const corrupted = content.querySelector('.unmet');
                if (corrupted) {
                    outputText += '--------\n';
                    outputText += `${corrupted.innerText}\n`;
                }

                // Price Note
                const priceNote = content.querySelector('.textCurrency');
                if (priceNote && priceNote.innerText.includes('~price')) {
                    outputText += '--------\n';
                    outputText += `Note: ${priceNote.innerText.replace('~price', '').trim()}\n`;
                }

                navigator.clipboard.writeText(outputText);
            });

            processedRows.add(row);
        } catch (e) {
            console.error('Error processing row:', e);
        }
    }

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1 && node.classList.contains('row')) {
                    if (!node.querySelector('div.itemHeader')) continue;
                    processRow(node);
                }
            }
        }
    });

    document.querySelectorAll('div.row').forEach(row => {
        if (row.querySelector('div.itemHeader')) {
            processRow(row);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();