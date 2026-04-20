export default {
  async beforeCreate(event) {
    const { data } = event.params;
    if (data.event) {
        try {
            // Find the event using Database Query for maximum compatibility
            const eventId = typeof data.event === 'object' ? data.event.id : data.event;
            
            const eventData: any = await strapi.db.query('api::event.event').findOne({
                where: { 
                   $or: [
                     { id: parseInt(eventId) || -1 },
                     { documentId: eventId }
                   ]
                },
                select: ['title']
            });
            
            if (eventData) {
                data.eventName = eventData.title;
            }
        } catch (err) {
            console.error('Error syncing eventName in lifecycle (beforeCreate):', err);
        }
    }
  },

  async beforeUpdate(event) {
    const { data } = event.params;
    if (data.event) {
        try {
            const eventId = typeof data.event === 'object' ? data.event.id : data.event;
            const eventData: any = await strapi.db.query('api::event.event').findOne({
                where: { 
                  $or: [
                    { id: parseInt(eventId) || -1 },
                    { documentId: eventId }
                  ]
                },
                select: ['title']
            });
            if (eventData) {
                data.eventName = eventData.title;
            }
        } catch (err) {
            console.error('Error syncing eventName in lifecycle (beforeUpdate):', err);
        }
    }
  }
};
