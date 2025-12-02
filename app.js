// app.js

// --- DATA STATE ---
let catalog = [];
let bundleConfig = [];
let cart = {};  
let currentFilter = 'All';
let isDetailsOpen = false;

// --- INIT ---
async function initApp() {
    // Set Dates
    const today = new Date().toISOString().split('T')[0];
    const orderDateEl = document.getElementById('orderDate');
    const orderDateMobileEl = document.getElementById('orderDateMobile');
    
    if(orderDateEl) orderDateEl.value = today;
    if(orderDateMobileEl) orderDateMobileEl.value = today;

    // Load Data
    try {
        const [invRes, bunRes] = await Promise.all([
            fetch('inventory.json'),
            fetch('bundles.json')
        ]);
        
        if (!invRes.ok || !bunRes.ok) throw new Error("Failed to load data files");

        catalog = await invRes.json();
        bundleConfig = await bunRes.json();

        // Add UID mapping required for the app logic
        catalog.forEach((item, index) => { item.uid = index; });

        renderGrid();
        renderCart();

    } catch (err) {
        console.error(err);
        document.getElementById('gridContainer').innerHTML = 
            `<div class="col-span-full text-center text-red-500 font-bold p-10">
                Error loading data. Please ensure inventory.json and bundles.json exist.
            </div>`;
    }
}

function syncDates(val) {
    document.getElementById('orderDate').value = val;
    document.getElementById('orderDateMobile').value = val;
}

// --- TOGGLE MOBILE DETAILS ---
function toggleDetails() {
    const el = document.getElementById('orderInputs');
    const chev = document.getElementById('chevron');
    isDetailsOpen = !isDetailsOpen;
    
    if(isDetailsOpen) {
        el.style.maxHeight = "600px";
        el.style.opacity = "1";
        chev.style.transform = "rotate(180deg)";
    } else {
        el.style.maxHeight = "0";
        el.style.opacity = "0";
        chev.style.transform = "rotate(0deg)";
    }
}

// --- HELP MODAL LOGIC ---
function toggleHelpModal() {
    const modal = document.getElementById('helpModal');
    const body = document.body;
    
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        body.classList.add('drawer-open');
    } else {
        modal.classList.add('hidden');
        body.classList.remove('drawer-open');
    }
}

// --- BUNDLE LOGIC ---
function applyBundle(index) {
    const bundle = bundleConfig[index];
    let addedCount = 0;

    bundle.items.forEach(([key, qty]) => {
        const item = catalog.find(i => i.id === key || i.name === key);
        if (item) {
            if (!cart[item.name]) cart[item.name] = 0;
            cart[item.name] += qty;
            addedCount++;
        } else {
            console.warn(`Could not find item in catalog: ${key}`);
        }
    });

    renderGrid();
    renderCart(); 
    
    alert(`✅ Added ${bundle.name} items to order!`);
}

// --- CART DRAWER LOGIC ---
function toggleCartDrawer() {
    const body = document.body;
    const drawer = document.getElementById('cartDrawer');
    
    const cartItemsCount = Object.keys(cart).filter(key => cart[key] > 0).length;
    const isOpen = drawer.classList.contains('open');

    if (!isOpen) {
        if (cartItemsCount === 0) {
            alert("Your cart is empty. Please add items before viewing the cart.");
            return;
        }
        drawer.classList.add('open');
        body.classList.add('drawer-open');
        renderCart();
    } else {
        drawer.classList.remove('open');
        body.classList.remove('drawer-open');
    }
}

function renderCart() {
    const cartList = document.getElementById('cartList');
    cartList.innerHTML = '';
    let totalUniqueItems = 0; 
    
    const cartCatalog = catalog
        .filter(item => cart[item.name] > 0)
        .sort((a, b) => a.name.localeCompare(b.name));
    
    if (cartCatalog.length === 0) {
        cartList.innerHTML = '<p class="text-center text-gray-500 py-12">Your cart is empty. Add items from the catalog above.</p>';
    } else {
        cartCatalog.forEach(item => {
            const qty = cart[item.name];
            totalUniqueItems++;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-100';
            
            const uid = item.uid;

            itemDiv.innerHTML = `
                <div class="flex flex-col flex-grow min-w-0 mr-4">
                    <span class="text-xs font-mono bg-white text-gray-500 px-1.5 py-0.5 rounded self-start border border-gray-200">${item.id}</span>
                    <h4 class="font-semibold text-sm text-[#002855] truncate">${item.name}</h4>
                </div>
                <div class="flex items-center flex-shrink-0">
                    <button onclick="updateQty(${uid}, -1)" class="w-7 h-7 flex items-center justify-center rounded bg-white shadow-sm text-gray-600 active:bg-gray-200 font-bold text-base touch-manipulation border border-gray-200">-</button>
                    <span class="w-8 text-center font-bold text-gray-800 text-base mx-1">${qty}</span>
                    <button onclick="updateQty(${uid}, 1)" class="w-7 h-7 flex items-center justify-center rounded bg-[#E31837] shadow-sm text-white active:bg-red-800 font-bold text-base touch-manipulation">+</button>
                </div>
            `;
            cartList.appendChild(itemDiv);
        });
    }

    document.getElementById('totalCount').innerText = totalUniqueItems;
    document.getElementById('cartTotalItems').innerText = totalUniqueItems;
    document.getElementById('cartDownloadCount').innerText = totalUniqueItems;

    const drawer = document.getElementById('cartDrawer');
    if (totalUniqueItems === 0 && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        document.body.classList.remove('drawer-open');
    }
}

