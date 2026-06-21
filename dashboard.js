import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase
const supabaseUrl = 'https://odqyebcueuzwwibjkxvc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcXllYmN1ZXV6d3dpYmpreHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMDgwMDgsImV4cCI6MjA5NzU4NDAwOH0.h7wKTuKBsv6LDgo-RoUGeX2Cys-5e4JZ8x6hL-ObeVQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// DOM Elements
const dateFilter = document.getElementById('filterDate');
const btnRefresh = document.getElementById('btnRefresh');
const queueTableBody = document.getElementById('queueTableBody');

// Set default date to today (Local Timezone)
const tzOffset = (new Date()).getTimezoneOffset() * 60000;
const today = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
dateFilter.value = today;

// Fetch and display queue
async function loadQueue() {
    const selectedDate = dateFilter.value;
    if (!selectedDate) return;

    queueTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">กำลังโหลดข้อมูล...</td></tr>`;

    // Fetch reservations for the selected date, ordered by time slot
    const { data: reservations, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('booking_date', selectedDate)
        .order('time_slot', { ascending: true })
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching data:', error);
        queueTableBody.innerHTML = `<tr><td colspan="7" class="empty-state" style="color: red;">เกิดข้อผิดพลาดในการโหลดข้อมูล: ${error.message}</td></tr>`;
        return;
    }

    if (!reservations || reservations.length === 0) {
        queueTableBody.innerHTML = `<tr><td colspan="7" class="empty-state">ไม่มีคิวจองสำหรับวันที่เลือก</td></tr>`;
        return;
    }

    renderTable(reservations);
}

// Render data into table
function renderTable(reservations) {
    queueTableBody.innerHTML = '';

    reservations.forEach(res => {
        const tr = document.createElement('tr');
        
        const refId = res.id.substring(0, 8).toUpperCase();
        const statusClass = res.status.toLowerCase().replace(' ', '-');
        
        let actionButtons = '';
        if (res.status === 'Booked') {
            actionButtons = `
                <div class="action-buttons">
                    <button class="btn-action arrive" onclick="updateStatus('${res.id}', 'Arrived')">เช็คอิน</button>
                    <button class="btn-action noshow" onclick="updateStatus('${res.id}', 'No-show')">No-show</button>
                    <button class="btn-action cancel" onclick="updateStatus('${res.id}', 'Cancelled')">ยกเลิก</button>
                </div>
            `;
        } else {
            // ถ้าสถานะเปลี่ยนไปแล้ว จะไม่แสดงปุ่มแก้ไข (เพื่อให้ง่ายต่อการจัดการเบื้องต้น)
            actionButtons = `<span style="color: #9e9e9e; font-size: 0.85rem;">(อัปเดตแล้ว)</span>`;
        }

        tr.innerHTML = `
            <td><strong>${refId}</strong></td>
            <td>${res.time_slot}</td>
            <td>
                <strong>${res.customer_name}</strong><br>
                <span style="color: #757575; font-size: 0.9rem;">📞 ${res.phone_number}</span>
            </td>
            <td>${res.pax} ท่าน</td>
            <td>${res.notes || '-'}</td>
            <td><span class="status ${statusClass}">${res.status}</span></td>
            <td>${actionButtons}</td>
        `;
        
        queueTableBody.appendChild(tr);
    });
}

// Update status function (exposed to window so inline onclick can access it)
window.updateStatus = async function(id, newStatus) {
    if (!confirm(`ยืนยันการเปลี่ยนสถานะเป็น "${newStatus}" ใช่หรือไม่?`)) return;

    const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', id);

    if (error) {
        alert("อัปเดตสถานะไม่สำเร็จ: " + error.message);
        console.error(error);
    } else {
        // Reload data after successful update
        loadQueue();
    }
}

// Event Listeners
dateFilter.addEventListener('change', loadQueue);
btnRefresh.addEventListener('click', loadQueue);

// Initial Load
document.addEventListener('DOMContentLoaded', loadQueue);
