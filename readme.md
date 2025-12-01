# Broadband Material Request Form

This document provides an overview and instructions for the **Broadband Material Request Form**, a single-page web application designed for quick material ordering and generation of a formal issue sheet.

## 💡 Overview

The application is a client-side tool allowing field staff to select required materials from a categorized catalog, specify order details (like truck number and personnel), and instantly generate a standardized Excel file (.xlsx) suitable for formal documentation and inventory tracking.

It is built as a highly responsive, app-like experience for use on mobile devices and desktop browsers.

## 🛠️ Technology & Dependencies

This application is built entirely on the client side (in the user's browser) using:

* **HTML5 & Vanilla JavaScript:** Core structure and operational logic.
* **Tailwind CSS (via CDN):** Provides modern, utility-first styling and ensures responsiveness.
* **SheetJS (js-xlsx via CDN):** Essential library for generating and formatting the final Excel spreadsheet file.

## 🚀 Key Features

* **Smart Bundles (Kits):** One-tap addition of pre-configured item sets (e.g., "Migration Bundle", "Fiber Restock") to speed up common ordering tasks.
* **Mobile-Optimized Interface:** Designed for rapid item selection on a small screen with sticky headers, search, and category filters.
* **Interactive Catalog:** Allows quantity selection directly on the main grid. Selected items are visually highlighted.
* **Dynamic Cart Drawer:** A slide-up interface to review, modify, and remove items before download.
* **Required Field Validation:** Ensures the Truck Number is entered before the download can proceed.
* **Automatic Excel Generation:** Outputs a structured material issue sheet with item IDs, descriptions, and requested quantities, along with necessary header information (Date, Warehouses, Personnel).

## 📝 How to Use

1.  **Enter Order Details**
    * On desktop, the input fields are visible at the top.
    * On mobile, tap the "Order Info" button to toggle the details section open.
    * Fill out the Order Date, To Warehouse/Truck (mandatory), Issued By, and Received By fields.

2.  **Select Materials**
    * **Using Bundles:** Tap the **📦 Bundles** category filter to view available kits. Tapping a Bundle card will instantly add all specific items and quantities associated with that kit to your cart.
    * **Individual Items:** Use the other Category buttons (Equipment, Fiber/Copper, etc.) or the Search input to find specific items.
    * Use the **+** and **-** buttons on the item cards to adjust quantities. The running Total Items count is displayed in the footer.

3.  **Review and Download**
    * Tap "View Cart" in the footer to open the Cart Drawer for a full review of selected items.
    * Click the green "Download Order" button (available in both the footer and the cart drawer).
    * The browser will download an Excel file named: `[YYYY-MM-DD] [Truck Number] broadband order request.xlsx`.

## ⚠️ Maintenance Notes

* **Hardcoded Catalog:** The material list is hardcoded in the `catalog` array in the script. To update items (add/remove or change IDs), the source HTML file must be edited.
* **Bundle Configuration:** Bundles are defined in the `bundleConfig` array. To change what items or quantities are inside a bundle, edit this array in the source code.
* **No Data Persistence:** Cart selections and input fields are not saved if the page is closed or refreshed. The user must complete the order and download the Excel file in a single session.
* **Unique IDs:** Note that some items use the ID "NA". While this works for the current functionality, using unique, actual part numbers is highly recommended for inventory system compatibility.
