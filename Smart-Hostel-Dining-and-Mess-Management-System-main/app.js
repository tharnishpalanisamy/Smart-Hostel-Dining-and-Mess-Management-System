const appState = {
    view: 'login', // login, student-dashboard, warden-dashboard, warden-student-detail
    loginTab: 'student', // student, warden
    studentActiveTab: 'dashboard', // dashboard, booking, menu, billing, edit-profile
    wardenActiveTab: 'dashboard', // dashboard, reports, scanner, billing
    selectedStudent: null,
    editingStudentIndex: null, // ID of student being edited
};

const messMenu = [
    { day: "Monday", breakfast: "Idiappam, Kadala curry, Bread Toast, Omelette, Sauce, Kuruma. Tea, Coffee, Milk, Bread, Jam, Butter", lunch: "Rice, Murungai sambar, milagu rasam, Appalam, payasam, Sena kelangu Poriyal", snack: "Tea, Coffee, Milk + groundnut With masala", dinner: "Tomato Dosai, Thick Coconut Chutney, Arisi Parupu. Badam Milk, Banana-1" },
    { day: "Tuesday", breakfast: "Onion Uthappam, Groundnut Chutney, Tomato Kuruma, Bread halwa. Tea, Coffee, Milk, Bread, Jam, Butter", lunch: "Rice, Thatta payir Puli kolambu, Tomato rasam, curd, Keerai Koottu, Vadagam", snack: "Tea, Coffee, Milk + white channa/maravalli kilangu chips/Sweet corn with masala", dinner: "Chapathi, Non veg(pepper chicken), Veg(paneer butter masala). Boost, Banana-1" },
    { day: "Wednesday", breakfast: "Venpongal, Vada, Sambar, coconut Chutney. Tea, Coffee, Milk, Bread, Jam, Butter", lunch: "Egg, Variety rice[Sambar rice, Coconut rice, Lemon rice, Puliyodharai], Potato Masala, rasam, Rava Kesari, wheel vadagam", snack: "Tea, Coffee, Milk + potato samosa", dinner: "Adai, White Kuruma, Kaara Chutney, Mint Rice. Brown sugar, Banana-1" },
    { day: "Thursday", breakfast: "Bombay toast, Semiya Kichadi, Tomato Kuruma, Toast Bread. Tea, Coffee, Milk, Bread, Jam, Butter", lunch: "Rice, Morkolambu, Vathakolambu, Paruppu Rasam, Carrot and Beans Poriyal, Ring vadagam", snack: "Tea, Coffee, Milk + Fruits (Seasonal) / ellu urundai / Pacha payir", dinner: "Non veg: Chicken Briyani with Chicken Gravy; Veg: Mushroom Briyani gravy with Cauliflower 65. Panakarkandu milk, Banana-1, Ice Cream (cone) (Monthly once)" },
    { day: "Friday", breakfast: "Idly, Sambar, Coconut Chutney, Sakkarai Pongal. Tea, Coffee, Milk, Bread, Jam, Butter", lunch: "Egg, Rice, Mix Veg Sambar, Vada, Payasam, Cabbage with Pattani Poriyal", snack: "Tea, Coffee, Milk + Biscuit (Milk Bikies, Bounce)", dinner: "Carrot KalUthappam, Mint Chutney, Veg kuruma. Horlicks milk, Banana-1" },
    { day: "Saturday", breakfast: "Masala Dosa, Sambar, Chutney. Tea, Coffee, Milk, Bread, Jam, Butter", lunch: "Egg, Rice, Pachapayir Kadaiyal, Rasam, Curd, Vadagam, Beetroot Poriyal", snack: "Tea, Coffee, Milk + black Channa", dinner: "Chapathi, Tomato thokku, White kuruma, Curd rice. Milk + Banana-1" },
    { day: "Sunday", breakfast: "Noodles, sauce. Tea, Coffee, Milk, Bread, Jam, Butter", lunch: "Non veg: Rice, Chicken Gravy, Kuska; Veg: Mushroom Gravy, cauliflower 65", snack: "Juices: lemon/nanari sarbath. Tea, Coffee, Milk + Onion Pakoda/French fries", dinner: "Rava Idly, Groundnut Chutney, Sambar. Milk" }
];

// Helper to generate mock past bookings from June 2025 to March 2026
function generatePastBookings() {
    const bookings = [];
    const startDate = new Date(2025, 5, 2);
    const endDate = new Date(2026, 2, 8);

    let current = new Date(startDate);
    let weekCount = 1;

    while (current < endDate) {
        const nextWeek = new Date(current);
        nextWeek.setDate(current.getDate() + 6);

        let monthName = current.toLocaleString('default', { month: 'short' });

        const generateDaily = () => {
            const bk = () => Math.random() > 0.3 ? 'booked' : 'canceled';
            return { breakfast: bk(), lunch: bk(), snack: bk(), dinner: bk() };
        };
        const weeklyDetails = {
            sun: generateDaily(), mon: generateDaily(), tue: generateDaily(),
            wed: generateDaily(), thu: generateDaily(), fri: generateDaily(), sat: generateDaily(),
            sunLunchPref: Math.random() > 0.5 ? 'non-veg' : 'veg',
            tueDinnerPref: Math.random() > 0.5 ? 'non-veg' : 'veg',
            thuDinnerPref: Math.random() > 0.5 ? 'non-veg' : 'veg',
            thuIceCream: Math.random() > 0.7
        };

        let activeMeals = 0;
        Object.values(weeklyDetails).forEach(day => {
            Object.values(day).forEach(m => { if (m === 'booked') activeMeals++; })
        });

        bookings.unshift({
            id: `BK-${current.getFullYear()}-${monthName.toUpperCase()}-W${weekCount}`,
            dateRange: `${current.toDateString().substring(4, 10)} - ${nextWeek.toDateString().substring(4, 10)}, ${current.getFullYear()}`,
            activeMeals: activeMeals,
            details: weeklyDetails,
            timestamp: current.getTime()
        });

        current.setDate(current.getDate() + 7);
        weekCount = weekCount > 4 ? 1 : weekCount + 1;
    }
    return bookings;
}

function getDefaultWeeklyMeals(isBooked = true) {
    const s = 'canceled'; // Default as disabled/canceled
    return {
        sun: { breakfast: s, lunch: s, snack: s, dinner: s },
        mon: { breakfast: s, lunch: s, snack: s, dinner: s },
        tue: { breakfast: s, lunch: s, snack: s, dinner: s },
        wed: { breakfast: s, lunch: s, snack: s, dinner: s },
        thu: { breakfast: s, lunch: s, snack: s, dinner: s },
        fri: { breakfast: s, lunch: s, snack: s, dinner: s },
        sat: { breakfast: s, lunch: s, snack: s, dinner: s },
        sunLunchPref: 'veg',
        tueDinnerPref: 'veg',
        thuDinnerPref: 'veg',
        thuIceCream: false
    };
}

function generateYamunaStudents() {
    const studentsList = [];
    const firstNames = ['Aadya', 'Ananya', 'Bhavya', 'Charu', 'Deepika', 'Diya', 'Esha', 'Gauri', 'Isha', 'Jaya', 'Kavya', 'Lakshmi', 'Meera', 'Neha', 'Pooja', 'Priya', 'Riya', 'Saanvi', 'Sneha', 'Naveena', 'Tara', 'Uma', 'Varsha', 'Zara', 'Nisha', 'Aarti', 'Megha', 'Priyanka'];
    const lastNames = ['Kumar', 'S', 'P', 'R', 'M', 'K', 'J', 'D', 'Sharma', 'Reddy', 'Patel', 'Singh', 'Raj'];
    const courses = ['MCA', 'B.Tech', 'M.Tech', 'B.Sc'];
    const depts = ['Computer Applications', 'Information Tech', 'Computer Science', 'Data Science'];

    let rollCount = 100;

    // 24 rooms (301 to 324), 5 students each = 120 students
    for (let roomNum = 301; roomNum <= 324; roomNum++) {
        for (let bed = 1; bed <= 5; bed++) {
            const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const course = courses[Math.floor(Math.random() * courses.length)];
            const dept = depts[Math.floor(Math.random() * depts.length)];

            const breakfastStatus = Math.random() > 0.2 ? 'booked' : 'canceled';
            const lunchStatus = Math.random() > 0.3 ? 'booked' : 'canceled';
            const snackStatus = Math.random() > 0.4 ? 'booked' : 'canceled';
            const dinnerStatus = Math.random() > 0.1 ? 'booked' : 'canceled';
            const attendance = Math.random() > 0.05 ? 'Present' : 'Absent';

            studentsList.push({
                rollNo: `21${course.substring(0, 3).toUpperCase()}${rollCount++}`,
                name: `${fName} ${lName}`.toUpperCase(),
                course: course,
                department: dept,
                tutorName: 'Dr. R. Dinesh',
                hodName: 'Dr. S. Karthi',
                parentName: `Mr. ${firstNames[Math.floor(Math.random() * firstNames.length)]}`,
                contactNumber: '+91 ' + Math.floor(9000000000 + Math.random() * 999999999),
                hostel: 'Yamuna',
                roomNo: `YA-${roomNum}`,
                meals: { breakfast: breakfastStatus, lunch: lunchStatus, snack: snackStatus, dinner: dinnerStatus },
                attendance: { today: attendance, last30Days: Math.floor(80 + Math.random() * 20) + '%' },
                nextWeekMeals: getDefaultWeeklyMeals(true),
                barcode: Math.floor(100000000000 + Math.random() * 899999999999).toString(),
                scannedMeals: [],
                pastBookings: [],
                canEditProfile: false,
                password: `21${course.substring(0, 3).toUpperCase()}${rollCount - 1}`, // Default password is roll number
                isFirstLogin: true
            });
        }
    }

    // Guarantee test accounts
    studentsList[0].rollNo = '21MCA042';
    studentsList[0].password = '21MCA042';
    studentsList[0].name = 'NAVEENA S';
    studentsList[0].pastBookings = generatePastBookings();

    studentsList[1].rollNo = '21BCT015';
    studentsList[1].password = '21BCT015';
    studentsList[1].name = 'ANANYA P';
    studentsList[1].pastBookings = generatePastBookings();

    return studentsList;
}

const db = {
    students: generateYamunaStudents(),
    warden: {
        id: 'WARDEN01',
        name: 'Mrs. Kavitha',
        hostel: 'Yamuna (3rd Floor)',
        role: 'Floor Warden'
    },
    prices: {
        breakfast: 40,
        lunch: 60,
        snack: 20,
        dinner: 50
    },
    bookingSettings: {
        dayOfWeek: 2,
        startHour: 6,
        endHour: 18
    }
};

function getBookingWindowText() {
    const shortenDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = shortenDay[db.bookingSettings.dayOfWeek];
    const start = parseInt(db.bookingSettings.startHour);
    const end = parseInt(db.bookingSettings.endHour);
    const startAmPm = start >= 12 ? (start === 12 ? '12 PM' : (start - 12) + ' PM') : (start === 0 ? '12 AM' : start + ' AM');
    const endAmPm = end >= 12 ? (end === 12 ? '12 PM' : (end - 12) + ' PM') : (end === 0 ? '12 AM' : end + ' AM');
    return `${dayName} ${startAmPm} - ${endAmPm}`;
}

function generateQR(text) {
    if (typeof qrcode === 'undefined') return '';
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    return qr.createImgTag(4, 0);
}

function checkIsBookingOpen() {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();

    return (day === parseInt(db.bookingSettings.dayOfWeek) && hours >= parseInt(db.bookingSettings.startHour) && hours < parseInt(db.bookingSettings.endHour));
}

