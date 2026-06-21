-- Database Schema for Coffee Shop Table Reservation System
-- Matches the Data Dictionary in SRS.md

CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name VARCHAR(100) NOT NULL, -- ชื่อลูกค้า
    phone_number VARCHAR(20) NOT NULL,   -- เบอร์โทรศัพท์
    booking_date DATE NOT NULL,          -- วันที่จอง
    booking_time VARCHAR(20) NOT NULL,   -- รอบเวลา (Time Slot)
    pax INTEGER NOT NULL CHECK(pax > 0), -- จำนวนคน
    notes TEXT,                          -- หมายเหตุ
    status VARCHAR(20) NOT NULL DEFAULT 'Booked' CHECK(status IN ('Booked', 'Arrived', 'No-show', 'Cancelled')), -- สถานะการจอง
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(booking_date);
CREATE INDEX IF NOT EXISTS idx_reservations_phone ON reservations(phone_number);
