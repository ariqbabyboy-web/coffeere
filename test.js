// test.js
// Script สำหรับรันด้วย Node.js (v18+) เพื่อจำลองการทำงานของฟอร์มจองโต๊ะ

const supabaseUrl = 'https://odqyebcueuzwwibjkxvc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kcXllYmN1ZXV6d3dpYmpreHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMDgwMDgsImV4cCI6MjA5NzU4NDAwOH0.h7wKTuKBsv6LDgo-RoUGeX2Cys-5e4JZ8x6hL-ObeVQ';

async function runTest() {
    console.log("🚀 เริ่มต้นการรัน Test ด้วย Node.js...");
    
    const mockData = {
        customer_name: "Node.js Test User",
        phone_number: "0999999999",
        booking_date: new Date().toISOString().split('T')[0],
        time_slot: "13:00 - 14:30",
        pax: 2,
        notes: "Automated test using native fetch API"
    };

    console.log("📝 กำลังทดสอบ Insert ข้อมูล...");
    
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/reservations`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation' // สั่งให้ส่งข้อมูลที่บันทึกเสร็จแล้วกลับมา
            },
            body: JSON.stringify(mockData)
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("❌ Test Failed: พบข้อผิดพลาดในการบันทึกข้อมูล");
            console.error(error);
            process.exit(1);
        }

        const data = await response.json();
        console.log("✅ Test Passed: บันทึกข้อมูลสำเร็จ!");
        console.log(`📌 ข้อมูลที่ได้กลับมา (ID): ${data[0].id}`);
        console.log("รายละเอียด: ", data[0]);

    } catch (err) {
        console.error("❌ Test Failed: ไม่สามารถเชื่อมต่อ Supabase ได้");
        console.error(err);
    }
}

runTest();