function render() {
    const app = document.getElementById('app');

    if (appState.view === 'login') {
        app.innerHTML = renderLogin();
        document.getElementById('loginForm').addEventListener('submit', handleLogin);
        document.getElementById('tabStudent').addEventListener('click', () => { appState.loginTab = 'student'; render(); });
        document.getElementById('tabWarden').addEventListener('click', () => { appState.loginTab = 'warden'; render(); });
    } else if (appState.view === 'student-dashboard') {
        app.innerHTML = renderStudentDashboard();

        setTimeout(() => {
            const qrContainer = document.getElementById('qrCodeContainer');
            if (qrContainer && db.students[0].barcode) {
                qrContainer.innerHTML = generateQR(db.students[0].barcode);
            }
        }, 100);

        document.getElementById('logoutBtn').addEventListener('click', logout);
        if (document.getElementById('navDashboard')) document.getElementById('navDashboard').addEventListener('click', () => { appState.studentActiveTab = 'dashboard'; render(); });
        if (document.getElementById('navBooking')) document.getElementById('navBooking').addEventListener('click', () => { appState.studentActiveTab = 'booking'; render(); });
        if (document.getElementById('navMenu')) document.getElementById('navMenu').addEventListener('click', () => { appState.studentActiveTab = 'menu'; render(); });
        if (document.getElementById('navBilling')) document.getElementById('navBilling').addEventListener('click', () => { appState.studentActiveTab = 'billing'; render(); });

        if (document.getElementById('dlPdfBtn')) document.getElementById('dlPdfBtn').addEventListener('click', downloadTruePDF);
        if (document.getElementById('billingDateRange')) document.getElementById('billingDateRange').addEventListener('change', updateBillingTable);

        if (document.getElementById('editProfileBtn')) document.getElementById('editProfileBtn').addEventListener('click', () => { appState.studentActiveTab = 'edit-profile'; render(); });
        if (document.getElementById('saveProfileBtn')) document.getElementById('saveProfileBtn').addEventListener('click', saveStudentProfile);
        if (document.getElementById('hostelSelect')) document.getElementById('hostelSelect').addEventListener('change', updateRoomOptions);

    } else if (appState.view === 'warden-dashboard') {
        app.innerHTML = renderWardenDashboard();

        if (appState.wardenActiveTab === 'scanner') {
            setTimeout(startScanner, 200);
        }

        document.getElementById('logoutBtn').addEventListener('click', logout);
        if (document.getElementById('navWardenDashboard')) document.getElementById('navWardenDashboard').addEventListener('click', () => handleWardenTabChange('dashboard'));
        if (document.getElementById('navWardenUsers')) document.getElementById('navWardenUsers').addEventListener('click', () => handleWardenTabChange('users'));
        if (document.getElementById('navWardenReports')) document.getElementById('navWardenReports').addEventListener('click', () => handleWardenTabChange('reports'));
        if (document.getElementById('navWardenScanner')) document.getElementById('navWardenScanner').addEventListener('click', () => handleWardenTabChange('scanner'));
        if (document.getElementById('navWardenBilling')) document.getElementById('navWardenBilling').addEventListener('click', () => handleWardenTabChange('billing'));
        if (document.getElementById('navWardenSettings')) document.getElementById('navWardenSettings').addEventListener('click', () => handleWardenTabChange('settings'));

        if (document.getElementById('scanQrBtn')) document.getElementById('scanQrBtn').addEventListener('click', () => handleWardenTabChange('scanner'));

        // Setup search filter for student list
        const searchInput = document.getElementById('studentSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => filterStudentList(e.target.value));
        }

    } else if (appState.view === 'warden-student-detail') {
        app.innerHTML = renderWardenStudentDetail();

        setTimeout(() => {
            const qrContainer = document.getElementById('wardenQrCodeContainer');
            if (qrContainer && db.students[appState.selectedStudent].barcode) {
                qrContainer.innerHTML = generateQR(db.students[appState.selectedStudent].barcode);
            }
        }, 100);

        document.getElementById('logoutBtn').addEventListener('click', logout);
        document.getElementById('backBtn').addEventListener('click', () => { appState.view = 'warden-dashboard'; render(); });
    } else if (appState.view === 'student-first-login') {
        app.innerHTML = renderStudentFirstLogin();
        document.getElementById('resetPassForm').addEventListener('submit', resetPassword);
        document.getElementById('logoutBtn').addEventListener('click', logout);
    }
}

function renderStudentFirstLogin() {
    return `
        <div class="login-container animate-fade-in">
            <div class="login-card glass-panel" style="max-width: 500px; padding: 40px;">
                <div class="login-header">
                    <h2><i class="ph-fill ph-lock-key"></i> Setup Password</h2>
                    <p>Welcome! This is your first time logging in. Please set a new password to secure your account.</p>
                </div>
                <form id="resetPassForm" style="display: flex; flex-direction: column; gap: 20px; margin-top: 20px;">
                    <div class="form-group">
                        <label>New Password</label>
                        <input type="password" id="newPassword" class="input-field" placeholder="Minimum 6 characters" required>
                    </div>
                    <div class="form-group">
                        <label>Confirm Password</label>
                        <input type="password" id="confirmPassword" class="input-field" placeholder="Confirm your new password" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">Set Password & Continue</button>
                </form>
                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn btn-outline" id="logoutBtn" style="border-color: var(--danger-color); color: var(--danger-color); font-size: 0.85rem;"><i class="ph ph-sign-out"></i> Logout</button>
                </div>
            </div>
        </div>
    `;
}

function handleLogin(e) {
    e.preventDefault();
    const userInput = document.getElementById('rollNo').value.trim();
    const passInput = document.getElementById('password').value;

    if (appState.loginTab === 'warden') {
        if (userInput === 'admin' && passInput === 'admin') {
            appState.view = 'warden-dashboard';
            appState.wardenActiveTab = 'dashboard';
        } else {
            alert("Invalid Warden Credentials. Use admin/admin");
            return;
        }
    } else {
        const studentIndex = db.students.findIndex(s => s.rollNo.toUpperCase() === userInput.toUpperCase());
        if (studentIndex > -1) {
            if (db.students[studentIndex].password === passInput) {
                appState.selectedStudent = studentIndex;
                if (db.students[studentIndex].isFirstLogin) {
                    appState.view = 'student-first-login';
                } else {
                    appState.view = 'student-dashboard';
                    appState.studentActiveTab = 'dashboard';
                }
            } else {
                alert("Incorrect password. Default is your Roll No. Please try again.");
                return;
            }
        } else {
            alert("Student not found. Please contact the warden to onboard you.");
            return;
        }
    }
    render();
}

async function logout() {
    if (appState.wardenActiveTab === 'scanner') {
        await window.stopScanner();
    }
    appState.view = 'login';
    render();
}

function mockScanQR() {
    const code = prompt("Enter Student QR / BarCode to Simulate Scan at Mess Hall (Try 123456789012):");
    if (!code) return;

    const student = db.students.find(s => s.barcode === code);
    if (!student) {
        alert("❌ Invalid QR Code. Student not found.");
        return;
    }

    const currentMeal = "lunch";

    if (student.meals[currentMeal] !== 'booked') {
        alert("❌ Denied. " + student.name + " has NOT booked Lunch today.");
        return;
    }

    if (student.scannedMeals.includes(currentMeal)) {
        alert("🚨 DUPLICATE SCAN PREVENTED! " + student.name + " has already entered the mess hall for " + currentMeal + ".");
        return;
    }

    student.scannedMeals.push(currentMeal);
    alert("✅ Success! " + student.name + " allowed for " + currentMeal + ".");
}

function getFilteredBookings() {
    const student = db.students[0];
    const rangeInput = document.getElementById('billingDateRange');

    // Default fallback dates if not selected
    let startTimestamp = 0; // The beginning of time
    let endTimestamp = Date.now() + 86400000; // Tomorrow (to include today fully)

    if (rangeInput && rangeInput.value) {
        if (rangeInput.value.includes(' to ')) {
            const parts = rangeInput.value.split(' to ');
            startTimestamp = new Date(parts[0]).getTime();
            const d = new Date(parts[1]);
            d.setHours(23, 59, 59, 999);
            endTimestamp = d.getTime();
        } else {
            startTimestamp = new Date(rangeInput.value).getTime();
            const d = new Date(rangeInput.value);
            d.setHours(23, 59, 59, 999);
            endTimestamp = d.getTime();
        }
    }

    return student.pastBookings.filter(bk => {
        return bk.timestamp >= startTimestamp && bk.timestamp <= endTimestamp;
    });
}

function updateBillingTable() {
    const bookings = getFilteredBookings();
    const tbody = document.getElementById('billingTableBody');
    if (!tbody) return;

    tbody.innerHTML = bookings.map((bk, idx) => `
        <tr style="cursor: pointer;" onclick="toggleBillingDetails(${idx})">
            <td><strong>${bk.id}</strong></td>
            <td>${bk.dateRange}</td>
            <td><strong>${bk.activeMeals} Meals</strong> Booked</td>
            <td style="text-align: right;"><i class="ph ph-caret-down"></i></td>
        </tr>
        <tr id="billing-detail-${idx}" style="display: none; background: rgba(0,0,0,0.2);">
            <td colspan="4" style="padding: 16px;">
                ${renderPastWeeklyDetails(bk.details)}
            </td>
        </tr>
    `).join('');
}

function toggleBillingDetails(idx) {
    const el = document.getElementById('b-detail-' + idx);
    const icon = document.getElementById('b-icon-' + idx);
    if (el) {
        if (el.style.display === 'none') { el.style.display = 'table-row'; if (icon) icon.className = 'ph ph-caret-up'; }
        else { el.style.display = 'none'; if (icon) icon.className = 'ph ph-caret-down'; }
    }
}

function resetPassword(e) {
    if (e) e.preventDefault();
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;

    if (newPass.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
    }
    if (newPass !== confirmPass) {
        alert("Passwords do not match.");
        return;
    }

    const currStudent = db.students[appState.selectedStudent];
    currStudent.password = newPass;
    currStudent.isFirstLogin = false;
    alert("Password updated successfully! Welcome to the portal.");

    appState.view = 'student-dashboard';
    appState.studentActiveTab = 'dashboard';
    render();
}

