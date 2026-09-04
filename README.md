# PoE Bulk Shopper

Chrome extension for the [Path of Exile trade site](https://www.pathofexile.com/trade). It adds a floating widget that scrolls through search results until it finds the first seller with **two or more listings**, then clicks their **Direct Whisper** trade button.

## Install (unpacked)

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder (`bulk-shopper`)

## Bulk Search

1. Go to [pathofexile.com/trade](https://www.pathofexile.com/trade) and run an item search
2. A **Shopping Tools** widget appears in the top-right corner
3. Click **Find 2+ Listings**
4. The extension scrolls through results, tracks sellers, and clicks the trade link for the first account with at least two listings

Use **Stop** to cancel a scan in progress. Click the hammer button to collapse or expand the widget.

## Live search Arm

1. Start a **live search** on the trade site
2. Click **Arm**
3. When a new listing appears, the extension clicks **Travel To Hideout** immediately (including **Teleport anyway?** if that prompt shows)
4. Arm turns off after that click, or if you click **Arm** again while it is already armed


## Saved Searches

1. Run a search
2. Click **Save**
3. Enter a name when prompted, e.g. "4-mod amulets"
4. Use the **Load Search** dropdown to select a saved search. 
5. Saved searches can be deleted with the red **X** button. You may need to recreate some saved searches on new league.

## Tips

- Turn **Collapse Listings by Account** **off** in search settings so multiple listings from the same seller appear as separate rows. The extension counts distinct rows per account name.
- You must be logged in to the trade site for Auto-Trade to work.
- Works on both PoE 1 (`/trade`) and PoE 2 (`/trade2`) trade pages.
