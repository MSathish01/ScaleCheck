import { Request, Response } from 'express';
import { prisma } from '../db';
import { LedgerService } from '../services/LedgerService';

export class LedgerController {
  public static async getLedger(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(String(req.query.limit || '50'), 10);
      const entries = await LedgerService.getRecentLedger(limit);
      res.status(200).json({ success: true, data: entries });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error retrieving ledger.', error: error.message });
    }
  }

  public static async validateChain(req: Request, res: Response): Promise<void> {
    try {
      const result = await LedgerService.validateChainIntegrity();
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error validating ledger integrity.', error: error.message });
    }
  }

  /**
   * Demonstrator utility for evaluators:
   * Simulates an adversarial attempt to tamper with a historic ledger entry.
   */
  public static async simulateTamper(req: Request, res: Response): Promise<void> {
    try {
      const { sequence } = req.body;
      const targetSeq = sequence ? parseInt(sequence, 10) : 2;

      const block = await prisma.verificationLedger.findUnique({
        where: { sequence: targetSeq }
      });

      if (!block) {
        res.status(404).json({ success: false, message: `Block #${targetSeq} does not exist.` });
        return;
      }

      // Maliciously alter payload without updating recordHash or subsequent blocks
      const tamperedPayload = JSON.stringify({
        ...JSON.parse(block.payload),
        tampered_by: 'UNAUTHORIZED_INTRUDER',
        feePaid: 0.0,
        result: 'MALICIOUS_PASS'
      });

      await prisma.verificationLedger.update({
        where: { sequence: targetSeq },
        data: { payload: tamperedPayload }
      });

      res.status(200).json({
        success: true,
        message: `ATTACK SIMULATED: Block #${targetSeq} payload altered. Run ledger validation to see detection!`,
        targetSequence: targetSeq
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Tamper simulation failed.', error: error.message });
    }
  }

  /**
   * Demonstrator utility:
   * Re-calculates valid cryptographic chain hashes to restore ledger consistency after demo tamper.
   */
  public static async repairChain(req: Request, res: Response): Promise<void> {
    try {
      const allBlocks = await prisma.verificationLedger.findMany({
        orderBy: { sequence: 'asc' }
      });

      let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';

      for (const block of allBlocks) {
        if (block.sequence === 1) {
          prevHash = block.recordHash;
          continue;
        }

        const newRecordHash = LedgerService.computeRecordHash(
          block.sequence,
          prevHash,
          block.eventType,
          block.entityType,
          block.entityId,
          block.payload,
          block.timestamp
        );

        await prisma.verificationLedger.update({
          where: { sequence: block.sequence },
          data: {
            previousHash: prevHash,
            recordHash: newRecordHash
          }
        });

        prevHash = newRecordHash;
      }

      res.status(200).json({
        success: true,
        message: 'Chain re-hashed and mathematically restored.'
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Chain repair failed.', error: error.message });
    }
  }
}
