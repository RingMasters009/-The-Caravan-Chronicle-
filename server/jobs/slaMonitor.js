const cron = require('node-cron');
const { Complaint } = require('../models/Complaint');
const { sendNotification } = require('../services/notificationService');

const SLA_THRESHOLDS = {
  warning: 0.75,
  escalation: 1,
};

const checkSlaViolations = async () => {
  const now = new Date();
  const openStatuses = ['OPEN', 'IN_PROGRESS', 'ESCALATED'];

  const complaints = await Complaint.find({ status: { $in: openStatuses } })
    .select('title reporter assignedTo dueAt status slaHours')
    .populate('reporter', 'email fullName')
    .populate('assignedTo', 'email fullName role');

  complaints.forEach((complaint) => {
    if (!complaint.dueAt) return;

    const totalDuration = complaint.slaHours * 60 * 60 * 1000;
    const elapsed = now - complaint.createdAt;
    const ratio = elapsed / totalDuration;

    if (ratio >= SLA_THRESHOLDS.escalation && complaint.status !== 'ESCALATED') {
      complaint.status = 'ESCALATED';
      complaint.statusHistory.push({
        status: 'ESCALATED',
        updatedAt: now,
      });
      complaint.escalationLevel = (complaint.escalationLevel || 0) + 1;

      sendNotification({
        recipients: [complaint.reporter?.email, complaint.assignedTo?.email].filter(Boolean),
        subject: `Complaint Escalated: ${complaint.title}`,
        message: 'The issue has exceeded the SLA and has been escalated.',
        metadata: {
          complaintId: complaint._id,
          type: 'SLA_ESCALATION',
        },
      });
    } else if (ratio >= SLA_THRESHOLDS.warning) {
      sendNotification({
        recipients: [complaint.assignedTo?.email].filter(Boolean),
        subject: `SLA Warning: ${complaint.title}`,
        message: 'The complaint is nearing its SLA deadline. Please address promptly.',
        metadata: {
          complaintId: complaint._id,
          type: 'SLA_WARNING',
        },
      });
    }
  });

  await Promise.all(complaints.map((complaint) => complaint.save()));
};

const scheduleSlaMonitoring = () => {
  cron.schedule('*/15 * * * *', checkSlaViolations, {
    scheduled: true,
  });
  console.log('[SLA Monitor] Scheduled every 15 minutes');
};

module.exports = {
  scheduleSlaMonitoring,
};
