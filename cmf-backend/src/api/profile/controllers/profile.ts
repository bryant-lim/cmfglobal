import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::profile.profile', ({ strapi }) => ({
  async me(ctx) {
    const user = ctx.state.user;
    if (!user) {
      console.log('⚠️ Me: No user in state');
      return ctx.unauthorized();
    }

    console.log('📊 [DASHBOARD SEARCH] User ID:', user.id);

    const profile = await strapi.db.query('api::profile.profile').findOne({
      where: { user: user.id },
      populate: ['portraitPhoto']
    });

    if (!profile) {
      console.log('❌ [DASHBOARD SEARCH] Profile NOT FOUND for User ID:', user.id);
      return ctx.notFound('Member profile not found');
    }

    console.log('✅ [DASHBOARD SEARCH] Profile Found. Member ID:', profile.memberId);

    // Fetch all membership records for this user
    const walletRecords = await strapi.db.query('api::membership-record.membership-record').findMany({
      where: { profile: profile.id },
      populate: ['membership_type']
    });

    const processedWallet = walletRecords.map(record => ({
      ...record,
      membershipCode: record.membershipCode || record.memberId || profile.memberId || 'CMF-000000'
    }));

    // Fetch all purchased tickets for this user (Attendees via Paid Orders)
    const tickets = await strapi.db.query('api::attendee.attendee').findMany({
      where: {
        order: {
          user: user.id,
          orderStatus: 'paid',
          type: 'ticket'
        }
      },
      populate: {
        event: true // Fetching the event document
      }
    });

    console.log(`🎟️ [DASHBOARD SEARCH] Found ${tickets.length} tickets for User ID ${user.id} using DB query.`);

    return { 
      data: {
        ...profile,
        wallet_records: processedWallet,
        tickets: tickets
      }
    };
  },

  async updateMe(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { data } = ctx.request.body;
    
    // Find the profile for this user
    const profile = await strapi.db.query('api::profile.profile').findOne({
      where: { user: user.id }
    });

    if (!profile) return ctx.notFound('Profile not found');

    const updatedProfile = await strapi.documents('api::profile.profile').update({
      documentId: profile.documentId,
      data: {
        ...data,
        user: user.id // Ensure it stays linked
      }
    });

    return { data: updatedProfile };
  },

  async testLogin(ctx) {
    try {
      const { email, password } = ctx.query as { email?: string; password?: string };
      if (!email || !password) return ctx.badRequest('Missing email or password in query');

      console.log('🧪 DIAGNOSTIC LOGIN TEST FOR:', email);

      const user: any = await strapi.query('plugin::users-permissions.user').findOne({
        where: { email: email.toLowerCase().trim() },
        populate: ['role']
      });

      if (!user) {
        console.log('❌ User not found in database:', email);
        return ctx.notFound('User not found in DB');
      }

      // Manual validate using correct service path
      const valid = await strapi.plugin('users-permissions').service('user').validatePassword(password, user.password);
      console.log(`🧪 Password valid for ${email}:`, valid);

      // Attempt JWT (Safely)
      let token = null;
      try {
        if (valid) {
          token = strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });
          console.log(`✅ JWT Issued for ${email}`);
        }
      } catch (jwtErr) {
        console.error('❌ JWT Issue failed:', jwtErr.message);
      }

      return {
        userFound: true,
        id: user.id,
        email: user.email,
        role: user.role?.name || 'No Role',
        confirmed: user.confirmed,
        passwordValid: !!valid,
        jwt: token
      };
    } catch (err: any) {
      console.error('❌ Diagnostic Error:', err.message);
      return ctx.internalServerError(err.message);
    }
  },

  async directory(ctx) {
    try {
      const { locale, page = 1, pageSize = 20, search = '', type = '' } = ctx.query as any;
      const start = (parseInt(page) - 1) * parseInt(pageSize);
      const limit = parseInt(pageSize);

      console.log(`🔍 [DIRECTORY] Fetching members. Page: ${page}, Size: ${pageSize}, Search: "${search}", Type: "${type}"`);
      
      const searchFilter: any = {
        wallet_records: { id: { $notNull: true } }
      };

      if (search) {
        searchFilter.$or = [
          { firstName: { $contains: search } },
          { lastName: { $contains: search } },
          { chineseName: { $contains: search } },
          { memberId: { $contains: search } }
        ];
      }

      if (type && type !== 'All Awards' && type !== '所有奖项') {
        searchFilter.wallet_records = {
          ...searchFilter.wallet_records,
          membership_type: {
             name: type
          }
        };
      }

      // Fetch total count for pagination meta with filter
      const totalCount = await strapi.db.query('api::profile.profile').count({
        where: searchFilter
      });

      // Fetch paginated profiles with filter
      const profiles = await strapi.db.query('api::profile.profile').findMany({
        where: searchFilter,
        limit,
        offset: start,
        populate: {
          portraitPhoto: true,
          wallet_records: {
            populate: {
              membership_type: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      console.log(`🔍 [DIRECTORY] Found ${profiles.length} profiles for this page.`);

      const finalData = [];
      for (const p of profiles as any[]) {
        const history = [];
        for (const r of p.wallet_records || []) {
          if (!r.membership_type) continue;
          
          let typeName = r.membership_type.name;
          if (locale) {
            try {
              const localizedType = await strapi.documents('api::membership-type.membership-type').findOne({
                documentId: r.membership_type.documentId,
                locale: locale
              });
              if (localizedType) typeName = localizedType.name;
            } catch (e) {}
          }
          
          const now = new Date();
          const validUntil = r.validUntil ? new Date(r.validUntil) : null;
          const isExpired = validUntil && validUntil < now;
          const currentStatus = isExpired ? 'expired' : r.membershipStatus;
          
          history.push({
            year: r.validFrom ? new Date(r.validFrom).getFullYear() : (r.validUntil ? new Date(r.validUntil).getFullYear() : 'TBA'),
            type: typeName,
            status: currentStatus
          });
        }

        history.sort((a, b) => (typeof b.year === 'number' && typeof a.year === 'number') ? b.year - a.year : 0);

        let displayTypes = history.filter(h => h.status === 'active').map(h => h.type);
        if (displayTypes.length === 0 && history.length > 0) {
          const latestYear = history[0].year;
          displayTypes = history.filter(h => h.year === latestYear).map(h => h.type);
        }

        finalData.push({
          id: p.id,
          documentId: p.documentId,
          firstName: p.firstName,
          lastName: p.lastName,
          chineseName: p.chineseName,
          memberId: p.memberId,
          portraitPhoto: p.portraitPhoto,
          membershipTypes: [...new Set(displayTypes)],
          membershipHistory: history
        });
      }

      return { 
        data: finalData,
        meta: {
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            pageCount: Math.ceil(totalCount / limit),
            total: totalCount
          }
        }
      };
    } catch (err: any) {
       console.error('❌ [DIRECTORY] Error:', err.message);
       return ctx.internalServerError(err.message);
    }
  },

  async registerPublicMember(ctx) {
    const { firstName, lastName, email, phone } = ctx.request.body;

    if (!firstName || !lastName || !email || !phone) {
      return ctx.badRequest('Missing required fields');
    }

    // 1. Check if user already exists
    const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { email: email.toLowerCase().trim() }
    });
    if (existingUser) return ctx.badRequest('Email already registered');

    // 2. Check if profile with phone exists
    const existingProfile = await strapi.db.query('api::profile.profile').findOne({
      where: { phone: phone.trim() }
    });
    if (existingProfile) return ctx.badRequest('Phone number already registered');

    // 3. Generate Random Password
    const tempPassword = Math.random().toString(36).slice(-8).toUpperCase() + '!' + Math.floor(Math.random() * 99);

    try {
      // 4. Create User
      const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'authenticated' } });
      console.log(`👤 creating user with role ID: ${authenticatedRole.id} for ${email}`);

      const newUser: any = await strapi.plugin('users-permissions').service('user').add({
        email: email.toLowerCase().trim(),
        username: email.toLowerCase().trim(),
        password: tempPassword,
        role: authenticatedRole.id,
        confirmed: true,
      });

      console.log(`✅ User created successfully! ID: ${newUser?.id}`);

      // 5. Create Profile
      const profile = await strapi.documents('api::profile.profile').create({
        data: {
          firstName,
          lastName,
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          companyName: 'Individual',
          designation: 'Member',
          passportNo: 'TBA',
          country: 'Malaysia',
          user: newUser.id,
        }
      });
      console.log(`✅ Profile created for user ID: ${newUser.id}`);

      // 6. Send Welcome Email
      try {
        await strapi.plugin('email').service('email').send({
          to: email,
          from: process.env.SMTP_FROM || 'no-reply@creativatestudio.cloud',
          subject: 'Welcome to CMF Global Community - Your Access Details',
          text: `Dear ${firstName},\n\nWelcome to the CMF Global community!\n\nYour account has been successfully created. You can log in to the member portal using the following credentials:\n\nEmail: ${email}\nPassword: ${tempPassword}\n\nPlease log in and update your profile at your earliest convenience.\n\nBest Regards,\nCMF Global Team`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h1 style="color: #E63946;">Welcome to CMF Global!</h1>
              <p>Dear <strong>${firstName}</strong>,</p>
              <p>Your account has been successfully created. You can now access the CMF Member Portal.</p>
              <div style="background: #F8F9FA; padding: 15px; border-radius: 10px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Username:</strong> ${email}</p>
                <p style="margin: 5px 0 0 0;"><strong>Temporary Password:</strong> <span style="color: #E63946; font-family: monospace;">${tempPassword}</span></p>
              </div>
              <p>Please log in and update your password and profile details.</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/en/login" style="display: inline-block; padding: 10px 20px; background: #E63946; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Log In to Portal</a>
              <p style="margin-top: 30px; font-size: 12px; color: #999;">If you did not request this account, please ignore this email.</p>
            </div>
          `
        });
        console.log(`📧 Welcome email sent to ${email}`);
      } catch (emailErr) {
        console.error('❌ Email sending failed during registration:', emailErr.message);
        // We don't fail the request if email fails, user is created but might need password reset
      }

      return { success: true, message: 'Registration successful' };
    } catch (err: any) {
      console.error('❌ Registration Logic Error:', err.message);
      return ctx.internalServerError('Failed to create account. Please try again later.');
    }
  }
}));
