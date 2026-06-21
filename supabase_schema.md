# โครงสร้าง Database สำหรับระบบจองโต๊ะร้านกาแฟ (Supabase)

อ้างอิงจาก Software Requirements Specification (SRS) ของระบบ Coffee Shop Table Reservation System นี่คือการออกแบบโครงสร้างตาราง (Table Design) ที่เหมาะสมสำหรับนำไปใช้งานบน Supabase (PostgreSQL)

## 1. ชื่อตาราง (Table Name)
`reservations`

## 2. Column และ Type ที่เหมาะสม (Supabase / PostgreSQL)

| Column Name | Data Type | Constraints / Default | ความหมาย |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, Default: `uuid_generate_v4()` | รหัสอ้างอิงการจอง (Booking Ref) แบบสุ่ม ป้องกันการเดาสุ่ม |
| `customer_name` | `text` | Not Null | ชื่อลูกค้า |
| `phone_number` | `text` | Not Null | เบอร์โทรศัพท์สำหรับติดต่อกลับ |
| `booking_date` | `date` | Not Null | วันที่จองโต๊ะ (เก็บเฉพาะวันที่) |
| `time_slot` | `text` | Not Null | รอบเวลาที่เลือก เช่น `10:00 - 11:30` |
| `pax` | `integer` | Not Null, `check (pax > 0)` | จำนวนคน (แขก) |
| `notes` | `text` | Nullable | หมายเหตุ / ความต้องการพิเศษ |
| `status` | `text` | Not Null, Default: `'Booked'` | สถานะ: `Booked`, `Arrived`, `No-show`, `Cancelled` |
| `created_at` | `timestamptz` | Not Null, Default: `now()` | วันเวลาที่ทำรายการจองเข้าระบบ |

*(หมายเหตุ: สำหรับคอลัมน์ `status` สามารถสร้างและใช้ Data Type แบบ `ENUM` ได้เพื่อป้องกันการพิมพ์สถานะผิดพลาด)*

---

## 3. ข้อมูลตัวอย่าง 5 แถว (Sample Data)

| id (uuid) | customer_name | phone_number | booking_date | time_slot | pax | notes | status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `a1b2...` | สมชาย รักดี | 0812345678 | 2026-06-25 | 10:00 - 11:30 | 2 | ขอโต๊ะริมหน้าต่าง | Booked |
| `c3d4...` | Jane Doe | 0898765432 | 2026-06-25 | 11:30 - 13:00 | 4 | มีเด็กเล็ก 1 คน (ขอเก้าอี้เด็ก) | Booked |
| `e5f6...` | กิตติพงษ์ | 0861112222 | 2026-06-26 | 10:00 - 11:30 | 1 | - | Cancelled |
| `g7h8...` | สุดาพร | 0845556666 | 2026-06-21 | 09:00 - 10:30 | 2 | - | Arrived |
| `i9j0...` | Tony Stark | 0859998888 | 2026-06-21 | 10:00 - 11:30 | 3 | แพ้นมวัว | No-show |

---

## 4. คำแนะนำว่าหน้าเว็บควรอ่าน/เขียนข้อมูลอย่างไร (Integration Guide)

### 4.1 การเขียนข้อมูล (Insert Booking) ฝั่งลูกค้า (Landing Page)
เมื่อลูกค้ากดปุ่ม "ยืนยันการจองโต๊ะ" ให้ Frontend ส่งคำสั่ง Insert ไปยัง Supabase:
```javascript
const { data, error } = await supabase
  .from('reservations')
  .insert([
    { 
      customer_name: 'ชื่อลูกค้า', 
      phone_number: '08XXXXXXXX',
      booking_date: '2026-06-25',
      time_slot: '10:00 - 11:30',
      pax: 2,
      notes: '...'
    }
  ])
  .select('id'); // ดึง UUID กลับมาแสดงเป็น Booking Reference ให้ลูกค้า
```

### 4.2 การอ่านข้อมูล (Availability Check) ฝั่งลูกค้า
เมื่อลูกค้าเลือกวันที่ในปฏิทิน (Date Picker) Frontend ควรดึงข้อมูลนับจำนวนคิวที่จองไปแล้วในแต่ละรอบเวลาของวันนั้น เพื่อล็อค (Disable) รอบเวลาที่เต็ม:
```javascript
// ดึงข้อมูลเพื่อตรวจสอบว่าในวันนั้นมีรอบไหนเต็มแล้วบ้าง (สมมติว่ารับได้ 5 คิว/รอบ)
const { data, error } = await supabase
  .from('reservations')
  .select('time_slot')
  .eq('booking_date', '2026-06-25')
  .eq('status', 'Booked'); 
// นำข้อมูลที่ได้มานับซ้ำ (Group by time_slot) ถ้ารอบไหน >= 5 ให้ Disable ใน Dropdown
```

### 4.3 การจัดการข้อมูลระดับความปลอดภัย (Row Level Security - RLS)
Supabase บังคับใช้ RLS (Row Level Security) ดังนั้นควรตั้งค่า Policies ดังนี้เพื่อความปลอดภัย:
1. **INSERT Policy (Customer):** อนุญาตให้ผู้ใช้ทั่วไป (`anon` role) สามารถ `INSERT` ข้อมูลการจองใหม่เข้ามาในตารางได้
2. **SELECT Policy (Customer):** อนุญาตให้ `anon` อ่านได้เฉพาะข้อมูลจำนวนคิวในแต่ละวัน (เพื่อป้องกันการดึงรายชื่อหรือเบอร์โทรของลูกค้าคนอื่นหลุดออกไป) หรือตั้งค่าให้ไม่สามารถ SELECT ข้อมูลส่วนตัวได้เลย และใช้ Supabase Edge Function / RPC ในการนับคิวที่ว่างแทน
3. **ALL Policy (Staff):** ผู้ใช้งานที่ยืนยันตัวตนแล้วระดับพนักงาน (`authenticated` role หรือตรวจเช็คผ่านรหัสพนักงาน) สามารถ `SELECT` และ `UPDATE` สถานะของทุกแถวได้ เพื่อใช้ในหน้า Daily Queue Dashboard
