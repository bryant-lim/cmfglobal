
export default {
  async afterCreate(event) {
    const { result } = event;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3003';
    
    if (result.documentId) {
      const directLink = `${frontendUrl}/en/tickets?id=${result.documentId}`;
      
      await strapi.documents('api::event.event').update({
        documentId: result.documentId,
        data: {
          directLink: directLink
        }
      });
    }
  },

  async afterUpdate(event) {
    const { result } = event;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3003';
    
    if (result.documentId) {
      const directLink = `${frontendUrl}/en/tickets?id=${result.documentId}`;
      
      // Prevent infinite loop by checking if it already matches
      if (result.directLink !== directLink) {
        await strapi.documents('api::event.event').update({
          documentId: result.documentId,
          data: {
            directLink: directLink
          }
        });
      }
    }
  }
};
