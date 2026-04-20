export default {
  async beforeCreate(event) {
    const { data } = event.params;
    if (!data.assignmentCode) {
      data.assignmentCode = await generateAssignmentCode();
    }
  },
};

async function generateAssignmentCode() {
  const prefix = 'CMF-';
  const lastAssignment = await strapi.entityService.findMany('api::membership-assignment.membership-assignment', {
    sort: { assignmentCode: 'desc' },
    limit: 1,
  });

  let nextNo = 1;
  if (lastAssignment?.length > 0) {
    const lastCode = lastAssignment[0].assignmentCode;
    const lastNo = parseInt(lastCode.replace(prefix, ''), 10);
    if (!isNaN(lastNo)) {
      nextNo = lastNo + 1;
    }
  }

  return `${prefix}${nextNo.toString().padStart(5, '0')}`;
}
