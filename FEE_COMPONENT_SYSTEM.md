# Fee Component System Documentation

## Overview
The fee structure has been enhanced to support individual fee components instead of a single total fee. This allows for better transparency and detailed fee management.

## Fee Components

Each course now has four distinct fee components:

1. **Tuition Fee** 📚 - Main academic instruction fee
2. **Library Fee** 📖 - Library access and resources
3. **Lab Fee** 🔬 - Laboratory equipment and materials
4. **Exam Fee** 📝 - Examination and assessment costs

## Database Structure

### Courses Table - New Columns
```sql
- tuition_fee DECIMAL(10, 2)
- library_fee DECIMAL(10, 2)
- lab_fee DECIMAL(10, 2)
- exam_fee DECIMAL(10, 2)
- total_fees DECIMAL(10, 2)  -- Sum of all components
```

## Admin Interface

### Fee Structure Tab Features

1. **Visual Component Breakdown**
   - Each course displayed as a card with department color coding
   - Individual fee components shown with icons
   - Real-time total calculation

2. **Edit Mode**
   - Click "Edit" button on any course card
   - Modify individual fee components
   - Total automatically calculated
   - Save or cancel changes

3. **Department Color Coding**
   - CM (Computer Technology): Blue
   - CE (Civil Engineering): Orange
   - EE (Electrical Engineering): Yellow
   - ME (Mechanical Engineering): Green

### How to Update Fees

1. Navigate to Admin → Finance → Fee Structure
2. Click "Edit" on the course you want to modify
3. Update individual fee components:
   - Tuition Fee
   - Library Fee
   - Lab Fee
   - Exam Fee
4. Total is calculated automatically
5. Click "Save Changes" to apply

## Current Fee Structure

Based on test results:

### Civil Engineering (CE)
- Tuition Fee: ₹32,800
- Library Fee: ₹4,100
- Lab Fee: ₹2,050
- Exam Fee: ₹2,050
- **Total: ₹41,000**

### Computer Technology (CM)
- Tuition Fee: ₹35,200
- Library Fee: ₹4,400
- Lab Fee: ₹2,200
- Exam Fee: ₹2,200
- **Total: ₹44,000**

### Electrical Engineering (EE)
- Tuition Fee: ₹35,200
- Library Fee: ₹4,400
- Lab Fee: ₹2,200
- Exam Fee: ₹2,200
- **Total: ₹44,000**

### Mechanical Engineering (ME)
- Tuition Fee: ₹33,600
- Library Fee: ₹4,200
- Lab Fee: ₹2,100
- Exam Fee: ₹2,100
- **Total: ₹42,000**

## API Endpoints

### Update Course Fees
```
PUT /api/admin/courses/:id/fees
```

**Request Body:**
```json
{
  "tuition_fee": 35000,
  "library_fee": 5000,
  "lab_fee": 3000,
  "exam_fee": 2000,
  "total_fees": 45000
}
```

**Response:**
```json
{
  "message": "Fee structure updated successfully"
}
```

## Migration

### Initial Setup
Run the migration script to add fee component columns:
```bash
node backend/add_fee_components.js
```

This script:
1. Adds four new columns to courses table
2. Initializes existing courses with breakdown:
   - 80% Tuition Fee
   - 10% Library Fee
   - 5% Lab Fee
   - 5% Exam Fee

### Testing
Verify fee components are correctly set up:
```bash
node backend/test_fee_components.js
```

## Benefits

1. **Transparency**: Students and parents can see exactly what they're paying for
2. **Flexibility**: Admin can adjust individual components without recalculating everything
3. **Reporting**: Better financial reporting and analysis
4. **Compliance**: Meets regulatory requirements for fee disclosure
5. **Customization**: Different courses can have different component ratios

## Future Enhancements

Potential additions:
- Semester-wise fee breakdown
- Optional fees (hostel, transport, etc.)
- Fee waivers/scholarships per component
- Component-wise payment tracking
- Fee comparison across courses
- Historical fee structure tracking

## Files Modified/Created

### Backend
- `backend/add_fee_components.js` - Migration script
- `backend/test_fee_components.js` - Testing script
- `backend/controllers/adminController.js` - Updated updateCourseFees function

### Frontend
- `frontend/src/pages/Admin/FeeStructureTab.jsx` - Complete redesign with component editing

### Database
- `courses` table - Added 4 new columns for fee components

## Validation

The system ensures:
- All fee components are non-negative
- Total fee equals sum of components
- Changes are saved atomically
- Previous values preserved on cancel

## Support

For issues or questions:
1. Check browser console for frontend errors
2. Verify database columns exist: `DESCRIBE courses;`
3. Run test script to verify data integrity
4. Check backend logs for API errors
