# PoE Bulk Shopper

Chrome extension for the [Path of Exile trade site](https://www.pathofexile.com/trade). It adds a floating widget with several utilities for improving your trade experience, including: 

1. Bulk Search: searching for users with multiple listings
2. Auto-trade: enable with a live-search active to instantaneously click "travel to hideout" as soon as results appear
3. Saved searches: save and load pre-configured searches

## Install (unpacked)

***DISCLAIMER***
As a general rule, you should not load random unpacked extensions. They have the potential to alter your computer's behavior on websites in ways you may not anticipate, even leading to compromise of data. Do not follow these steps for any code you do not personally understand. In order to minimize the "scary factor" of this extension, it only has access to appear specifically on the trade portions of the pathofexile website. 

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder (`poe_shopping_util`)


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
- Auto-trade is not fast enough to compete with full-on bots. There might be some optimization possible, but as of now, I suspect a bigger limitation is just server distance. You will still arrive/click before the vast majority of human shoppers.
- When using auto-trade, if your items are in high demand, consider turning your graphical and audio settings down as low as possible, to minimize hideout load time. 
- For bulk trade, the "2+ listings" rule may not always work. I suggest setting a minimum price a bit **above** the current cheapest listings. Also feel free to tweak that MIN_LISTINGS variable in bulk-find.js
- You must be logged in to the trade site for Auto-Trade/Bulk search to work.
- Works on both PoE 1 (`/trade`) and PoE 2 (`/trade2`) trade pages.
