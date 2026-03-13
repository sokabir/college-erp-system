const db = require('../config/db');

class FeeModel {
    static async getByStudentId(studentId) {
        const [rows] = await db.query('SELECT * FROM fees WHERE student_id = ?', [studentId]);
        return rows;
    }

    static async mockPayFee(feeId, amount) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [fee] = await connection.query('SELECT * FROM fees WHERE id = ?', [feeId]);
            if (!fee[0]) throw new Error('Fee not found');

            const transactionId = `TXN${Date.now()}`;
            await connection.query(
                'INSERT INTO payments (fee_id, amount_paid, payment_date, transaction_id) VALUES (?, ?, CURDATE(), ?)',
                [feeId, amount, transactionId]
            );

            const newAmountPaid = parseFloat(amount);
            const status = parseFloat(fee[0].amount_due) <= newAmountPaid ? 'PAID' : 'PARTIAL';

            // Just setting to PAID for simplicity in mocked version
            await connection.query('UPDATE fees SET status = "PAID" WHERE id = ?', [feeId]);

            await connection.commit();
            return transactionId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = FeeModel;
