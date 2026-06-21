// Modal controls
function openBookingModal() {
    document.getElementById('bookingModal').style.display = 'flex';
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    let modal1 = document.getElementById('bookingModal');
    let modal2 = document.getElementById('successModal');
    if (event.target === modal1) {
        modal1.style.display = 'none';
    }
    if (event.target === modal2) {
        modal2.style.display = 'none';
    }
}

// Form submission handler to mock SRS booking process
document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // In a real app, this would be an API call to save to Database
    // Generate a mock booking reference
    const ref = 'CF' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    document.getElementById('bookingRef').innerText = ref;
    
    // Close booking modal and open success modal
    closeBookingModal();
    document.getElementById('successModal').style.display = 'flex';
    
    // Reset form
    this.reset();
});

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
document.getElementById('date').setAttribute('min', today);
