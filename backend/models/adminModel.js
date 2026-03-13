const db = require('../config/db');

class AdminModel {
    static async getDashboardStats() {
        const [studentCount] = await db.query("SELECT COUNT(*) as count FROM students WHERE status = 'ACTIVE'");
        const [facultyCount] = await db.query("SELECT COUNT(*) as count FROM faculty");
        const [courseCount] = await db.query("SELECT COUNT(*) as count FROM courses");
        const [pendingAdmissions] = await db.query("SELECT COUNT(*) as count FROM admission_applications WHERE status = 'PENDING'");

        // Fees overview (all time)
        const [feesOverview] = await db.query(`
            SELECT 
                COALESCE(SUM(amount_due), 0) as total_expected,
                COALESCE((SELECT SUM(amount_paid) FROM payments), 0) as total_collected
            FROM fees
        `);

        // Extra Finance: Collected this month
        const [financeMonth] = await db.query(`
            SELECT COALESCE(SUM(amount_paid), 0) as collected_this_month 
            FROM payments 
            WHERE MONTH(payment_date) = MONTH(CURRENT_DATE()) AND YEAR(payment_date) = YEAR(CURRENT_DATE())
        `);

        // Extra Finance: Pending total
        const [pendingFees] = await db.query(`
            SELECT COALESCE(SUM(amount_due), 0) - COALESCE(SUM(
                (SELECT COALESCE(SUM(amount_paid), 0) FROM payments WHERE fee_id = f.id)
            ), 0) as pending_total
            FROM fees f
        `);

        // Extra Finance: Recent 5 payments
        const [recentPayments] = await db.query(`
            SELECT p.id, p.amount_paid, p.payment_date, p.transaction_id, s.first_name, s.last_name 
            FROM payments p
            JOIN fees f ON p.fee_id = f.id
            JOIN students s ON f.student_id = s.id
            ORDER BY p.payment_date DESC LIMIT 5
        `);

        // Admissions Overview (Today)
        const [admissionsToday] = await db.query(`
            SELECT 
                COUNT(*) as total_today,
                SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as accepted_today,
                SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected_today
            FROM admission_applications
            WHERE DATE(created_at) = CURRENT_DATE()
        `);

        // Upcoming Exams (Next 5 exam schedules grouped)
        const [upcomingExams] = await db.query(`
            SELECT 
                es.id,
                es.exam_name,
                es.semester,
                MIN(et.exam_date) as start_date,
                COUNT(et.id) as subject_count
            FROM exam_schedules es
            JOIN exam_timetable et ON es.id = et.exam_schedule_id
            WHERE es.is_published = TRUE AND et.exam_date >= CURRENT_DATE()
            GROUP BY es.id, es.exam_name, es.semester
            ORDER BY start_date ASC
            LIMIT 5
        `);

        // Upcoming Events (Next 5)
        const [upcomingEvents] = await db.query(`
            SELECT id, title, description, event_date, type
            FROM events
            WHERE event_date >= CURRENT_DATE()
            ORDER BY event_date ASC
            LIMIT 5
        `);

        return {
            students: studentCount[0].count,
            faculty: facultyCount[0].count,
            courses: courseCount[0].count,
            pendingAdmissions: pendingAdmissions[0].count,
            fees: {
                total_expected: parseFloat(feesOverview[0].total_expected),
                total_collected: parseFloat(feesOverview[0].total_collected)
            },
            admissions_overview: {
                total_today: admissionsToday[0].total_today || 0,
                accepted_today: admissionsToday[0].accepted_today || 0,
                rejected_today: admissionsToday[0].rejected_today || 0
            },
            finance_overview: {
                collected_this_month: parseFloat(financeMonth[0].collected_this_month),
                pending_total: parseFloat(pendingFees[0].pending_total),
                recent_payments: recentPayments
            },
            upcoming_exams: upcomingExams,
            upcoming_events: upcomingEvents
        };
    }
}

module.exports = AdminModel;