// --- UI (GRID) ---
function renderGrid() {
    const container = document.getElementById('gridContainer');
    container.innerHTML = '';
    
    // 1. HANDLE BUNDLE VIEW
    if (currentFilter === 'Bundles') {
        bundleConfig.forEach((bundle, index) => {
            const card = document.createElement('div');
            card.className = "bg-slate-50 p-4 rounded-xl shadow-md border-2 border-slate-200 hover:border-[#002855] transition cursor-pointer group";
            card.onclick = () => applyBundle(index);
            
            card.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-black text-[#002855] text-base">${bundle.name}</h3>
                    <span class="text-xs bg-[#002855] text-white px-2 py-1 rounded-full font-bold whitespace-nowrap">📦 Add Kit</span>
                </div>
                <p class="text-xs text-gray-500 mb-3 line-clamp-2">${bundle.description}</p>
                <div class="space-y-1">
                    ${bundle.items.map(([item, qty]) => 
                        `<div class="text-[10px] text-gray-600 flex justify-between border-b border-gray-200 pb-1">
                            <span>${item}</span>
                            <span class="font-mono font-bold text-sm text-[#E31837]">x${qty}</span>
                        </div>`
                    ).join('')}
                </div>
                <div class="mt-4 text-center text-xs font-bold text-[#E31837] group-hover:text-red-700 transition">
                    Tap to add to cart
                </div>
            `;
            container.appendChild(card);
        });
        return;
    }

    // 2. HANDLE NORMAL ITEM VIEW
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    let displayList = [...catalog].sort((a, b) => (a.isPopular === b.isPopular) ? 0 : a.isPopular ? -1 : 1);

    displayList.forEach(item => {
        if (currentFilter !== 'All' && item.category !== currentFilter) return;
        if (searchTerm && !item.name.toLowerCase().includes(searchTerm) && !item.id.toLowerCase().includes(searchTerm)) return;

        const qty = cart[item.name] || 0;
        const isSelected = qty > 0;
        let icon = getIconForCategory(item.category);

        const card = document.createElement('div');
        card.className = `bg-white p-3 rounded-xl shadow-sm border transition ${isSelected ? 'card-selected' : 'border-gray-200'}`;
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-1">
                <span class="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100">${item.id}</span>
                ${item.isPopular ? '<span class="text-[9px] text-amber-600 font-bold uppercase tracking-wide flex items-center gap-1">★ Pop</span>' : ''}
            </div>
            <div class="flex items-center gap-2 mb-2 h-10">
                ${icon}
                <h3 class="font-semibold text-[#002855] text-xs leading-tight line-clamp-2">${item.name}</h3>
            </div>
            
            <div class="flex items-center justify-between mt-auto bg-gray-50 rounded-lg p-1 border border-gray-100">
                <button onclick="updateQty(${item.uid}, -1)" class="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm text-gray-600 active:bg-gray-200 font-bold text-lg touch-manipulation border border-gray-100">-</button>
                <input type="number" value="${qty}" class="w-10 text-center bg-transparent font-bold text-[#002855] focus:outline-none text-lg" readonly>
                <button onclick="updateQty(${item.uid}, 1)" class="w-8 h-8 flex items-center justify-center rounded bg-[#E31837] shadow-sm text-white active:bg-red-800 font-bold text-lg touch-manipulation">+</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function updateQty(uid, change) {
    const item = catalog[uid];  
    if (!item) return;
    if (!cart[item.name]) cart[item.name] = 0;
    
    cart[item.name] += change;
    
    if (cart[item.name] < 0) cart[item.name] = 0;
    
    if (cart[item.name] === 0) {
        delete cart[item.name];
    }
    
    renderGrid();
    renderCart(); 
}

function getIconForCategory(cat) {
    if (cat === 'Equipment') return '<div class="w-5 h-5 text-[#002855] flex-shrink-0"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg></div>';
    if (cat === 'Fiber/Copper') return '<div class="w-5 h-5 text-[#E31837] flex-shrink-0"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>';
    if (cat === 'Plates/Jacks') return '<div class="w-5 h-5 text-gray-500 flex-shrink-0"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg></div>';
    return '<div class="w-5 h-5 text-gray-400 flex-shrink-0"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>';
}

function filterCategory(cat) {
    currentFilter = cat;
    document.querySelectorAll('.cat-btn').forEach(btn => {
        const btnText = btn.innerText;
        const targetCat = (cat === 'Plates/Jacks') ? 'Wall Plates' : cat;
        
        let isActive = false;
        if(btnText === targetCat) isActive = true;
        if(cat === 'All' && btnText === 'All') isActive = true;
        if(cat === 'Bundles' && btnText.includes('Bundles')) isActive = true;

        if(isActive) {
            btn.classList.add('bg-[#E31837]', 'text-white', 'shadow-md');
            btn.classList.remove('bg-white', 'border-gray-200', 'text-gray-600', 'hover:bg-gray-50', 'bg-slate-100', 'text-slate-600');
        } else {
            btn.classList.remove('bg-[#E31837]', 'text-white', 'shadow-md');
            if (btnText.includes('Bundles')) {
                btn.classList.add('bg-slate-100', 'border-slate-200', 'text-slate-600');
            } else {
                btn.classList.add('bg-white', 'border-gray-200', 'text-gray-600', 'hover:bg-gray-50');
            }
        }
    });
    renderGrid();
}

document.getElementById('searchInput').addEventListener('keyup', renderGrid);

function generateExcel() {
    const drawer = document.getElementById('cartDrawer');
    if(drawer.classList.contains('open')) toggleCartDrawer(); 

    // 1. Check if cart is empty
    const cartItemsCount = Object.keys(cart).filter(key => cart[key] > 0).length;
    if (cartItemsCount === 0) {
            alert("Your cart is empty. Please add items before downloading the request form.");
            toggleCartDrawer(); 
            return;
    }

    const issuedBy = document.getElementById('issuedBy').value.trim();
    const toWh = document.getElementById('toWarehouse').value.trim();
    
    // 2. Check if Truck Number is provided
    if (!toWh) {
            alert("Please enter the Truck Number in the 'To Warehouse/Truck' field before downloading.");
            if(!isDetailsOpen) toggleDetails();
            document.getElementById('toWarehouse').focus();
            return;
    }

    // 3. Optional Check for Issued By
    if(!issuedBy && !confirm("The 'Issued By' field is empty. Do you want to download anyway?")) {
        if(!isDetailsOpen) toggleDetails();
        document.getElementById('issuedBy').focus();
        return;
    }

    const fromWh = document.getElementById('fromWarehouse').value;
    const receivedBy = document.getElementById('receivedBy').value;
    
    // GET DATE FROM INPUT
    const rawDate = document.getElementById('orderDate').value;
    const dateStr = new Date(rawDate + "T00:00:00").toLocaleDateString();  

    const midpoint = Math.ceil(catalog.length / 2);
    const leftColItems = catalog.slice(0, midpoint);
    const rightColItems = catalog.slice(midpoint);

    let ws_data = [
        ["BROADBAND MATERIAL ISSUE SHEET"], 
        [], 
        ["FROM WAREHOUSE:", fromWh, "", "ISSUED BY:", issuedBy, "DATE:", dateStr],
        ["TO WAREHOUSE:", toWh, "", "RECEIVED BY:", receivedBy, "", ""],
        [], 
        ["ITEM #", "DESCRIPTION", "QTY", "", "ITEM #", "DESCRIPTION", "QTY"], 
    ];

    const maxRows = Math.max(leftColItems.length, rightColItems.length);

    for (let i = 0; i < maxRows; i++) {
        const leftItem = leftColItems[i] || { id: "", name: "" };
        const rightItem = rightColItems[i] || { id: "", name: "" };

        const leftQty = cart[leftItem.name] > 0 ? cart[leftItem.name] : "";
        const rightQty = cart[rightItem.name] > 0 ? cart[rightItem.name] : "";

        ws_data.push([
            leftItem.id, leftItem.name, leftQty, "", 
            rightItem.id, rightItem.name, rightQty
        ]);
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!cols'] = [ {wch: 10}, {wch: 35}, {wch: 8}, {wch: 5}, {wch: 10}, {wch: 35}, {wch: 8} ];

    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
    const titleCell = ws['A1'];
    if (titleCell) {
        titleCell.s = { alignment: { horizontal: "center" } };
    }

    XLSX.utils.book_append_sheet(wb, ws, "Request");
    
    const fileName = `${rawDate} ${toWh} broadband order request.xlsx`;
    XLSX.writeFile(wb, fileName);
}

// --- PREVENT ACCIDENTAL NAVIGATION ---
window.addEventListener('beforeunload', function (e) {
    const hasItems = Object.keys(cart).length > 0;
    if (hasItems) {
        e.preventDefault(); 
        e.returnValue = ''; 
    }
});

// Start App
initApp();
