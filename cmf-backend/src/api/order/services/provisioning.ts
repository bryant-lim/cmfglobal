const bcrypt = require('bcryptjs');

export default ({ strapi }) => ({
    async provisionOrder(orderId) {
    try {
      console.log('🏗️ Final Identity-Aware Provisioning Logic:', orderId);
      
      const results: any = await strapi.documents('api::order.order').findMany({
        filters: { id: orderId },
        populate: ['membership_type', 'event']
      });

      const orderData = results[0];
      if (!orderData) return null;

      // 🛑 IDEMPOTENCY CHECK 1: Is this order already paid/processed?
      if (orderData.orderStatus === 'paid') {
        console.log(`⚠️ Order ${orderId} is already marked as PAID. Skipping duplicate provisioning.`);
        return orderData;
      }

      console.log(`📦 Order Type Detected: "${orderData.type}" for Order ID: ${orderId}`);

      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      const validUntilStr = expiryDate.toISOString().split('T')[0];

      // 🔒 LOCK THE ORDER: Mark as paid IMMEDIATELY to prevent other race threads
      await strapi.documents('api::order.order').update({
        documentId: orderData.documentId,
        data: {
          orderStatus: 'paid',
          validUntil: validUntilStr
        }
      });

      if (orderData.type === 'membership') {
        // 🛑 IDEMPOTENCY CHECK 2: Do we already have a record for this order?
        const existingRecord = await strapi.db.query('api::membership-record.membership-record').findOne({
          where: { order: orderId }
        });

        if (existingRecord) {
          console.log(`⚠️ Membership record already exists for Order ${orderId}. Skipping creation.`);
          return orderData;
        }

        const enrollmentData = orderData.enrollmentData;
        const tempPassword = `CMF${Math.floor(10000000 + Math.random() * 89999999)}`;
        const cleanEmail = orderData.buyerEmail.toLowerCase().trim();
        
        // ... (User logic remains same)
        const roles = await strapi.db.query('plugin::users-permissions.role').findMany({
          where: { type: 'authenticated' }
        });
        const roleId = roles[0]?.id || 1;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        let user: any = await strapi.query('plugin::users-permissions.user').findOne({
          where: { email: cleanEmail }
        });

        if (!user) {
          user = await strapi.query('plugin::users-permissions.user').create({
            data: {
              username: cleanEmail,
              email: cleanEmail,
              password: hashedPassword,
              confirmed: true,
              role: roleId
            }
          });
          console.log('👤 New User Provisioned');
        } else {
          await strapi.db.query('plugin::users-permissions.user').update({
            where: { id: user.id },
            data: { password: hashedPassword, role: roleId, confirmed: true }
          });
          console.log('✅ Existing User Credentials Updated');
        }

        if (user) {
          // 2. Handle Personal Profile (Identity Anchor)
          let profile = await strapi.db.query('api::profile.profile').findOne({
            where: { user: user.id }
          });

          if (!profile) {
            profile = await strapi.db.query('api::profile.profile').create({
              data: {
                firstName: orderData.buyerFirstName,
                lastName: orderData.buyerLastName,
                chineseName: orderData.buyerChineseName,
                email: cleanEmail,
                phone: orderData.buyerPhone,
                gender: orderData.gender,
                tShirtSize: orderData.tShirtSize,
                companyName: orderData.buyerCompanyName,
                designation: enrollmentData.designation,
                passportNo: enrollmentData.passportNo,
                country: enrollmentData.country,
                billingName: orderData.buyerBillingAddress.name,
                billingEmail: orderData.buyerBillingAddress.email,
                billingPhone: orderData.buyerBillingAddress.phone,
                billingCountry: orderData.buyerBillingAddress.country,
                billingAddress: orderData.buyerBillingAddress.address,
                portraitPhoto: enrollmentData.portraitPhotoId,
                incomeSlip: enrollmentData.incomeSlipId,
                user: user.id
              }
            });
            console.log('👤 New Profile Created for User');
          } else {
            // Update existing profile with new logistics info
            await strapi.db.query('api::profile.profile').update({
              where: { id: profile.id },
              data: {
                firstName: orderData.buyerFirstName,
                lastName: orderData.buyerLastName,
                chineseName: orderData.buyerChineseName,
                phone: orderData.buyerPhone,
                gender: orderData.gender,
                tShirtSize: orderData.tShirtSize,
                companyName: orderData.buyerCompanyName,
                designation: enrollmentData.designation,
                passportNo: enrollmentData.passportNo,
                country: enrollmentData.country,
                portraitPhoto: enrollmentData.portraitPhotoId,
                incomeSlip: enrollmentData.incomeSlipId
              }
            });
            console.log('👤 Existing Profile Updated with Order Details');
          }

          // 3. Handle Membership Record (The "Pass")
          let memberIdStr = profile.memberId;

          if (!memberIdStr) {
            console.log('🆔 No existing Member ID on profile. Generating new identity...');
            
            const allProfiles: any = await strapi.db.query('api::profile.profile').findMany({
               where: { memberId: { $null: false } }
            });
            
            let nextNumber = 1;
            allProfiles.forEach((p: any) => {
              const match = p.memberId.match(/CMF-(\d+)/);
              if (match) {
                const num = parseInt(match[1], 10);
                if (num >= nextNumber) nextNumber = num + 1;
              }
            });

            memberIdStr = `CMF-${nextNumber.toString().padStart(6, '0')}`;
            
            await strapi.db.query('api::profile.profile').update({
              where: { id: profile.id },
              data: { memberId: memberIdStr }
            });
            console.log('✅ Identity Permanently Locked to Profile:', memberIdStr);
          } else {
            console.log('✅ Reusing Existing Persistent Identity:', memberIdStr);
          }

          // Generate the Card Pass - NOW LINKED TO THE ORDER ID
          const membershipTypeDocId = orderData.membership_type?.documentId;
          await strapi.documents('api::membership-record.membership-record').create({
            data: {
              name: orderData.membership_type?.name,
              membershipCode: memberIdStr,
              validUntil: validUntilStr,
              membershipStatus: 'active',
              membership_type: membershipTypeDocId,
              user: user.id,
              profile: profile.id,
              order: orderData.id
            } as any
          });

          console.log('🎟️ NEW MEMBERSHIP PASS ISSUED UNDER ID:', memberIdStr);
          await strapi.service('api::order.notification').sendWelcomeEmail(cleanEmail, tempPassword);
        }
      } else if (orderData.type === 'ticket') {
        console.log('🎫 Provisioning Tickets for Order:', orderId);
        const { attendees, tierInfo } = orderData.enrollmentData;
        const eventId = orderData.event?.id;
        
        if (attendees && Array.isArray(attendees)) {
          const year = new Date().getFullYear();
          
          for (const attendee of attendees) {
             // Generate Reference Code: CMFEVT-YYYY-XXXXX
             const allAttendees = await strapi.db.query('api::attendee.attendee').findMany({
               where: { referenceCode: { $contains: `CMFEVT-${year}-` } }
             });
             
             let nextNum = 1;
             allAttendees.forEach((a: any) => {
               const parts = a.referenceCode.split('-');
               if (parts.length === 3) {
                 const num = parseInt(parts[2], 10);
                 if (num >= nextNum) nextNum = num + 1;
               }
             });
             
             const refCode = `CMFEVT-${year}-${nextNum.toString().padStart(5, '0')}`;
             
             const eventDocId = orderData.event?.documentId;
             
             const newAttendee = await strapi.documents('api::attendee.attendee').create({
               data: {
                 firstName: attendee.firstName,
                 lastName: attendee.lastName,
                 email: attendee.email,
                 phone: attendee.phone,
                 companyName: attendee.companyName || '',
                 referenceCode: refCode,
                 order: orderData.id, // Order is not localized, id is fine
                 event: eventDocId    // Use documentId for localized target
               } as any
             });
             
             console.log(`✅ Ticket Created: ${refCode} for ${attendee.firstName}`);
             
             // Send Ticket Email
             await strapi.service('api::order.notification').sendTicketEmail(newAttendee.id);
          }
        }
      }

      return orderData;
    } catch (criticalError: any) {
      console.error('❌ Provisioning Error:', criticalError.message);
      return null;
    }
  }
});
