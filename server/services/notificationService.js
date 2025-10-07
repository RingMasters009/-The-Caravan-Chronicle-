const sendNotification = ({ recipients = [], subject, message, metadata = {} }) => {
  const recipientList = Array.isArray(recipients) ? recipients : [recipients];
  const payload = {
    subject,
    message,
    metadata,
    recipients: recipientList.map((recipient) =>
      typeof recipient === 'string' ? recipient : recipient?.email
    ),
  };

  console.log('[Notification]', JSON.stringify(payload, null, 2));
};

module.exports = {
  sendNotification,
};
