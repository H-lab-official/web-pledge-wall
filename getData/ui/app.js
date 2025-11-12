// Global state
let config = {
    apiUrl: '',
    dataPath: [],
    rawData: null,
    extractedData: [],
    fields: [],
    selectedFields: [],
    uniqueKey: '',
    outputFile: 'data.txt',
    fetchInterval: 60,
    fetchedKeys: new Set(),
    isRunning: false,
    intervalId: null,
    roundCount: 0
};

// Step navigation
function goToStep(stepNumber) {
    // Hide all content
    document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));
    
    // Show selected step
    document.getElementById(`content-step${stepNumber}`).classList.remove('hidden');
    document.getElementById(`content-step${stepNumber}`).classList.add('fade-in');
    
    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach((el, index) => {
        if (index < stepNumber) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

// Step 1: Fetch preview
async function fetchPreview() {
    const apiUrl = document.getElementById('apiUrl').value.trim();
    
    if (!apiUrl) {
        alert('กรุณาใส่ API URL');
        return;
    }
    
    config.apiUrl = apiUrl;
    
    try {
        showLoading('กำลังดึงข้อมูล...');
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        config.rawData = await response.json();
        
        hideLoading();
        
        // Display structure
        displayStructure(config.rawData);
        
        goToStep(2);
    } catch (error) {
        hideLoading();
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
}

// Display JSON structure
function displayStructure(data, indent = 0) {
    const display = document.getElementById('structureDisplay');
    display.innerHTML = '';
    
    function buildStructure(obj, level) {
        const prefix = '  '.repeat(level);
        let html = '';
        
        if (Array.isArray(obj)) {
            html += `${prefix}<span class="text-blue-600">Array[${obj.length}]</span>\n`;
            if (obj.length > 0) {
                html += buildStructure(obj[0], level + 1);
            }
        } else if (typeof obj === 'object' && obj !== null) {
            const keys = Object.keys(obj).slice(0, 10); // Show first 10 keys
            for (const key of keys) {
                const value = obj[key];
                if (Array.isArray(value)) {
                    html += `${prefix}<span class="text-purple-600">${key}</span>: <span class="text-blue-600">Array[${value.length}]</span>\n`;
                    if (value.length > 0) {
                        html += buildStructure(value[0], level + 1);
                    }
                } else if (typeof value === 'object' && value !== null) {
                    html += `${prefix}<span class="text-purple-600">${key}</span>: Object\n`;
                    html += buildStructure(value, level + 1);
                } else {
                    const preview = String(value).substring(0, 50);
                    html += `${prefix}<span class="text-purple-600">${key}</span>: <span class="text-gray-600">${preview}${String(value).length > 50 ? '...' : ''}</span>\n`;
                }
            }
            if (Object.keys(obj).length > 10) {
                html += `${prefix}<span class="text-gray-400">... และอีก ${Object.keys(obj).length - 10} ฟิลด์</span>\n`;
            }
        }
        
        return html;
    }
    
    display.innerHTML = '<pre>' + buildStructure(data, 0) + '</pre>';
}

// Toggle data path input
function toggleDataPath() {
    const isNested = document.getElementById('isNested').value === 'true';
    const container = document.getElementById('dataPathContainer');
    
    if (isNested) {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

// Extract data from path
function extractData() {
    const isNested = document.getElementById('isNested').value === 'true';
    
    if (isNested) {
        const pathStr = document.getElementById('dataPath').value.trim();
        if (!pathStr) {
            alert('กรุณาระบุ path ไปยังข้อมูล');
            return;
        }
        config.dataPath = pathStr.split('.').map(s => s.trim());
    } else {
        config.dataPath = [];
    }
    
    try {
        let data = config.rawData;
        
        // Navigate through path
        for (const segment of config.dataPath) {
            if (!data[segment]) {
                throw new Error(`ไม่พบ key '${segment}' ในข้อมูล`);
            }
            data = data[segment];
        }
        
        // Convert to array if needed
        if (Array.isArray(data)) {
            config.extractedData = data;
        } else {
            config.extractedData = [data];
        }
        
        if (config.extractedData.length === 0) {
            throw new Error('ไม่พบข้อมูลใน path ที่ระบุ');
        }
        
        // Extract fields
        const firstItem = config.extractedData[0];
        config.fields = Object.keys(firstItem);
        
        // Display sample data
        document.getElementById('sampleDataDisplay').innerHTML = 
            '<pre>' + JSON.stringify(firstItem, null, 2) + '</pre>';
        
        // Populate unique key dropdown
        const uniqueKeySelect = document.getElementById('uniqueKey');
        uniqueKeySelect.innerHTML = '';
        config.fields.forEach(field => {
            const option = document.createElement('option');
            option.value = field;
            const sampleValue = String(firstItem[field]).substring(0, 30);
            option.textContent = `${field} (ตัวอย่าง: ${sampleValue})`;
            uniqueKeySelect.appendChild(option);
        });
        
        // Create field checkboxes
        const container = document.getElementById('fieldCheckboxes');
        container.innerHTML = '';
        config.fields.forEach(field => {
            const div = document.createElement('div');
            div.className = 'flex items-center space-x-2 p-2 hover:bg-gray-100 rounded';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `field_${field}`;
            checkbox.value = field;
            checkbox.checked = true;
            checkbox.className = 'w-5 h-5 text-purple-600 rounded';
            
            const label = document.createElement('label');
            label.htmlFor = `field_${field}`;
            label.className = 'flex-1 cursor-pointer';
            const sampleValue = String(firstItem[field]).substring(0, 40);
            label.textContent = `${field} (${sampleValue}${String(firstItem[field]).length > 40 ? '...' : ''})`;
            
            div.appendChild(checkbox);
            div.appendChild(label);
            container.appendChild(div);
        });
        
        goToStep(3);
        
    } catch (error) {
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
}

// Select/Deselect all fields
function selectAllFields() {
    document.querySelectorAll('#fieldCheckboxes input[type="checkbox"]').forEach(cb => {
        cb.checked = true;
    });
}

function deselectAllFields() {
    document.querySelectorAll('#fieldCheckboxes input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
}

// Go to settings
function goToSettings() {
    // Get selected fields
    config.selectedFields = [];
    document.querySelectorAll('#fieldCheckboxes input[type="checkbox"]:checked').forEach(cb => {
        config.selectedFields.push(cb.value);
    });
    
    if (config.selectedFields.length === 0) {
        alert('กรุณาเลือกอย่างน้อย 1 ฟิลด์');
        return;
    }
    
    // Get unique key
    config.uniqueKey = document.getElementById('uniqueKey').value;
    
    // Update summary
    document.getElementById('summaryApi').textContent = config.apiUrl;
    document.getElementById('summaryKey').textContent = config.uniqueKey;
    document.getElementById('summaryFields').textContent = config.selectedFields.join(', ');
    
    // Listen to file and interval changes
    document.getElementById('outputFile').addEventListener('input', updateSummary);
    document.getElementById('fetchInterval').addEventListener('input', updateSummary);
    
    updateSummary();
    goToStep(4);
}

function updateSummary() {
    document.getElementById('summaryFile').textContent = document.getElementById('outputFile').value;
    document.getElementById('summaryInterval').textContent = document.getElementById('fetchInterval').value;
}

// Start fetching
async function startFetching() {
    config.outputFile = document.getElementById('outputFile').value;
    config.fetchInterval = parseInt(document.getElementById('fetchInterval').value) || 60;
    config.isRunning = true;
    config.roundCount = 0;
    
    // Show log container
    document.getElementById('logContainer').classList.remove('hidden');
    document.getElementById('logContainer').classList.add('fade-in');
    
    // Disable start button
    document.getElementById('startButton').disabled = true;
    document.getElementById('startButton').classList.add('opacity-50', 'cursor-not-allowed');
    
    addLog('✨ เริ่มดึงข้อมูลอัตโนมัติ...', 'info');
    addLog(`📍 API: ${config.apiUrl}`, 'info');
    addLog(`⏱️  ทุก ${config.fetchInterval} วินาที`, 'info');
    addLog(`🔑 Unique Key: ${config.uniqueKey}`, 'info');
    
    // Start fetching loop
    await fetchRound();
    config.intervalId = setInterval(fetchRound, config.fetchInterval * 1000);
}

// Stop fetching
function stopFetching() {
    config.isRunning = false;
    if (config.intervalId) {
        clearInterval(config.intervalId);
    }
    
    addLog('⏹ หยุดการดึงข้อมูล', 'warning');
    
    // Enable start button
    document.getElementById('startButton').disabled = false;
    document.getElementById('startButton').classList.remove('opacity-50', 'cursor-not-allowed');
}

// Fetch one round
async function fetchRound() {
    if (!config.isRunning) return;
    
    config.roundCount++;
    document.getElementById('statRound').textContent = config.roundCount;
    
    addLog(`\n🔄 รอบที่ ${config.roundCount}: กำลังดึงข้อมูล...`, 'info');
    
    try {
        const response = await fetch(config.apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const rawData = await response.json();
        
        // Extract data
        let data = rawData;
        for (const segment of config.dataPath) {
            data = data[segment];
        }
        const items = Array.isArray(data) ? data : [data];
        
        let newItemsCount = 0;
        
        for (const item of items) {
            const keyValue = String(item[config.uniqueKey]);
            
            if (!config.fetchedKeys.has(keyValue)) {
                // Filter fields
                const filteredItem = {};
                config.selectedFields.forEach(field => {
                    if (item[field] !== undefined) {
                        filteredItem[field] = item[field];
                    }
                });
                
                // Save to localStorage (simulate file save)
                saveData(filteredItem);
                
                config.fetchedKeys.add(keyValue);
                newItemsCount++;
                
                const preview = config.selectedFields
                    .slice(0, 2)
                    .map(f => `${f}: ${String(item[f]).substring(0, 20)}`)
                    .join(', ');
                    
                addLog(`  ✅ เพิ่มข้อมูล [${keyValue}]: ${preview}`, 'success');
            }
        }
        
        if (newItemsCount === 0) {
            addLog('  ℹ️  ไม่มีข้อมูลใหม่', 'info');
        } else {
            addLog(`  📝 เพิ่มข้อมูลใหม่: ${newItemsCount} รายการ`, 'success');
        }
        
        document.getElementById('statTotal').textContent = config.fetchedKeys.size;
        document.getElementById('statNew').textContent = newItemsCount;
        
        addLog(`  📊 ข้อมูลทั้งหมด: ${config.fetchedKeys.size} รายการ`, 'info');
        
        if (config.isRunning) {
            addLog(`⏳ รอ ${config.fetchInterval} วินาที...`, 'info');
        }
        
    } catch (error) {
        addLog(`❌ เกิดข้อผิดพลาด: ${error.message}`, 'error');
    }
}

// Save data (to localStorage in this web version)
function saveData(item) {
    const storageKey = `data_fetcher_${config.outputFile}`;
    let savedData = JSON.parse(localStorage.getItem(storageKey) || '[]');
    savedData.push(item);
    localStorage.setItem(storageKey, JSON.stringify(savedData));
}

// Add log entry
function addLog(message, type = 'info') {
    const logDisplay = document.getElementById('logDisplay');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    
    const timestamp = new Date().toLocaleTimeString('th-TH');
    
    let colorClass = 'text-green-400';
    if (type === 'error') colorClass = 'text-red-400';
    if (type === 'warning') colorClass = 'text-yellow-400';
    if (type === 'info') colorClass = 'text-blue-400';
    if (type === 'success') colorClass = 'text-green-400';
    
    entry.innerHTML = `<span class="text-gray-500">[${timestamp}]</span> <span class="${colorClass}">${message}</span>`;
    logDisplay.appendChild(entry);
    
    // Auto scroll to bottom
    logDisplay.scrollTop = logDisplay.scrollHeight;
}

// Loading overlay
function showLoading(message = 'กำลังโหลด...') {
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    overlay.innerHTML = `
        <div class="bg-white rounded-lg p-8 text-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p class="text-gray-700 font-semibold">${message}</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// Download data
function downloadData() {
    const storageKey = `data_fetcher_${config.outputFile}`;
    const savedData = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (savedData.length === 0) {
        alert('ยังไม่มีข้อมูลที่บันทึกไว้');
        return;
    }
    
    const content = savedData.map(item => JSON.stringify(item)).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = config.outputFile;
    a.click();
    
    URL.revokeObjectURL(url);
}

