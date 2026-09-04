# PoE Bulk Shopper

Chrome extension for the [Path of Exile trade site](https://www.pathofexile.com/trade). It adds a floating widget that scrolls through search results until it finds the first seller with **two or more listings**, then clicks their **Direct Whisper** trade button.

## Install (unpacked)

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder (`bulk-shopper`)

## Usage

1. Go to [pathofexile.com/trade](https://www.pathofexile.com/trade) and run an item search
2. A **Bulk Shopper** widget appears in the bottom-right corner
3. Click **Find 2+ Listings**
4. The extension scrolls through results, tracks sellers, and clicks the trade link for the first account with at least two listings

Use **Stop** to cancel a scan in progress. Click the hammer button to collapse or expand the widget.

## Live search Arm

1. Start a **live search** on the trade site
2. Click **Arm**
3. When a new listing appears, the extension clicks **Travel To Hideout** immediately (including **Teleport anyway?** if that prompt shows)
4. Arm turns off after that click, or if you click **Arm** again while it is already armed

Existing listings on the page are ignored. Only rows that appear after you arm are clicked.

## Tips

- Turn **Collapse Listings by Account** **off** in search settings so multiple listings from the same seller appear as separate rows. The extension counts distinct rows per account name.
- You must be logged in to the trade site for Direct Whisper to work.
- Works on both PoE 1 (`/trade`) and PoE 2 (`/trade2`) trade pages.



Please adjust the code in the following ways:

Make it so that "save search" prompts the user for an associated name for the search, and displays that in the load dropdown instead of the search url (modal, textinput, whatever is easier)

Please move the widget from the bottom right to the top right. 

Please give the widget a slightly different color when armed, such that I can tell it's still armed if I collapse it. 