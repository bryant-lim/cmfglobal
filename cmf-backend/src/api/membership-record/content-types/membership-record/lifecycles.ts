
export default {
  async beforeUpdate(event) {
    const { data, where } = event.params;

    // Check if we are changing status to active
    if (data.membershipStatus === 'active') {
      const existing: any = await strapi.db.query('api::membership-record.membership-record').findOne({
        where,
        populate: ['membership_type', 'order']
      });

      // Only auto-fill dates if transitioning from pending_approval
      if (existing && existing.membershipStatus === 'pending_approval') {
        console.log(`🚀 [LIFECYCLE] Activating Membership Record: ${existing.membershipCode}`);

        // 1. Set validFrom (respect manual override if admin provided one)
        const validFrom = data.validFrom || existing.validFrom || new Date().toISOString().split('T')[0];
        data.validFrom = validFrom;

        // 2. Set validUntil (respect manual override if admin provided one)
        if (!data.validUntil && !existing.validUntil) {
          const validityMonths = existing.membership_type?.validityMonths || 12;
          const startDate = new Date(validFrom);
          const expiryDate = new Date(startDate);
          expiryDate.setMonth(expiryDate.getMonth() + validityMonths);
          
          data.validUntil = expiryDate.toISOString().split('T')[0];
        }

        // 3. Sync back to the Order if it exists
        if (existing.order) {
           await strapi.documents('api::order.order').update({
             documentId: existing.order.documentId,
             data: {
               validFrom: data.validFrom,
               validUntil: data.validUntil || existing.validUntil
             } as any
           });
           console.log(`🔗 [LIFECYCLE] Synced dates to Order: ${existing.order.refNo}`);
        }

        // 4. Send Activation Email
        try {
          const fullRecord: any = await strapi.db.query('api::membership-record.membership-record').findOne({
            where: { id: existing.id },
            populate: ['user', 'profile']
          });

          if (fullRecord && fullRecord.user?.email) {
            const memberName = fullRecord.profile ? `${fullRecord.profile.firstName} ${fullRecord.profile.lastName}` : 'Member';
            await strapi.service('api::order.notification').sendActivationEmail(fullRecord.user.email, memberName);
          }
        } catch (err: any) {
          console.error('⚠️ Failed to send activation email:', err.message);
        }
      }
    }
  },
};
