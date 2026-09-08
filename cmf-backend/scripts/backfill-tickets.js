// scripts/backfill-tickets.js

module.exports = async ({ strapi }) => {
  // CONFIGURATION: List all Order IDs (refNo) that need backfilling here
  const ORDERS_TO_FIX = [
    'TKT-1778156174483-725',
    'TKT-1778156650434-406',
    'TKT-1778156975012-902'
  ]; 

  console.log(`🚀 Starting batch backfill for ${ORDERS_TO_FIX.length} orders...`);

  for (const refNo of ORDERS_TO_FIX) {
    console.log(`\n--- Processing Order: ${refNo} ---`);
    try {
      // 1. Fetch Order Data using the correct field name 'refNo'
      const results = await strapi.documents('api::order.order').findMany({
        filters: { refNo: refNo },
        populate: ['event', 'attendees']
      });

      const orderData = results[0];
      if (!orderData) {
        console.error(`❌ Order ${refNo} not found in database.`);
        continue;
      }

      const { attendees } = orderData.enrollmentData || {};
      if (!attendees || !Array.isArray(attendees)) {
        console.error(`❌ No attendee data found in enrollmentData for ${refNo}.`);
        continue;
      }

      const existingAttendees = orderData.attendees || [];
      const year = new Date().getFullYear();
      const eventDocId = orderData.event?.documentId;

      for (const attendee of attendees) {
        // Check if this attendee already exists (matching by email and first name)
        const isAlreadyCreated = existingAttendees.find(
          ea => ea.email.toLowerCase() === attendee.email.toLowerCase() && 
                ea.firstName.toLowerCase() === attendee.firstName.toLowerCase()
        );

        if (isAlreadyCreated) {
          console.log(`⏩ Skipping ${attendee.firstName} (Already in DB)`);
          continue;
        }

        console.log(`🆕 Creating missing ticket for ${attendee.firstName}...`);

        // Generate Reference Code
        const allAttendees = await strapi.db.query('api::attendee.attendee').findMany({
          where: { referenceCode: { $contains: `CMFEVT-${year}-` } }
        });
        
        let nextNum = 1;
        allAttendees.forEach((a) => {
          const parts = a.referenceCode.split('-');
          if (parts.length === 3) {
            const num = parseInt(parts[2], 10);
            if (num >= nextNum) nextNum = num + 1;
          }
        });
        
        const refCode = `CMFEVT-${year}-${nextNum.toString().padStart(5, '0')}`;

        // Create Attendee record
        const newAttendee = await strapi.documents('api::attendee.attendee').create({
          data: {
            firstName: attendee.firstName,
            lastName: attendee.lastName,
            email: attendee.email,
            phone: attendee.phone,
            companyName: attendee.companyName || '',
            referenceCode: refCode,
            order: orderData.id,
            event: eventDocId
          }
        });

        console.log(`✅ Success: ${refCode} issued to ${attendee.firstName}`);

        // Send Email
        try {
          await strapi.service('api::order.notification').sendTicketEmail(newAttendee.id);
          console.log(`✉️ Email sent to ${attendee.email}`);
        } catch (emailErr) {
          console.error(`⚠️ Email failed:`, emailErr.message);
        }
      }
    } catch (err) {
      console.error(`❌ Error processing ${refNo}:`, err.message);
    }
  }

  console.log('\n✅ All specified orders have been processed.');
};
