import { prisma } from '../db';

export class NotificationService {
  public static async sendNotification(params: {
    userId: string;
    type: 'EXPIRY_ALERT' | 'SCHEDULE_UPDATE' | 'RENEWAL_REMINDER' | 'INSPECTION_ASSIGNED' | 'CERTIFICATE_READY';
    title: string;
    message: string;
    channel?: 'IN_APP' | 'EMAIL_STUB' | 'SMS_STUB';
  }) {
    const channel = params.channel || 'IN_APP';

    // 1. Persist notification in database
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        channel
      }
    });

    // 2. Fetch user recipient details for stub dispatch simulation
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { email: true, phone: true, fullName: true }
    });

    if (user) {
      console.log(`\n📨 [DoCA Notification Gateway - ${channel}]`);
      console.log(`   To: ${user.fullName} <${user.email}> | SMS: ${user.phone}`);
      console.log(`   Subject: [ScaleCheck] ${params.title}`);
      console.log(`   Body: ${params.message}\n`);
    }

    return notification;
  }

  public static async runAutomatedExpiryCheck() {
    console.log('⏰ [NotificationService] Running automated Legal Metrology certificate validity check...');
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Find instruments expiring within 30 days or already expired
    const expiringInstruments = await prisma.instrument.findMany({
      where: {
        validityExpiryAt: {
          lte: thirtyDaysFromNow
        },
        status: {
          in: ['VERIFIED', 'UNVERIFIED']
        }
      },
      include: {
        owner: true
      }
    });

    let alertsSent = 0;
    for (const inst of expiringInstruments) {
      if (!inst.validityExpiryAt) continue;

      const isExpired = inst.validityExpiryAt < now;
      const daysLeft = Math.ceil((inst.validityExpiryAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      const title = isExpired
        ? `STATUTORY ALERT: Certificate Expired for Serial #${inst.serialNumber}`
        : `RENEWAL ALERT: Certificate Expiring in ${daysLeft} days for Serial #${inst.serialNumber}`;

      const message = isExpired
        ? `Your commercial weighing/measuring instrument (${inst.makeAndModel}, Serial: ${inst.serialNumber}) expired on ${inst.validityExpiryAt.toLocaleDateString('en-IN')}. Commercial use of an unverified instrument is an offense under Sec 24 of Legal Metrology Act, 2009. Please apply for re-verification immediately.`
        : `Your verification certificate for instrument #${inst.serialNumber} (${inst.makeAndModel}) is due for renewal on ${inst.validityExpiryAt.toLocaleDateString('en-IN')}. Apply now to avail early-renewal priority scheduling.`;

      await this.sendNotification({
        userId: inst.ownerId,
        type: isExpired ? 'EXPIRY_ALERT' : 'RENEWAL_REMINDER',
        title,
        message,
        channel: 'SMS_STUB'
      });

      alertsSent++;
    }

    console.log(`⏰ [NotificationService] Automated check completed. Dispatched ${alertsSent} renewal/expiry notices.`);
    return alertsSent;
  }
}