function renderPastWeeklyDetails(details) {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayLabels = { sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday' };

    let html = `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; padding: 16px; background: rgba(0,0,0,0.1); border-radius: 8px;">`;

    for (const d of days) {
        html += `
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--surface-border); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                <div style="text-align: center; font-weight: bold; color: var(--primary-color); border-bottom: 1px solid var(--surface-border); padding-bottom: 6px; margin-bottom: 4px;">
                    <i class="ph-fill ph-calendar-blank" style="margin-right: 4px;"></i>${dayLabels[d]}
                </div>
        `;

        for (const m of ['breakfast', 'lunch', 'snack', 'dinner']) {
            let prefText = '';
            let statusHtml = '';

            if (details[d] && details[d][m] === 'booked') {
                if (d === 'sun' && m === 'lunch') prefText = `<div style="font-size:0.7rem; color:var(--text-secondary); line-height:1; margin-top:2px;">(${details.sunLunchPref === 'non-veg' ? 'Non-Veg' : 'Veg'})</div>`;
                if (d === 'tue' && m === 'dinner') prefText = `<div style="font-size:0.7rem; color:var(--text-secondary); line-height:1; margin-top:2px;">(${details.tueDinnerPref === 'non-veg' ? 'Non-Veg' : 'Veg'})</div>`;
                if (d === 'thu' && m === 'dinner') {
                    prefText = `<div style="font-size:0.7rem; color:var(--text-secondary); line-height:1; margin-top:2px;">(${details.thuDinnerPref === 'non-veg' ? 'Non-Veg' : 'Veg'})</div>`;
                    if (details.thuIceCream) prefText += `<div style="font-size:0.7rem; color:var(--primary-color); line-height:1; margin-top:2px;">+ Ice Cream 🍦</div>`;
                }

                statusHtml = `<div style="color:var(--success-color); font-weight:bold; font-size:0.85rem;"><i class="ph-bold ph-check"></i> Booked</div>${prefText}`;
            } else {
                statusHtml = `<div style="color:var(--text-muted); font-size:0.8rem;"><i class="ph-bold ph-x"></i> None</div>`;
            }

            const mealLabel = m.charAt(0).toUpperCase() + m.slice(1);
            html += `
                <div style="display: flex; flex-direction: column; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 6px;">
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 2px;">${mealLabel}</div>
                    ${statusHtml}
                </div>
            `;
        }

        html += `</div>`;
    }
    html += `</div>`;
    return html;
}

function downloadTruePDF() {
    if (!window.jspdf) {
        alert("PDF library is loading or failed to load. Please try again in a moment.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const student = db.students[0];

    doc.setFontSize(18);
    doc.text("SmartMess - Digital Mess Management Invoice", 14, 22);

    doc.setFontSize(11);
    doc.text(`Student Name: ${student.name}`, 14, 32);
    doc.text(`Roll No: ${student.rollNo}`, 14, 38);
    doc.text(`Department: ${student.department}`, 14, 44);

    const bookings = getFilteredBookings();

    const tableData = bookings.map(b => [
        b.id,
        b.dateRange,
        b.activeMeals + ' Meals Total'
    ]);

    doc.autoTable({
        startY: 50,
        head: [['Invoice ID', 'Date Range', 'Booked Meals Count']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [88, 166, 255] }
    });

    const rangeInput = document.getElementById('billingDateRange');
    let rangeLabel = "All_Time";
    if (rangeInput && rangeInput.value) {
        if (rangeInput.value.includes(' to ')) {
            const parts = rangeInput.value.split(' to ');
            rangeLabel = `${parts[0]}_to_${parts[1]}`;
        } else {
            rangeLabel = rangeInput.value;
        }
    }

    doc.save(`Mess_Invoice_${student.rollNo}_${rangeLabel}.pdf`);
}

function renderLogin() {
    const isWarden = appState.loginTab === 'warden';
    return `
        <div class="auth-container animate-fade-in">
            <div class="glass-panel auth-card">
                <div class="auth-header">
                    <i class="ph-fill ${isWarden ? 'ph-shield-check' : 'ph-student'}" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 12px; filter: drop-shadow(var(--shadow-glow))"></i>
                    <h1>${isWarden ? 'Warden Portal' : 'Student Portal'}</h1>
                    <p>Digital Mess Management System</p>
                </div>
                
                <div class="tabs">
                    <button id="tabStudent" class="tab ${!isWarden ? 'active' : ''}">Student</button>
                    <button id="tabWarden" class="tab ${isWarden ? 'active' : ''}">Warden / Staff</button>
                </div>

                <form id="loginForm">
                    <div class="form-group">
                        <label for="rollNo">${isWarden ? 'Staff ID' : 'College Roll Number'}</label>
                        <input type="text" id="rollNo" class="input-field" placeholder="${isWarden ? 'e.g. admin' : 'e.g. 21MCA042'}" value="${isWarden ? 'admin' : '21MCA042'}" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" class="input-field" placeholder="••••••••" value="${isWarden ? 'admin' : '21MCA042'}" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px; font-size: 1rem; padding: 14px;">
                        <i class="ph-bold ph-sign-in"></i> Secure Login
                    </button>
                </form>
            </div>
        </div>
    `;
}

// ============================
// STUDENT VIEWS
// ============================
function renderStudentDashboard() {
    const student = db.students[0];

    let mainContentHtml = '';

    if (appState.studentActiveTab === 'dashboard') {

        mainContentHtml = `
            <div class="page-header animate-fade-in delay-1">
                <div>
                    <h2>Overview <span style="font-size: 1.2rem; font-weight: 400;">/ Welcome, ${student.name.split(' ')[0]}</span></h2>
                    <p>Review your profile and today's status.</p>
                </div>
                <div style="display: flex; gap: 12px;">
                    ${student.canEditProfile ? '<button class="btn btn-primary" id="editProfileBtn"><i class="ph ph-pencil-simple"></i> Edit Details</button>' : ''}
                    <button class="btn btn-outline" id="logoutBtn" style="border-color: var(--danger-color); color: var(--danger-color)"><i class="ph ph-sign-out"></i> Logout</button>
                </div>
            </div>

            <!-- Profile Card Extended with QR -->
            <div class="glass-panel profile-card animate-fade-in delay-2" style="margin-bottom: 40px; display: flex; flex-wrap: wrap; gap: 30px;">
                <div class="profile-img" style="flex-shrink: 0;"><i class="ph ph-user"></i></div>
                <div class="profile-details" style="flex: 1; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                    <div class="detail-item"><label>Registration No</label><p>${student.rollNo}</p></div>
                    <div class="detail-item"><label>Student Name</label><p>${student.name}</p></div>
                    <div class="detail-item"><label>Department</label><p>${student.department}</p></div>
                    <div class="detail-item"><label>Course</label><p>${student.course}</p></div>
                    <div class="detail-item"><label>Hostel / Room</label><p>${student.hostel} | ${student.roomNo}</p></div>
                    <div class="detail-item"><label>Parent Name</label><p>${student.parentName}</p></div>
                    <div class="detail-item"><label>Contact Ref.</label><p>${student.contactNumber}</p></div>
                    <div class="detail-item"><label>Tutor Name</label><p>${student.tutorName}</p></div>
                    <div class="detail-item"><label>HOD Name</label><p>${student.hodName}</p></div>
                </div>
                <div style="flex-basis: 150px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-left: 1px solid var(--surface-border); padding-left: 30px;">
                    <label style="font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px;">Mess QR Code</label>
                    <div style="background: white; padding: 10px; border-radius: 8px; margin-bottom: 5px;" id="qrCodeContainer"></div>
                    <p style="font-size: 0.75rem; color: var(--success-color);"><i class="ph-bold ph-shield-check"></i> Verification Ready</p>
                </div>
            </div>

            <div class="glass-panel animate-fade-in delay-3" style="padding: 24px;">
               <h3 style="margin-bottom: 16px;">Today's Current Bookings</h3>
               <div style="display: flex; gap: 20px;">
                  <span class="badge ${student.meals.breakfast === 'booked' ? 'badge-success' : 'badge-danger'}">Breakfast: ${student.meals.breakfast}</span>
                  <span class="badge ${student.meals.snack === 'booked' ? 'badge-success' : 'badge-danger'}">Snacks: ${student.meals.snack}</span>
                  <span class="badge ${student.meals.lunch === 'booked' ? 'badge-success' : 'badge-danger'}">Lunch: ${student.meals.lunch}</span>
                  <span class="badge ${student.meals.dinner === 'booked' ? 'badge-success' : 'badge-danger'}">Dinner: ${student.meals.dinner}</span>
               </div>
            </div>
        `;

    } else if (appState.studentActiveTab === 'booking') {
        const isBookingOpen = checkIsBookingOpen();

        mainContentHtml = `
            <div class="page-header animate-fade-in delay-1">
                <div>
                    <h2>Next Week Booking Setup</h2>
                    <p>Customize your diet plan for the upcoming week cycle.</p>
                </div>
                <button class="btn btn-outline" id="logoutBtn" style="border-color: var(--danger-color); color: var(--danger-color)"><i class="ph ph-sign-out"></i> Logout</button>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px;" class="animate-fade-in delay-2">
                <h3 style="font-size: 1.4rem;">Select Your Meals</h3>
                <div class="badge ${isBookingOpen ? 'badge-success' : 'badge-danger'}" style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; padding: 8px 16px;">
                    <i class="ph-bold ${isBookingOpen ? 'ph-lock-key-open' : 'ph-lock-key'}"></i> 
                    ${isBookingOpen ? 'Booking Open (' + getBookingWindowText() + ')' : 'Booking Closed (Only ' + getBookingWindowText() + ')'}
                </div>
            </div>
            
            ${renderStudentBookingMatrix(student, isBookingOpen)}
            <div style="display: flex; justify-content: flex-end; margin-top: 20px;" class="animate-fade-in delay-3">
                <button class="btn btn-primary" onclick="confirmNextWeekBooking()" ${isBookingOpen ? '' : 'disabled'} style="font-size: 1.1rem; padding: 12px 24px; box-shadow: var(--shadow-glow);">
                    <i class="ph-bold ph-check-circle"></i> Confirm Booking
                </button>
            </div>
        `;
    } else if (appState.studentActiveTab === 'menu') {
        const trs = messMenu.map(day => `
            <tr>
                <td style="font-weight: bold; color: var(--primary-color); vertical-align: top;">${day.day}</td>
                <td style="vertical-align: top;"><div style="font-size: 0.95rem;">${day.breakfast}</div></td>
                <td style="vertical-align: top;"><div style="font-size: 0.95rem;">${day.lunch}</div></td>
                <td style="vertical-align: top;"><div style="font-size: 0.95rem;">${day.snack}</div></td>
                <td style="vertical-align: top;"><div style="font-size: 0.95rem;">${day.dinner}</div></td>
            </tr>
        `).join('');

        mainContentHtml = `
            <div class="page-header animate-fade-in delay-1">
                <div>
                    <h2>Weekly Mess Menu</h2>
                    <p>Review the food schedule for the week. (Note: Mutton Biryani once per semester)</p>
                </div>
                <button class="btn btn-outline" id="logoutBtn" style="border-color: var(--danger-color); color: var(--danger-color)"><i class="ph ph-sign-out"></i> Logout</button>
            </div>
            
            <div class="glass-panel animate-fade-in delay-2" style="overflow: hidden;">
                <div style="overflow-x: auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Breakfast <span style="display:block; font-size:0.75rem; text-transform:none; color:var(--text-muted)">6:30 - 9:15 AM</span></th>
                                <th>Lunch <span style="display:block; font-size:0.75rem; text-transform:none; color:var(--text-muted)">12:00 - 2:15 PM</span></th>
                                <th>Evening Snack <span style="display:block; font-size:0.75rem; text-transform:none; color:var(--text-muted)">4:00 - 6:30 PM</span></th>
                                <th>Dinner <span style="display:block; font-size:0.75rem; text-transform:none; color:var(--text-muted)">7:00 - 8:30 PM</span></th>
                            </tr>
                        </thead>
                        <tbody>${trs}</tbody>
                    </table>
                </div>
            </div>
        `;
    } else if (appState.studentActiveTab === 'billing') {
        mainContentHtml = `
            <div class="page-header animate-fade-in delay-1">
                <div>
                    <h2>Billing & History</h2>
                    <p>Track your ₹1,18,000 initial deposit (June), monthly deductions, and your remaining refundable balance.</p>
                </div>
                <button class="btn btn-outline" id="logoutBtn" style="border-color: var(--danger-color); color: var(--danger-color)"><i class="ph ph-sign-out"></i> Logout</button>
            </div>
            
            <div class="stats-grid animate-fade-in delay-1" style="margin-bottom: 24px;">
                <div class="glass-panel stat-card">
                    <div class="stat-info"><h3>Initial Deposit (June)</h3><div class="value" style="color: var(--primary-color)">₹ 1,18,000</div></div>
                    <div class="stat-icon" style="background: rgba(88, 166, 255, 0.1); color: var(--primary-color)"><i class="ph-fill ph-bank"></i></div>
                </div>
                <div class="glass-panel stat-card">
                    <div class="stat-info"><h3>Expenses Till Date</h3><div class="value" style="color: var(--warning-color)">₹ 48,500</div></div>
                    <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: var(--warning-color)"><i class="ph-fill ph-receipt"></i></div>
                </div>
                <div class="glass-panel stat-card">
                    <div class="stat-info"><h3>Refundable Balance</h3><div class="value" style="color: var(--success-color)">₹ 69,500</div></div>
                    <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--success-color)"><i class="ph-fill ph-wallet"></i></div>
                </div>
            </div>

            <div class="glass-panel animate-fade-in delay-2" style="overflow: hidden;">
                <div style="padding: 20px 24px; border-bottom: 1px solid var(--surface-border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                    <h3 style="font-size: 1.2rem;">Detailed Ledger</h3>
                    
                    <!-- Date Range Selection -->
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="font-size: 0.85rem; color: var(--text-secondary);">Select Time Limit</span>
                        <input type="text" class="input-field" id="billingDateRange" placeholder="Select Dates..." style="width: 220px; padding: 6px 12px; font-size: 0.85rem;">
                        <button class="btn btn-primary" id="dlPdfBtn" style="font-size: 0.85rem; padding: 6px 12px;"><i class="ph ph-file-pdf"></i> Download PDF</button>
                    </div>
                </div>
                <div style="overflow-y: auto; max-height: 500px;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Invoice ID</th>
                                <th>Date Range</th>
                                <th>Meals Active</th>
                                <th style="text-align: right;">Details</th>
                            </tr>
                        </thead>
                        <tbody id="billingTableBody">
                            <!-- Populated dynamically via JS below -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        setTimeout(() => {
            updateBillingTable();
            if (window.flatpickr) {
                flatpickr("#billingDateRange", {
                    mode: "range",
                    dateFormat: "Y-m-d",
                    theme: "dark"
                });
            }
        }, 0);
    } else if (appState.studentActiveTab === 'edit-profile') {
        const hostels = ['Yamuna', 'Kurinji', 'Marutham', 'Megala'];
        mainContentHtml = `
            <div class="page-header animate-fade-in delay-1">
                <div>
                    <h2>Edit Profile Details</h2>
                    <p>Update your personal and academic info. Note: You can only edit this once!</p>
                </div>
                <button class="btn btn-outline" id="logoutBtn" style="border-color: var(--danger-color); color: var(--danger-color)"><i class="ph ph-sign-out"></i> Logout</button>
            </div>
            
            <div class="glass-panel animate-fade-in delay-2" style="padding: 24px; max-width: 800px; margin: 0 auto;">
                <form id="editProfileForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label>Registration / Roll No</label>
                        <input type="text" id="editRoll" class="input-field" value="${student.rollNo}">
                    </div>
                    <div class="form-group">
                        <label>Student Name</label>
                        <input type="text" id="editName" class="input-field" value="${student.name}">
                    </div>
                    <div class="form-group">
                        <label>Course</label>
                        <input type="text" id="editCourse" class="input-field" value="${student.course}">
                    </div>
                    <div class="form-group">
                        <label>Department</label>
                        <input type="text" id="editDept" class="input-field" value="${student.department}">
                    </div>
                    <div class="form-group">
                        <label>Parent/Guardian Name</label>
                        <input type="text" id="editParent" class="input-field" value="${student.parentName}">
                    </div>
                    <div class="form-group">
                        <label>Contact Number</label>
                        <input type="text" id="editContact" class="input-field" value="${student.contactNumber}">
                    </div>
                    <div class="form-group">
                        <label>Tutor Name</label>
                        <input type="text" id="editTutor" class="input-field" value="${student.tutorName}">
                    </div>
                    <div class="form-group">
                        <label>HOD Name</label>
                        <input type="text" id="editHod" class="input-field" value="${student.hodName}">
                    </div>
                    
                    <div class="form-group">
                        <label>Hostel Name</label>
                        <select id="hostelSelect" class="input-field">
                            <!-- Add dynamic options based on current value -->
                            <option value="">Select Hostel</option>
                            ${hostels.map(h => `<option value="${h}" ${student.hostel === h ? 'selected' : ''}>${h}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" id="roomGroup">
                        <label>Room No</label>
                        <select id="roomSelect" class="input-field" style="display: ${student.hostel === 'Yamuna' ? 'block' : 'none'};">
                            <option value="">Select Room</option>
                        </select>
                        <input type="text" id="roomInput" class="input-field" value="${student.roomNo}" style="display: ${student.hostel !== 'Yamuna' ? 'block' : 'none'};">
                    </div>

                    <div style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
                        <button type="button" class="btn btn-outline" onclick="appState.studentActiveTab = 'dashboard'; render();">Cancel</button>
                        <button type="button" class="btn btn-primary" id="saveProfileBtn"><i class="ph ph-floppy-disk"></i> Save & Lock Details</button>
                    </div>
                </form>
            </div>
        `;

        // Populate room options dynamically if Yamuna is selected initially
        setTimeout(() => {
            if (student.hostel === 'Yamuna' && document.getElementById('hostelSelect').value === 'Yamuna') {
                window.updateRoomOptions();
                const roomSel = document.getElementById('roomSelect');
                if (roomSel) roomSel.value = student.roomNo;
            }
        }, 50);

    }

    return `
        <div class="dashboard-layout animate-fade-in">
            <aside class="sidebar">
                <div class="sidebar-brand"><i class="ph-fill ph-fork-knife"></i><span>SmartMess</span></div>
                <ul class="nav-menu">
                    <li id="navDashboard" class="nav-item ${appState.studentActiveTab === 'dashboard' ? 'active' : ''}"><i class="ph ph-squares-four"></i> Dashboard Overview</li>
                    <li id="navBooking" class="nav-item ${appState.studentActiveTab === 'booking' ? 'active' : ''}"><i class="ph ph-calendar-plus"></i> Mess Booking Setup</li>
                    <li id="navMenu" class="nav-item ${appState.studentActiveTab === 'menu' ? 'active' : ''}"><i class="ph ph-book-open-text"></i> Mess Menu</li>
                    <li id="navBilling" class="nav-item ${appState.studentActiveTab === 'billing' ? 'active' : ''}"><i class="ph ph-receipt"></i> Billing Details</li>
                </ul>
                <div class="user-profile-sm">
                    <div class="avatar">${student.name.charAt(0)}</div>
                    <div class="user-info-sm"><h4>${student.name}</h4><p>${student.rollNo}</p></div>
                </div>
            </aside>
            <main class="main-content">
                ${mainContentHtml}
            </main>
        </div>
    `;
}

function mkToggle(day, meal, checkedVal, disabledAttr, isWarden = false) {
    const fn = isWarden ? `wardenToggleNextWeekMeal('${day}', '${meal}')` : `studentToggleMeal('${day}', '${meal}', ${!disabledAttr})`;
    const isChecked = checkedVal === 'booked';
    return `
        <label class="toggle-switch">
            <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="${fn}" ${disabledAttr ? 'disabled' : ''}>
            <span class="toggle-slider"></span>
        </label>
    `;
}

function mkPrefToggle(day, meal, checkedVal, prefKey, prefVal, label1, label2, disabledAttr, isWarden = false, extraHtml = '') {
    const isChecked = checkedVal === 'booked';
    const isPrefChecked = prefVal === 'non-veg';
    const prefFn = `updatePref('${prefKey}', this.checked ? 'non-veg' : 'veg', ${isWarden})`;

    return `
        <div style="display: flex; flex-direction: column; gap: 6px; align-items: center; justify-content: center;">
            <div style="display: flex; justify-content: center;">
                ${mkToggle(day, meal, checkedVal, disabledAttr, isWarden)}
            </div>
            ${isChecked ? `
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.70rem; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 6px; width: max-content; margin: 0 auto; line-height: 1;">
                <span class="pref-label ${!isPrefChecked ? 'active-veg' : ''}">${label1}</span>
                <label class="toggle-switch sm">
                    <input type="checkbox" ${isPrefChecked ? 'checked' : ''} onchange="${prefFn}" ${disabledAttr ? 'disabled' : ''}>
                    <span class="toggle-slider pref-slider" style="background-color: ${isPrefChecked ? 'var(--danger-color)' : 'var(--success-color)'}"></span>
                </label>
                <span class="pref-label ${isPrefChecked ? 'active-nonveg' : ''}">${label2}</span>
            </div>
            ${extraHtml ? extraHtml : ''}
            ` : ''}
        </div>
    `;
}

function renderStudentBookingMatrix(student, isBookingOpen) {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayNames = { sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday" };
    const disableAttr = !isBookingOpen;

    const rows = days.map(day => {
        const rowMeals = student.nextWeekMeals[day];

        let lunchTd = `
            <div style="display: flex; justify-content: center;">
                ${mkToggle(day, 'lunch', rowMeals.lunch, disableAttr)}
            </div>`;
        let dinnerTd = `
            <div style="display: flex; justify-content: center;">
                ${mkToggle(day, 'dinner', rowMeals.dinner, disableAttr)}
            </div>`;

        if (day === 'sun') {
            lunchTd = mkPrefToggle('sun', 'lunch', rowMeals.lunch, 'sunLunchPref', student.nextWeekMeals.sunLunchPref, 'Veg', 'Non-Veg', disableAttr);
        } else if (day === 'tue') {
            dinnerTd = mkPrefToggle('tue', 'dinner', rowMeals.dinner, 'tueDinnerPref', student.nextWeekMeals.tueDinnerPref, 'Veg', 'Non-Veg', disableAttr);
        } else if (day === 'thu') {
            const iceFn = `updateIceCream(this.checked, false)`;
            const iceHtml = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 0.70rem; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 6px; width: max-content; margin: 0 auto; line-height: 1;">
                <span class="pref-label ${student.nextWeekMeals.thuIceCream ? 'active-nonveg' : ''}" style="${student.nextWeekMeals.thuIceCream ? 'color: var(--primary-color);' : ''}">Ice Cream 🍦</span>
                <label class="toggle-switch sm">
                    <input type="checkbox" ${student.nextWeekMeals.thuIceCream ? 'checked' : ''} onchange="${iceFn}" ${disableAttr ? 'disabled' : ''}>
                    <span class="toggle-slider pref-slider" style="background-color: ${student.nextWeekMeals.thuIceCream ? 'var(--primary-color)' : 'var(--surface-border)'}"></span>
                </label>
            </div>
            `;
            dinnerTd = mkPrefToggle('thu', 'dinner', rowMeals.dinner, 'thuDinnerPref', student.nextWeekMeals.thuDinnerPref, 'Veg', 'Non-Veg', disableAttr, false, iceHtml);
        }

        return `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="font-weight: 600; padding: 12px;">${dayNames[day]}</td>
                <td style="text-align: center; vertical-align: middle; padding: 8px;">
                    <div style="display: flex; justify-content: center;">
                        ${mkToggle(day, 'breakfast', rowMeals.breakfast, disableAttr)}
                    </div>
                </td>
                <td style="text-align: center; vertical-align: middle; padding: 8px;">${lunchTd}</td>
                <td style="text-align: center; vertical-align: middle; padding: 8px;">
                    <div style="display: flex; justify-content: center;">
                        ${mkToggle(day, 'snack', rowMeals.snack, disableAttr)}
                    </div>
                </td>
                <td style="text-align: center; vertical-align: middle; padding: 8px;">${dinnerTd}</td>
            </tr>
        `;
    }).join('');

    return `
        <div class="glass-panel animate-fade-in delay-3" style="overflow: hidden; margin-bottom: 20px;">
            <div style="overflow-x: auto;">
                <table class="data-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding: 12px;">Day</th>
                            <th style="text-align: center; padding: 12px;">Breakfast</th>
                            <th style="text-align: center; padding: 12px;">Lunch</th>
                            <th style="text-align: center; padding: 12px;">Snacks</th>
                            <th style="text-align: center; padding: 12px;">Dinner</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;
}

window.confirmNextWeekBooking = function () {
    const student = db.students[0];
    let activeMeals = 0;
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    days.forEach(d => {
        ['breakfast', 'lunch', 'snack', 'dinner'].forEach(m => {
            if (student.nextWeekMeals[d][m] === 'booked') activeMeals++;
        });
    });

    const newBookingId = 'BK-2026-MAR-W3';

    // Check if it already exists, avoid duplicates
    const exists = student.pastBookings.find(b => b.id === newBookingId);
    if (!exists) {
        student.pastBookings.unshift({
            id: newBookingId,
            dateRange: 'Mar 15 - Mar 21, 2026',
            activeMeals: activeMeals,
            details: JSON.parse(JSON.stringify(student.nextWeekMeals)),
            timestamp: new Date().getTime()
        });
    } else {
        exists.activeMeals = activeMeals;
        exists.details = JSON.parse(JSON.stringify(student.nextWeekMeals));
        exists.timestamp = new Date().getTime();
    }

    // Update QR barcode based on new confirmation
    student.barcode = student.rollNo + '-' + Date.now().toString().slice(-6);

    alert("✅ Booking confirmed for Mar 15 - Mar 21! Your QR and Billing History have been updated.");
    appState.studentActiveTab = 'billing';
    render();
}

window.studentToggleMeal = function (day, key, isBookingOpen) {
    if (!isBookingOpen) {
        alert("Booking is only open on " + getBookingWindowText() + ".");
        return;
    }
    const st = db.students[0];
    if (st.nextWeekMeals[day][key] === 'booked') {
        st.nextWeekMeals[day][key] = 'canceled';
    } else {
        st.nextWeekMeals[day][key] = 'booked';
    }
    render();
}

window.updateRoomOptions = function () {
    const hostel = document.getElementById('hostelSelect').value;
    const roomSelect = document.getElementById('roomSelect');
    const roomInput = document.getElementById('roomInput');

    if (hostel === 'Yamuna') {
        roomSelect.style.display = 'block';
        roomInput.style.display = 'none';

        let options = '<option value="">Select Room</option>';
        // Ground floor: YA-1 to YA-24
        for (let i = 1; i <= 24; i++) options += `<option value="YA-${i}">YA-${i} (Ground)</option>`;
        // 1st floor: YA-101 to YA-124
        for (let i = 101; i <= 124; i++) options += `<option value="YA-${i}">YA-${i} (1st Fl)</option>`;
        // 2nd floor: YA-201 to YA-224
        for (let i = 201; i <= 224; i++) options += `<option value="YA-${i}">YA-${i} (2nd Fl)</option>`;
        // 3rd floor: YA-301 to YA-324
        for (let i = 301; i <= 324; i++) options += `<option value="YA-${i}">YA-${i} (3rd Fl)</option>`;

        roomSelect.innerHTML = options;
    } else {
        roomSelect.style.display = 'none';
        roomInput.style.display = 'block';
    }
}

window.saveStudentProfile = function () {
    const student = db.students[0];

    student.rollNo = document.getElementById('editRoll').value;
    student.name = document.getElementById('editName').value;
    student.course = document.getElementById('editCourse').value;
    student.department = document.getElementById('editDept').value;
    student.parentName = document.getElementById('editParent').value;
    student.contactNumber = document.getElementById('editContact').value;
    student.tutorName = document.getElementById('editTutor').value;
    student.hodName = document.getElementById('editHod').value;

    const hostelVal = document.getElementById('hostelSelect').value;
    if (!hostelVal) { alert("Please select a hostel."); return; }
    student.hostel = hostelVal;

    if (hostelVal === 'Yamuna') {
        student.roomNo = document.getElementById('roomSelect').value;
    } else {
        student.roomNo = document.getElementById('roomInput').value;
    }

    if (!student.roomNo || student.roomNo === "") {
        alert("Please select or enter a valid room number."); return;
    }

    student.canEditProfile = false; // Lock profile
    appState.studentActiveTab = 'dashboard';
    alert("Profile saved successfully. Edits are now locked.");
    render();
}

window.updatePref = function (prefKey, val, isWarden = false) {
    if (isWarden) {
        db.students[appState.selectedStudent].nextWeekMeals[prefKey] = val;
    } else {
        db.students[0].nextWeekMeals[prefKey] = val;
    }
    render();
}

window.updateIceCream = function (val, isWarden = false) {
    if (isWarden) {
        db.students[appState.selectedStudent].nextWeekMeals.thuIceCream = val;
    } else {
        db.students[0].nextWeekMeals.thuIceCream = val;
    }
    render();
}

// ============================
// WARDEN VIEWS
// ============================
let html5QrCode = null;

function renderWardenDashboard() {
    let mainContentHtml = '';

    if (appState.wardenActiveTab === 'dashboard') {
        let trs = db.students.map((st, idx) => `
            <tr class="student-row" data-roll="${st.rollNo.toLowerCase()}" data-name="${st.name.toLowerCase()}" style="cursor: pointer;" onclick="viewStudent(${idx})">
                <td><strong>${st.rollNo}</strong></td>
                <td>${st.name}</td>
                <td>${st.roomNo}</td>
                <td><span class="badge ${st.attendance.today === 'Present' ? 'badge-success' : 'badge-danger'}">${st.attendance.today}</span></td>
                <td>
                    <span class="status-indicator ${st.meals.breakfast === 'booked' ? 'status-booked' : 'status-canceled'}">B</span>
                    <span class="status-indicator ${st.meals.lunch === 'booked' ? 'status-booked' : 'status-canceled'}">L</span>
                    <span class="status-indicator ${st.meals.snack === 'booked' ? 'status-booked' : 'status-canceled'}">S</span>
                    <span class="status-indicator ${st.meals.dinner === 'booked' ? 'status-booked' : 'status-canceled'}">D</span>
                </td>
                <td><span class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;">Manage <i class="ph ph-arrow-right"></i></span></td>
            </tr>
        `).join('');

        mainContentHtml = `
            <div class="page-header animate-fade-in delay-1">
                <div>
                    <h2>Staff Dashboard</h2>
                    <p>Manage hostel students, track attendance, and oversee meal preparation.</p>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-primary" id="scanQrBtn"><i class="ph-bold ph-qr-code"></i> Hall Scanner</button>
                    <button class="btn btn-outline" id="logoutBtn" style="border-color: var(--danger-color); color: var(--danger-color)"><i class="ph ph-sign-out"></i> Logout</button>
                </div>
            </div>

            <div class="stats-grid animate-fade-in delay-2">
                <div class="glass-panel stat-card">
                    <div class="stat-info"><h3>Total Students</h3><div class="value">${db.students.length}</div></div>
                    <div class="stat-icon"><i class="ph-fill ph-users"></i></div>
                </div>
                <div class="glass-panel stat-card">
                    <div class="stat-info"><h3>Present Today</h3><div class="value" style="color: var(--success-color)">${db.students.filter(s => s.attendance.today === 'Present').length}</div></div>
                    <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--success-color);"><i class="ph-fill ph-check-circle"></i></div>
                </div>
            </div>

            <div class="glass-panel animate-fade-in delay-3" style="margin-top: 30px; overflow: hidden;">
                <div style="padding: 24px; border-bottom: 1px solid var(--surface-border); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="font-size: 1.2rem;">Resident Students</h3>
                    <div class="input-field" style="width: 250px; padding: 8px 12px; display: flex; align-items: center; gap: 8px;">
                        <i class="ph ph-magnifying-glass"></i>
                        <input type="text" id="studentSearchInput" placeholder="Search Filter..." style="background: transparent; border: none; color: white; outline: none; width: 100%;">
                    </div>
                </div>
                <div style="overflow-x: auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Room</th>
                                <th>Daily Attendance</th>
                                <th>Today (B/L/S/D)</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="studentTableBody">${trs}</tbody>
                    </table>
                </div>
            </div>
        `;
    } else if (appState.wardenActiveTab === 'reports') {
        // Kitchen Staff Prep Report Fake Data
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let prepRows = days.map(d => {
            let lunchStr = '110';
            let dinnerStr = '105';

            if (d === 'Sunday') {
                lunchStr = '110 <br><small style="color:var(--text-muted);">(55 V / 55 NV)</small>';
            }
            if (d === 'Tuesday' || d === 'Thursday') {
                dinnerStr = '105 <br><small style="color:var(--text-muted);">(40 V / 65 NV)</small>';
                if (d === 'Thursday') {
                    dinnerStr += '<br><small style="color:var(--primary-color)">+ 85 Ice Creams 🍦</small>';
                }
            }

            return `
            <tr>
                <td style="font-weight: bold;">${d}</td>
                <td style="text-align:center;">120</td>
                <td style="text-align:center;">${lunchStr}</td>
                <td style="text-align:center;">115</td>
                <td style="text-align:center;">${dinnerStr}</td>
            </tr>
            `;
        }).join('');

        mainContentHtml = `
            <div class="page-header animate-fade-in delay-1">
                <div>
                    <h2>Kitchen Prep Report</h2>
                    <p>Daily meal requirements and cooking estimates.</p>
                </div>
                <button class="btn btn-outline" id="logoutBtn" style="border-color: var(--danger-color); color: var(--danger-color)"><i class="ph ph-sign-out"></i> Logout</button>
            </div>
            
            <div class="glass-panel animate-fade-in delay-2" style="padding: 24px; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="font-size: 1.2rem;">Weekly Estimate Data</h3>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span style="font-size: 0.85rem; color: var(--text-secondary);">Select Time Limit</span>
                        <input type="text" class="input-field" id="kitchenWeekSelect" placeholder="Select Dates..." style="width: 220px; padding: 6px 12px; font-size: 0.85rem;">
                        <button class="btn btn-primary" onclick="downloadKitchenPDF()" style="font-size: 0.85rem; padding: 6px 12px;"><i class="ph ph-file-pdf"></i> Download PDF</button>
                    </div>
                </div>
                
                <div style="overflow-x: auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th style="text-align:center;">Breakfast</th>
                                <th style="text-align:center;">Lunch <br><small>(Veg / Non-Veg)</small></th>
                                <th style="text-align:center;">Snacks</th>
                                <th style="text-align:center;">Dinner <br><small>(Veg / Non-Veg)</small></th>
                            </tr>
                        </thead>
                        <tbody>${prepRows}</tbody>
                    </table>
                </div>
            </div>
        `;

        if (window.flatpickr) {
            setTimeout(() => {
                flatpickr("#kitchenWeekSelect", {
                    mode: "range",
                    dateFormat: "Y-m-d",
                    theme: "dark"
                });
            }, 0);
        }

    } else if (appState.wardenActiveTab === 'scanner') {
        mainContentHtml = `
            <div class="page-header animate-fade-in delay-1">
                <div>
                    <h2>Mess Hall QR Scanner</h2>
                    <p>Verify students at the counter to prevent duplicate meals.</p>
                </div>
                <button class="btn btn-outline" id="logoutBtn" style="border-color: var(--danger-color); color: var(--danger-color)"><i class="ph ph-sign-out"></i> Logout</button>
            </div>

            <div class="glass-panel animate-fade-in delay-2" style="padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <h3 style="margin-bottom: 20px;">Scan Student QR Code</h3>
                <div id="reader" style="width: 400px; max-width: 100%; border-radius: 12px; overflow: hidden; border: 2px solid var(--primary-color); background: #000;"></div>
                <div id="scanResult" style="margin-top: 24px; min-height: 50px; text-align: center; font-size: 1.1rem; max-width: 500px;">
                    <p style="color: var(--text-muted);">Awaiting scan... Place QR Code in front of the camera.</p>
                </div>
            </div>
        `;
    } else if (appState.wardenActiveTab === 'billing') {
        const totalStudents = db.students.length;
        const totalDeposit = totalStudents * 118000;
        const totalDeducted = totalStudents * 48500;
        const totalRemaining = totalDeposit - totalDeducted;

        mainContentHtml = `
            <div class="page-header animate-fade-in delay-1">
                <div>
                    <h2>Hostel Billing Overview</h2>
                    <p>Manage the ₹1,18,000 annual deposit pool and track monthly food/stay deductions.</p>
                </div>
                <button class="btn btn-outline" id="logoutBtn" style="border-color: var(--danger-color); color: var(--danger-color)"><i class="ph ph-sign-out"></i> Logout</button>
            </div>

            <div class="stats-grid animate-fade-in delay-2">
                <div class="glass-panel stat-card">
                    <div class="stat-info"><h3>Total Pool Deposit</h3><div class="value" style="color: var(--primary-color)">₹ ${(totalDeposit / 100000).toFixed(2)} Lakhs</div></div>
                    <div class="stat-icon" style="background: rgba(88, 166, 255, 0.1); color: var(--primary-color);"><i class="ph-fill ph-bank"></i></div>
                </div>
                <div class="glass-panel stat-card">
                    <div class="stat-info"><h3>Total Pool Deductions</h3><div class="value" style="color: var(--warning-color)">₹ ${(totalDeducted / 100000).toFixed(2)} Lakhs</div></div>
                    <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: var(--warning-color);"><i class="ph-fill ph-chart-line-down"></i></div>
                </div>
                <div class="glass-panel stat-card">
                    <div class="stat-info"><h3>Remaining Balance</h3><div class="value" style="color: var(--success-color)">₹ ${(totalRemaining / 100000).toFixed(2)} Lakhs</div></div>
                    <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--success-color);"><i class="ph-fill ph-wallet"></i></div>
                </div>
            </div>
            
            <div class="glass-panel animate-fade-in delay-3" style="text-align: center; padding: 40px; margin-top: 20px;">
                <i class="ph-fill ph-file-pdf" style="font-size: 4rem; color: var(--text-muted)"></i>
                <h3 style="margin: 10px 0;">Generate Auditing Report</h3>
                <p style="color: var(--text-muted); margin-bottom: 20px;">Export the complete transaction ledger for all students into an Excel Sheet.</p>
                <button class="btn btn-primary" onclick="downloadMasterLedgerPDF()"><i class="ph-bold ph-download-simple"></i> Download Master Ledger</button>
            </div>

            <div class="glass-panel animate-fade-in delay-4" style="margin-top: 30px; overflow: hidden;">
                <div style="padding: 24px; border-bottom: 1px solid var(--surface-border);">
                    <h3 style="font-size: 1.2rem;">Student Billing Status</h3>
                </div>
                <div style="overflow-x: auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Initial Deposit</th>
                                <th>Expenses Deducted</th>
                                <th>Net Refund Balance</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${db.students.map((s, idx) => {
            // Add some randomness for realism
            const rndDeduct = 45000 + Math.floor(Math.random() * 5000);
            const remBal = 118000 - rndDeduct;
            return `
                                <tr>
                                    <td><strong>${s.rollNo}</strong></td>
                                    <td>${s.name}</td>
                                    <td>₹ 1,18,000</td>
                                    <td style="color: var(--warning-color)">- ₹ ${rndDeduct.toLocaleString()}</td>
                                    <td style="color: var(--success-color)">₹ ${remBal.toLocaleString()}</td>
                                    <td>
                                        <button class="btn btn-outline" onclick="downloadStudentBudgetPDF('${idx}', ${rndDeduct})" style="padding: 4px 8px; font-size: 0.75rem;"><i class="ph-bold ph-download-simple"></i> Expense Ledger</button>
                                    </td>
                                </tr>
                                `
        }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } else if (appState.wardenActiveTab === 'users') {
        const hostels = ['Yamuna', 'Kurinji', 'Marutham', 'Megala'];
        const trs = db.students.map((st, idx) => `
            <tr>
                <td><input type="checkbox" class="student-checkbox" value="${idx}"></td>
                <td><strong>${st.rollNo}</strong></td>
                <td>${st.name}</td>
                <td>${st.course} - ${st.department}</td>
                <td>${st.hostel} / ${st.roomNo}</td>
                <td style="display: flex; gap: 8px;">
                    <button class="btn btn-outline" style="border-color: var(--primary-color); color: var(--primary-color); padding: 4px 8px; font-size: 0.75rem;" onclick="editStudent(${idx})"><i class="ph-bold ph-pencil-simple"></i> Edit</button>
                    <button class="btn btn-outline" style="border-color: var(--danger-color); color: var(--danger-color); padding: 4px 8px; font-size: 0.75rem;" onclick="removeStudent(${idx})"><i class="ph-bold ph-trash"></i> Remove</button>
                </td>
            </tr>
        `).join('');

        mainContentHtml = `
            <div class="page-header animate-fade-in delay-1">
                <div>
                    <h2>Student Management</h2>
                    <p>Onboard new students individually or in bulk, and manage existing records.</p>
                </div>
                <button class="btn btn-outline" id="logoutBtn" style="border-color: var(--danger-color); color: var(--danger-color)"><i class="ph ph-sign-out"></i> Logout</button>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 20px;" class="animate-fade-in delay-2">
                <!-- Single Onboarding -->
                <div class="glass-panel" style="padding: 24px;">
                    <h3 style="margin-bottom: 16px; border-bottom: 1px solid var(--surface-border); padding-bottom: 8px;"><i class="ph-fill ph-user-plus"></i> Single Student Onboard</h3>
                    <form id="singleAddForm" style="display: flex; flex-direction: column; gap: 12px;" onsubmit="handleSingleAdd(event)">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div class="form-group"><label>Roll Number</label><input type="text" id="addRoll" class="input-field" required></div>
                            <div class="form-group"><label>Full Name</label><input type="text" id="addName" class="input-field" placeholder="e.g. Priya (Girls only for Yamuna 3rd Fl)" required></div>
                            <div class="form-group"><label>Course</label><input type="text" id="addCourse" class="input-field" required></div>
                            <div class="form-group"><label>Department</label><input type="text" id="addDept" class="input-field" required></div>
                            <div class="form-group">
                                <label>Hostel</label>
                                <select id="addHostel" class="input-field" onchange="updateAddRoomOptions()" required>
                                    <option value="">Select Hostel</option>
                                    ${hostels.map(h => `<option value="${h}">${h}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group" id="addRoomGroup">
                                <label>Room No</label>
                                <select id="addRoomSelect" class="input-field" style="display:none;"></select>
                                <input type="text" id="addRoomInput" class="input-field" placeholder="Enter Room No" required>
                            </div>
                        </div>
                        <p style="font-size: 0.8rem; color: var(--text-muted);"><i class="ph-fill ph-info"></i> Default password will be set to the student's Roll Number.</p>
                        <button type="submit" class="btn btn-primary" style="margin-top: 8px;"><i class="ph-bold ph-plus"></i> Add Student</button>
                    </form>
                </div>

                <!-- Bulk Onboarding -->
                <div class="glass-panel" style="padding: 24px;">
                    <h3 style="margin-bottom: 16px; border-bottom: 1px solid var(--surface-border); padding-bottom: 8px;"><i class="ph-fill ph-users"></i> Bulk Excel/CSV Onboard</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">Upload a CSV file with columns: <strong>RollNo, Name, Course, Department, Hostel, RoomNo</strong>.</p>
                    <div style="border: 2px dashed var(--surface-border); padding: 32px; text-align: center; border-radius: 8px; margin-bottom: 16px;">
                        <i class="ph-fill ph-file-csv" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 8px;"></i><br>
                        <input type="file" id="bulkUploadFile" accept=".csv" style="display: none;" onchange="handleBulkAdd()">
                        <button class="btn btn-outline" onclick="document.getElementById('bulkUploadFile').click()"><i class="ph-bold ph-upload-simple"></i> Select CSV File</button>
                    </div>
                </div>
            </div>

            <!-- Student List -->
            <div class="glass-panel animate-fade-in delay-3" style="margin-top: 30px; overflow: hidden;">
                <div style="padding: 24px; border-bottom: 1px solid var(--surface-border); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="font-size: 1.2rem;">All Platform Students</h3>
                    <button class="btn btn-outline" style="border-color: var(--danger-color); color: var(--danger-color);" onclick="bulkRemoveStudents()"><i class="ph-bold ph-trash"></i> Bulk Remove Selected</button>
                </div>
                <div style="overflow-x: auto; max-height: 400px;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th><input type="checkbox" id="selectAllCheckbox" onchange="toggleAllCheckboxes(this)"></th>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Course Details</th>
                                <th>Accommodation</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>${trs}</tbody>
                    </table>
                </div>
            </div>
        `;
    } else if (appState.wardenActiveTab === 'settings') {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        mainContentHtml = `
            <div class="page-header animate-fade-in delay-1">
                <div>
                    <h2>System Settings</h2>
                    <p>Configure booking window protocols and global parameters.</p>
                </div>
                <button class="btn btn-outline" id="logoutBtn" style="border-color: var(--danger-color); color: var(--danger-color)"><i class="ph ph-sign-out"></i> Logout</button>
            </div>
            
            <div class="glass-panel animate-fade-in delay-2" style="padding: 24px; max-width: 600px; margin-top: 20px;">
                <h3 style="margin-bottom: 20px; border-bottom: 1px solid var(--surface-border); padding-bottom: 12px;"><i class="ph-fill ph-calendar-plus"></i> Booking Time Protocol</h3>
                <form id="bookingSettingsForm" onsubmit="window.saveBookingSettings(event)" style="display: flex; flex-direction: column; gap: 16px;">
                    <div class="form-group">
                        <label>Booking Day</label>
                        <select id="setBookingDay" class="input-field">
                            ${days.map((d, i) => `<option value="${i}" ${db.bookingSettings.dayOfWeek == i ? 'selected' : ''}>${d}</option>`).join('')}
                        </select>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="form-group">
                            <label>Start Time (Hour 0-23)</label>
                            <input type="number" id="setStartHour" class="input-field" min="0" max="23" value="${db.bookingSettings.startHour}" required>
                        </div>
                        <div class="form-group">
                            <label>End Time (Hour 0-23)</label>
                            <input type="number" id="setEndHour" class="input-field" min="0" max="24" value="${db.bookingSettings.endHour}" required>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary" style="align-self: flex-start; margin-top: 10px;"><i class="ph-bold ph-floppy-disk"></i> Update Protocol</button>
                </form>
            </div>
        `;
    }

    return `
        <div class="dashboard-layout animate-fade-in">
            <aside class="sidebar">
                <div class="sidebar-brand"><i class="ph-fill ph-fork-knife" style="color: var(--warning-color)"></i><span>SmartMess Admin</span></div>
                <ul class="nav-menu">
                    <li id="navWardenDashboard" class="nav-item ${appState.wardenActiveTab === 'dashboard' ? 'active' : ''}"><i class="ph ph-squares-four"></i> Warden Dashboard</li>
                    <li id="navWardenUsers" class="nav-item ${appState.wardenActiveTab === 'users' ? 'active' : ''}"><i class="ph ph-users"></i> Student Management</li>
                    <li id="navWardenReports" class="nav-item ${appState.wardenActiveTab === 'reports' ? 'active' : ''}"><i class="ph ph-cooking-pot"></i> Kitchen Prep Reports</li>
                    <li id="navWardenScanner" class="nav-item ${appState.wardenActiveTab === 'scanner' ? 'active' : ''}"><i class="ph ph-qr-code"></i> Live Scanner</li>
                    <li id="navWardenBilling" class="nav-item ${appState.wardenActiveTab === 'billing' ? 'active' : ''}"><i class="ph ph-money"></i> Billing Overview</li>
                    <li id="navWardenSettings" class="nav-item ${appState.wardenActiveTab === 'settings' ? 'active' : ''}"><i class="ph ph-gear"></i> System Settings</li>
                </ul>
                <div class="user-profile-sm">
                    <div class="avatar" style="background: var(--warning-gradient)">${db.warden.name.charAt(0)}</div>
                    <div class="user-info-sm"><h4>${db.warden.name}</h4><p>Chief Warden</p></div>
                </div>
            </aside>
            
            <main class="main-content">
                ${mainContentHtml}
            </main>
        </div>
        ${appState.editingStudentIndex !== null ? `
            <div class="modal-overlay" style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; overflow: auto;">
                <div class="glass-panel animate-fade-in" style="padding: 24px; width: 100%; max-width: 500px;">
                    <h3 style="margin-bottom: 16px; border-bottom: 1px solid var(--surface-border); padding-bottom: 8px;">Edit Student Details</h3>
                    <form onsubmit="saveEditedStudent(event, ${appState.editingStudentIndex})" style="display: flex; flex-direction: column; gap: 12px;">
                        <div class="form-group"><label>Name</label><input type="text" id="editStuName" class="input-field" value="${db.students[appState.editingStudentIndex].name}" required></div>
                        <div class="form-group"><label>Course</label><input type="text" id="editStuCourse" class="input-field" value="${db.students[appState.editingStudentIndex].course}" required></div>
                        <div class="form-group"><label>Department</label><input type="text" id="editStuDept" class="input-field" value="${db.students[appState.editingStudentIndex].department}" required></div>
                        <div class="form-group"><label>Hostel</label><input type="text" id="editStuHostel" class="input-field" value="${db.students[appState.editingStudentIndex].hostel}" required></div>
                        <div class="form-group"><label>Room No</label><input type="text" id="editStuRoom" class="input-field" value="${db.students[appState.editingStudentIndex].roomNo}" required></div>
                        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px;">
                            <button type="button" class="btn btn-outline" onclick="cancelEditStudent()">Cancel</button>
                            <button type="submit" class="btn btn-primary"><i class="ph ph-floppy-disk"></i> Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        ` : ''}
    `;
}

window.editStudent = function (idx) {
    appState.editingStudentIndex = idx;
    render();
};

window.cancelEditStudent = function () {
    appState.editingStudentIndex = null;
    render();
};

window.saveEditedStudent = function (e, idx) {
    e.preventDefault();
    const st = db.students[idx];
    st.name = document.getElementById('editStuName').value.toUpperCase();
    st.course = document.getElementById('editStuCourse').value;
    st.department = document.getElementById('editStuDept').value;
    st.hostel = document.getElementById('editStuHostel').value;
    st.roomNo = document.getElementById('editStuRoom').value;
    appState.editingStudentIndex = null;
    alert("Student details updated successfully!");
    render();
};

window.handleSingleAdd = function (e) {
    if (e) e.preventDefault();
    const rollNo = document.getElementById('addRoll').value;
    const name = document.getElementById('addName').value;
    const course = document.getElementById('addCourse').value;
    const dept = document.getElementById('addDept').value;
    const hostel = document.getElementById('addHostel').value;

    let roomNo = "";
    if (hostel === 'Yamuna') {
        roomNo = document.getElementById('addRoomSelect').value;
    } else {
        roomNo = document.getElementById('addRoomInput').value;
    }

    if (!roomNo || roomNo.trim() === "") {
        alert("Please enter or select a valid Room No.");
        return;
    }

    db.students.unshift({
        rollNo: rollNo.toUpperCase(),
        name: name.toUpperCase(),
        course: course,
        department: dept,
        hostel: hostel,
        roomNo: roomNo,
        tutorName: 'Not Assigned',
        hodName: 'Not Assigned',
        parentName: 'Not Assigned',
        contactNumber: '',
        meals: { breakfast: 'canceled', lunch: 'canceled', snack: 'canceled', dinner: 'canceled' },
        attendance: { today: 'Absent', last30Days: '0%' },
        nextWeekMeals: getDefaultWeeklyMeals(false),
        barcode: Math.floor(100000000000 + Math.random() * 899999999999).toString(),
        scannedMeals: [],
        pastBookings: [],
        canEditProfile: true, // They will need to edit profile
        password: rollNo.toUpperCase(), // Default password
        isFirstLogin: true
    });

    alert("Student added successfully! The default password is their Roll Number.");
    render();
}

window.handleBulkAdd = function () {
    const fileInput = document.getElementById('bulkUploadFile');
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const lines = text.split('\\n');
        let addedCount = 0;

        // Start from index 1 to skip header row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = line.split(',');
            if (cols.length >= 6) {
                const rollNo = cols[0].trim().toUpperCase();
                const name = cols[1].trim().toUpperCase();
                // prevent duplicates
                if (!db.students.find(s => s.rollNo === rollNo)) {
                    db.students.unshift({
                        rollNo: rollNo,
                        name: name,
                        course: cols[2].trim(),
                        department: cols[3].trim(),
                        hostel: cols[4].trim(),
                        roomNo: cols[5].trim(),
                        tutorName: 'Not Assigned',
                        hodName: 'Not Assigned',
                        parentName: 'Not Assigned',
                        contactNumber: '',
                        meals: { breakfast: 'canceled', lunch: 'canceled', snack: 'canceled', dinner: 'canceled' },
                        attendance: { today: 'Absent', last30Days: '0%' },
                        nextWeekMeals: getDefaultWeeklyMeals(false),
                        barcode: Math.floor(100000000000 + Math.random() * 899999999999).toString(),
                        scannedMeals: [],
                        pastBookings: [],
                        canEditProfile: true,
                        password: rollNo,
                        isFirstLogin: true
                    });
                    addedCount++;
                }
            }
        }
        alert("Successfully onboarded " + addedCount + " new students from CSV.");
        render();
    };
    reader.readAsText(file);
}

window.removeStudent = function (idx) {
    if (confirm("Are you sure you want to completely remove this student from the platform? This cannot be undone.")) {
        db.students.splice(idx, 1);
        render();
    }
}

window.filterStudentList = function (query) {
    query = query.toLowerCase();
    const rows = document.querySelectorAll('.student-row');
    rows.forEach(row => {
        const roll = row.getAttribute('data-roll');
        const name = row.getAttribute('data-name');
        if (roll.includes(query) || name.includes(query)) {
            row.style.display = 'table-row';
        } else {
            row.style.display = 'none';
        }
    });
}

window.toggleAllCheckboxes = function (source) {
    const checkboxes = document.querySelectorAll('.student-checkbox');
    checkboxes.forEach(cb => cb.checked = source.checked);
}

window.bulkRemoveStudents = function () {
    const checkboxes = document.querySelectorAll('.student-checkbox:checked');
    if (checkboxes.length === 0) {
        alert("Please select at least one student to remove.");
        return;
    }

    if (confirm(`Are you sure you want to permanently remove ${checkboxes.length} selected student(s) ? `)) {
        // Collect indices to remove, sorted descending so splicing doesn't mess up indices
        const indicesToRemove = Array.from(checkboxes).map(cb => parseInt(cb.value)).sort((a, b) => b - a);
        indicesToRemove.forEach(idx => {
            db.students.splice(idx, 1);
        });
        alert(`Successfully removed ${checkboxes.length} student(s).`);
        render();
    }
}

window.updateAddRoomOptions = function () {
    const hostel = document.getElementById('addHostel').value;
    const roomSelect = document.getElementById('addRoomSelect');
    const roomInput = document.getElementById('addRoomInput');

    if (hostel === 'Yamuna') {
        roomSelect.style.display = 'block';
        roomSelect.required = true;
        roomInput.style.display = 'none';
        roomInput.required = false;

        let options = '<option value="">Select Room</option>';
        for (let i = 1; i <= 24; i++) options += `< option value = "YA-${i}" > YA - ${i} (Ground)</option > `;
        for (let i = 101; i <= 124; i++) options += `< option value = "YA-${i}" > YA - ${i} (1st Fl)</option > `;
        for (let i = 201; i <= 224; i++) options += `< option value = "YA-${i}" > YA - ${i} (2nd Fl)</option > `;
        for (let i = 301; i <= 324; i++) options += `< option value = "YA-${i}" > YA - ${i} (3rd Fl)</option > `;

        roomSelect.innerHTML = options;
    } else {
        roomSelect.style.display = 'none';
        roomSelect.required = false;
        roomInput.style.display = 'block';
        roomInput.required = true;
    }
}

// Scanner Logic completely rewritten to use Html5Qrcode instead of prompt
window.startScanner = function () {
    if (html5QrCode) return; // already started
    const readerElement = document.getElementById("reader");
    if (!readerElement || !window.Html5Qrcode) return;

    html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText, decodedResult) => {
            handleRealQRScan(decodedText);
            // temporarily stop to prevent duplicate scans
            html5QrCode.pause();
            setTimeout(() => { if (html5QrCode) html5QrCode.resume(); }, 3000);
        },
        (errorMessage) => { }
    ).catch(err => {
        console.error("Scanner failed to start", err);
        document.getElementById("scanResult").innerHTML = '<p style="color:var(--danger-color);">Camera access denied or device issue. Please check permissions.</p>';
    });
}

window.stopScanner = async function () {
    if (html5QrCode) {
        try {
            await html5QrCode.stop();
            html5QrCode.clear();
        } catch (err) {
            console.log("Failed to stop", err);
        }
        html5QrCode = null;
    }
}

window.handleWardenTabChange = async function (tab) {
    if (appState.wardenActiveTab === 'scanner') {
        await window.stopScanner();
    }
    appState.wardenActiveTab = tab;

    // Stop scanner if somehow we change away from scanner view
    if (appState.view !== 'warden-dashboard' && appState.wardenActiveTab === 'scanner') {
        await window.stopScanner();
    }
    render();
}

function handleRealQRScan(code) {
    const resDiv = document.getElementById('scanResult');
    const student = db.students.find(s => s.barcode === code);

    if (!student) {
        resDiv.innerHTML = `< div style = "background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger-color); padding: 16px; border-radius: 8px;" >
        <p style="color: var(--danger-color);"><i class="ph-fill ph-x-circle"></i> Invalid QR Code. Student not found in system.</p>
        </div > `;
        return;
    }

    // Attempting entry for current meal (simplification: assume current meal based on time, using 'lunch' here for demo)
    const currentMeal = "lunch";

    if (student.meals[currentMeal] !== 'booked') {
        resDiv.innerHTML = `< div style = "background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger-color); padding: 16px; border-radius: 8px;" >
            <p style="color: var(--danger-color);"><i class="ph-fill ph-x-circle"></i> Denied Entry!</p>
            <p style="color: white; margin-top: 4px;"><strong>${student.name} (${student.rollNo})</strong> did NOT book ${currentMeal} for today.</p>
        </div > `;
        return;
    }

    if (student.scannedMeals.includes(currentMeal)) {
        resDiv.innerHTML = `< div style = "background: rgba(245, 158, 11, 0.1); border: 1px solid var(--warning-color); padding: 16px; border-radius: 8px;" >
            <p style="color: var(--warning-color);"><i class="ph-fill ph-warning-circle"></i> Duplicate Scan Prevented!</p>
            <p style="color: white; margin-top: 4px;"><strong>${student.name} (${student.rollNo})</strong> has already entered the mess hall for ${currentMeal}.</p>
        </div > `;
        return;
    }

    // Mark as scanned and mark attendance
    student.scannedMeals.push(currentMeal);
    student.attendance.today = 'Present';

    resDiv.innerHTML = `< div style = "background: rgba(16, 185, 129, 0.1); border: 1px solid var(--success-color); padding: 16px; border-radius: 8px;" >
        <p style="color: var(--success-color);"><i class="ph-fill ph-check-circle"></i> Access Granted!</p>
        <p style="color: white; margin-top: 4px;"><strong>${student.name} (${student.rollNo})</strong> marked present for ${currentMeal}.</p>
        <p style="color: var(--success-color); font-size: 0.85rem; margin-top: 8px;"><i class="ph-bold ph-check"></i> Daily Attendance auto-marked as Present.</p>
    </div > `;
}

function renderWardenStudentDetail() {
    const st = db.students[appState.selectedStudent];

    return `
        < div class= "dashboard-layout animate-fade-in" >
            <aside class="sidebar">
                <div class="sidebar-brand"><i class="ph-fill ph-fork-knife" style="color: var(--warning-color)"></i><span>SmartMess Admin</span></div>
                <ul class="nav-menu">
                    <li class="nav-item active"><i class="ph ph-users"></i> Back to Students</li>
                </ul>
                <div class="user-profile-sm"><div class="avatar" style="background: var(--warning-gradient)">W</div><div class="user-info-sm"><h4>Warden</h4></div></div>
            </aside>
            <main class="main-content">
                <div class="page-header animate-fade-in delay-1">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <button class="btn btn-outline" id="backBtn"><i class="ph ph-arrow-left"></i> Back</button>
                        <div>
                            <h2>${st.name} <span style="font-size: 1rem; color: var(--text-secondary); font-weight: normal; margin-left: 8px; border: 1px solid var(--surface-border); padding: 2px 8px; border-radius: 4px;">${st.rollNo}</span></h2>
                            <p>Room: ${st.roomNo} | Dept: ${st.department}</p>
                        </div>
                    </div>
                    <button class="btn btn-outline" id="logoutBtn" style="border-color: var(--danger-color); color: var(--danger-color)"><i class="ph ph-sign-out"></i> Logout</button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 24px;">
                    <!-- Details & Attendance -->
                    <div class="glass-panel animate-fade-in delay-2" style="padding: 24px;">
                        <h3 style="margin-bottom: 20px; border-bottom: 1px solid var(--surface-border); padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                            <i class="ph-fill ph-user-focus"></i> Profile Status
                        </h3>
                        
                        <div style="margin-bottom: 20px; text-align: center; background: white; padding: 10px; border-radius: 8px; border: 2px solid var(--primary-color);">
                            <label style="font-size: 0.85rem; color: #000; text-transform: uppercase; margin-bottom: 8px; display: block;">Mess QR Code</label>
                            <div style="margin: 0 auto; display: inline-block;" id="wardenQrCodeContainer"></div>
                            <p style="text-align: center; color: #000; font-family: monospace; font-size: 1rem; margin-top: 4px; font-weight: bold;">${st.barcode}</p>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="color: var(--text-secondary); font-size: 0.85rem; display: block; margin-bottom: 8px;">Mark Daily Attendance</label>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn ${st.attendance.today === 'Present' ? 'btn-success' : 'btn-outline'}" style="flex: 1;" onclick="updateAttendance('Present')">Present</button>
                                <button class="btn ${st.attendance.today === 'Absent' ? 'btn-danger' : 'btn-outline'}" style="flex: 1;" onclick="updateAttendance('Absent')">Absent</button>
                            </div>
                        </div>

                        <div style="margin-bottom: 20px; padding-top: 20px; border-top: 1px solid var(--surface-border);">
                            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; border: 1px solid var(--surface-border);">
                                <div>
                                    <label style="font-size: 1rem; color: white; display: block; margin-bottom: 4px;">Student Profile Edit Access</label>
                                    <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">Enable to allow the student to update their details once.</p>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 0.9rem; color: ${st.canEditProfile ? 'var(--success-color)' : 'var(--text-muted)'}; font-weight: 500;">
                                        ${st.canEditProfile ? 'Unlocked' : 'Locked'}
                                    </span>
                                    <label class="toggle-switch">
                                        <input type="checkbox" ${st.canEditProfile ? 'checked' : ''} onchange="toggleEditAccess(this.checked)">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Next Week Meal Booking Override -->
                    <div class="glass-panel animate-fade-in delay-3" style="padding: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 1px solid var(--surface-border); padding-bottom: 16px;">
                            <div>
                                <h3 style="display: flex; align-items: center; gap: 8px; color: var(--primary-color);">
                                    <i class="ph-fill ph-calendar-plus"></i> Staff Override Hub
                                </h3>
                                <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 4px;">Warden limits are disabled. You can forcefully manage books any day.</p>
                            </div>
                        </div>

                        ${renderWardenMatrix()}
                        <div style="margin-top: 24px; padding: 14px; background: rgba(88, 166, 255, 0.1); border-radius: var(--radius-md); font-size: 0.9rem; color: var(--primary-color); display: flex; gap: 10px; align-items: flex-start;">
                            <i class="ph-fill ph-info" style="font-size: 1.2rem; flex-shrink: 0; margin-top: 2px;"></i> 
                            <div>Updating preferences directly alters the system ledger. The student's dashboard will show these adjusted values permanently.</div>
                        </div>
                    </div>
                </div>

                <!-- Past Bookings Calendar for Warden -->
                <div class="glass-panel animate-fade-in delay-4" style="margin-top: 24px; padding: 24px;">
                    <h3 style="margin-bottom: 20px; border-bottom: 1px solid var(--surface-border); padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <i class="ph-fill ph-calendar-check"></i> Most Recent Past Booking Calendar
                    </h3>
                    ${st.pastBookings && st.pastBookings.length > 0 ? renderPastWeeklyDetails(st.pastBookings[0].details) : '<p style="color: var(--text-muted);">No past bookings found for this student.</p>'}
                </div>
            </main>
        </div >
        `;
}

function renderWardenMatrix() {
    const st = db.students[appState.selectedStudent];
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayNames = { sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday" };

    let tableRows = days.map(day => {
        const rowMeals = st.nextWeekMeals[day];

        let lunchTd = `
        < div style = "display: flex; justify-content: center;" >
            ${mkToggle(day, 'lunch', rowMeals.lunch, false, true)
            }
            </div > `;
        let dinnerTd = `
        < div style = "display: flex; justify-content: center;" >
            ${mkToggle(day, 'dinner', rowMeals.dinner, false, true)}
            </div > `;

        if (day === 'sun') {
            lunchTd = mkPrefToggle('sun', 'lunch', rowMeals.lunch, 'sunLunchPref', st.nextWeekMeals.sunLunchPref, 'Veg', 'Non-Veg', false, true);
        } else if (day === 'tue') {
            dinnerTd = mkPrefToggle('tue', 'dinner', rowMeals.dinner, 'tueDinnerPref', st.nextWeekMeals.tueDinnerPref, 'Veg', 'Non-Veg', false, true);
        } else if (day === 'thu') {
            const iceFn = `updateIceCream(this.checked, true)`;
            const iceHtml = `
        < div style = "display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 0.70rem; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 6px; width: max-content; margin: 0 auto; line-height: 1;" >
                <span class="pref-label ${st.nextWeekMeals.thuIceCream ? 'active-nonveg' : ''}" style="${st.nextWeekMeals.thuIceCream ? 'color: var(--primary-color);' : ''}">Ice Cream 🍦</span>
                <label class="toggle-switch sm">
                    <input type="checkbox" ${st.nextWeekMeals.thuIceCream ? 'checked' : ''} onchange="${iceFn}">
                    <span class="toggle-slider pref-slider" style="background-color: ${st.nextWeekMeals.thuIceCream ? 'var(--primary-color)' : 'var(--surface-border)'}"></span>
                </label>
            </div >
        `;
            dinnerTd = mkPrefToggle('thu', 'dinner', rowMeals.dinner, 'thuDinnerPref', st.nextWeekMeals.thuDinnerPref, 'Veg', 'Non-Veg', false, true, iceHtml);
        }

        return `
        < tr style = "border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02);" >
                <td style="font-weight: 600; padding: 12px;">${dayNames[day]}</td>
                <td style="text-align: center; vertical-align: middle;">
                    <div style="display: flex; justify-content: center;">
                        ${mkToggle(day, 'breakfast', rowMeals.breakfast, false, true)}
                    </div>
                </td>
                <td style="text-align: center; vertical-align: middle;">${lunchTd}</td>
                <td style="text-align: center; vertical-align: middle;">
                    <div style="display: flex; justify-content: center;">
                        ${mkToggle(day, 'snack', rowMeals.snack, false, true)}
                    </div>
                </td>
                <td style="text-align: center; vertical-align: middle;">${dinnerTd}</td>
            </tr >
        `;
    }).join('');

    return `
        <div style = "overflow-x: auto; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px solid var(--surface-border);" >
            <table class="dagit push origin mainta-table" style="width: 100%; font-size: 0.9rem;">
                <thead>
                    <tr>
                        <th style="padding: 12px; text-align: left;">Day</th>
                        <th style="padding: 12px; text-align: center;">Breakfast</th>
                        <th style="padding: 12px; text-align: center;">Lunch</th>
                        <th style="padding: 12px; text-align: center;">Snacks</th>
                        <th style="padding: 12px; text-align: center;">Dinner</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
        </div>
        `;
}

window.wardenToggleNextWeekMeal = function (day, dbKey) {
    const st = db.students[appState.selectedStudent];
    if (st.nextWeekMeals[day][dbKey] === 'booked') {
        st.nextWeekMeals[day][dbKey] = 'canceled';
    } else {
        st.nextWeekMeals[day][dbKey] = 'booked';
    }
    render();
}

window.downloadKitchenPDF = function () {
    if (!window.jspdf) {
        alert("PDF library is missing. Please refresh or check your connection.");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("SmartMess - Kitchen Preparation Manifest", 14, 22);

    doc.setFontSize(11);
    const dateInput = document.getElementById('kitchenWeekSelect');
    let weekLabel = "Standard Run";
    if (dateInput && dateInput.value) {
        if (dateInput.value.includes(' to ')) {
            const parts = dateInput.value.split(' to ');
            const sdStr = new Date(parts[0]).toLocaleDateString('en-GB');
            const edStr = new Date(parts[1]).toLocaleDateString('en-GB');
            weekLabel = `Selected Limit: ${sdStr} to ${edStr} `;
        } else {
            const dStr = new Date(dateInput.value).toLocaleDateString('en-GB');
            weekLabel = `Specific Date: ${dStr} `;
        }
    }
    doc.text("Report for: " + weekLabel, 14, 32);

    doc.autoTable({
        startY: 40,
        head: [['Day', 'Breakfast', 'Lunch', 'Snacks', 'Dinner']],
        body: [
            ['Sunday', '120', '110 (55 V / 55 NV)', '115', '105'],
            ['Monday', '120', '110', '115', '105'],
            ['Tuesday', '120', '110', '115', '105 (40 V / 65 NV)'],
            ['Wednesday', '120', '110', '115', '105'],
            ['Thursday', '120', '110', '115', '105 (40 V / 65 NV) + 85 Ice Creams'],
            ['Friday', '120', '110', '115', '105'],
            ['Saturday', '120', '110', '115', '105']
        ],
        theme: 'grid',
        headStyles: { fillColor: [88, 166, 255] }
    });

    doc.save("Kitchen_Manifest_Report.pdf");
}

window.downloadStudentBudgetPDF = function (idx, targetTotal) {
    if (!window.jspdf) {
        alert("PDF library is missing. Please refresh or check your connection.");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const st = db.students[idx];

    doc.setFontSize(18);
    doc.text(`SmartMess - Expense Ledger Report`, 14, 22);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')} `, 14, 28);

    doc.setFontSize(14);
    doc.text(`${st.name} (${st.rollNo})`, 14, 38);

    doc.setFontSize(11);
    doc.text(`Academic Year: 2025 - 2026`, 14, 46);
    doc.text(`Initial Annual Deposit: Rs 1, 18,000`, 14, 52);

    const remainingBalance = 118000 - targetTotal;
    doc.text(`Total Expenses Deducted Till Date: Rs ${targetTotal.toLocaleString()} `, 14, 58);
    doc.text(`Net Refund Balance: Rs ${remainingBalance.toLocaleString()} `, 14, 64);

    const weeks = [];
    let cumulative = 0;
    let startDate = new Date(2025, 5, 2); // Start roughly from June 2nd, 2025 (Monday)

    // Simulate 15 weeks that sum up to the targetTotal exactly
    const numWeeks = 15;
    let remainingToDistribute = targetTotal;

    for (let w = 1; w <= numWeeks; w++) {
        let weeklyExp;
        if (w === numWeeks) {
            weeklyExp = remainingToDistribute; // Last week takes whatever is left
        } else {
            // Rough average for each week with slight variation
            let avg = remainingToDistribute / (numWeeks - w + 1);
            weeklyExp = Math.floor(avg * (0.9 + Math.random() * 0.2));
            remainingToDistribute -= weeklyExp;
        }

        cumulative += weeklyExp;

        let endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        let dateRangeStr = `${startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} to ${endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} `;

        weeks.push([`Week ${w} `, dateRangeStr, `Rs ${weeklyExp.toLocaleString()} `, `Rs ${cumulative.toLocaleString()} `]);

        startDate.setDate(startDate.getDate() + 7);
    }

    doc.autoTable({
        startY: 75,
        head: [['Billing Cycle', 'Date Range', 'Weekly Expenses', 'Total Deducted']],
        body: weeks,
        theme: 'grid',
        headStyles: { fillColor: [88, 166, 255] }
    });

    doc.save(`Ledger_${st.rollNo}.pdf`);
}

window.downloadMasterLedgerPDF = function () {
    if (!window.jspdf) {
        alert("PDF library is missing. Please refresh or check your connection.");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("SmartMess - Hostel Master Auditing Ledger", 14, 22);

    doc.setFontSize(11);
    doc.text(`Generated Date: ${new Date().toLocaleDateString('en-GB')} `, 14, 32);
    doc.text(`Hostel Wing: Yamuna(3rd Floor)`, 14, 38);

    const fullLedger = db.students.map(s => {
        // Must match the display logic randomness if we want consistent views, or recalculate.
        // We'll calculate a fresh but realistic variation for the master sheet.
        const rndDeduct = 45000 + Math.floor(Math.random() * 5000);
        const remBal = 118000 - rndDeduct;
        return [
            s.rollNo,
            s.name,
            s.roomNo,
            'Rs 1,18,000',
            `Rs ${rndDeduct.toLocaleString()} `,
            `Rs ${remBal.toLocaleString()} `
        ];
    });

    doc.autoTable({
        startY: 45,
        head: [['Roll No', 'Name', 'Room', 'Initial Deposit', 'Expenses Deducted', 'Net Balance']],
        body: fullLedger,
        theme: 'grid',
        headStyles: { fillColor: [88, 166, 255] }
    });

    doc.save("Hostel_Master_Ledger.pdf");
}

window.updateAttendance = function (status) {
    db.students[appState.selectedStudent].attendance.today = status;
    render();
}

window.toggleEditAccess = function (status) {
    db.students[appState.selectedStudent].canEditProfile = status;
    render();
}

window.viewStudent = function (index) {
    appState.selectedStudent = index;
    appState.view = 'warden-student-detail';
    render();
}
window.saveBookingSettings = function (e) {
    if (e) e.preventDefault();
    const day = parseInt(document.getElementById('setBookingDay').value);
    const start = parseInt(document.getElementById('setStartHour').value);
    const end = parseInt(document.getElementById('setEndHour').value);

    if (start >= end) {
        alert("Start time must be before end time.");
        return;
    }

    db.bookingSettings.dayOfWeek = day;
    db.bookingSettings.startHour = start;
    db.bookingSettings.endHour = end;

    alert("Booking settings updated successfully!");
    render();
}

// Initialize
document.addEventListener('DOMContentLoaded', render);
