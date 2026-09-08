import { prisma } from '../db';
import { CryptoService } from './CryptoService';

export interface LedgerValidationResult {
  isValid: boolean;
  totalBlocks: number;
  genesisHash?: string;
  tipHash?: string;
  brokenAtSequence?: number;
  errorMessage?: string;
  validatedAt: Date;
}

export class LedgerService {
  private static GENESIS_PREV_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

  public static async ensureGenesisBlock(): Promise<void> {
    const count = await prisma.verificationLedger.count();
    if (count === 0) {
      const timestamp = new Date('2026-01-01T00:00:00.000Z');
      const sequence = 1;
      const prevHash = this.GENESIS_PREV_HASH;
      const eventType = 'GENESIS';
      const entityType = 'SYSTEM';
      const entityId = 'DOCA-ROOT-LEDGER';
      const payloadObj = {
        title: 'ScaleCheck Legal Metrology National Verification Ledger',
        authority: 'Ministry of Consumer Affairs, Food & Public Distribution (DoCA)',
        legalBasis: 'Legal Metrology Act, 2009 & General Rules, 2011',
        genesisDate: timestamp.toISOString()
      };
      const payloadString = JSON.stringify(payloadObj);
      const recordHash = this.computeRecordHash(sequence, prevHash, eventType, entityType, entityId, payloadString, timestamp);

      await prisma.verificationLedger.create({
        data: {
          sequence,
          previousHash: prevHash,
          recordHash,
          eventType,
          entityType,
          entityId,
          payload: payloadString,
          actorId: 'SYSTEM_ROOT',
          timestamp
        }
      });
      console.log('⛓️ [LedgerService] Genesis block successfully anchored at sequence #1.');
    }
  }

  public static computeRecordHash(
    sequence: number,
    previousHash: string,
    eventType: string,
    entityType: string,
    entityId: string,
    payloadString: string,
    timestamp: Date
  ): string {
    const canonical = `${sequence}|${previousHash}|${eventType}|${entityType}|${entityId}|${payloadString}|${timestamp.toISOString()}`;
    return CryptoService.sha256(canonical);
  }

  public static async appendEntry(params: {
    eventType: string;
    entityType: string;
    entityId: string;
    payload: Record<string, any>;
    actorId?: string;
  }): Promise<{ sequence: number; recordHash: string }> {
    await this.ensureGenesisBlock();

    // Fetch the tip of the ledger
    const lastEntry = await prisma.verificationLedger.findFirst({
      orderBy: { sequence: 'desc' }
    });

    const sequence = (lastEntry?.sequence || 0) + 1;
    const previousHash = lastEntry ? lastEntry.recordHash : this.GENESIS_PREV_HASH;
    const timestamp = new Date();
    const payloadString = JSON.stringify(params.payload);

    const recordHash = this.computeRecordHash(
      sequence,
      previousHash,
      params.eventType,
      params.entityType,
      params.entityId,
      payloadString,
      timestamp
    );

    await prisma.verificationLedger.create({
      data: {
        sequence,
        previousHash,
        recordHash,
        eventType: params.eventType,
        entityType: params.entityType,
        entityId: params.entityId,
        payload: payloadString,
        actorId: params.actorId || null,
        timestamp
      }
    });

    return { sequence, recordHash };
  }

  public static async validateChainIntegrity(): Promise<LedgerValidationResult> {
    await this.ensureGenesisBlock();

    const allBlocks = await prisma.verificationLedger.findMany({
      orderBy: { sequence: 'asc' }
    });

    if (allBlocks.length === 0) {
      return {
        isValid: true,
        totalBlocks: 0,
        validatedAt: new Date()
      };
    }

    let expectedPrevHash = this.GENESIS_PREV_HASH;

    for (let i = 0; i < allBlocks.length; i++) {
      const block = allBlocks[i];

      // 1. Check previous hash link
      if (block.previousHash !== expectedPrevHash) {
        return {
          isValid: false,
          totalBlocks: allBlocks.length,
          brokenAtSequence: block.sequence,
          errorMessage: `Chain continuity broken at block #${block.sequence}. Expected previous hash ${expectedPrevHash.substring(0, 16)}..., but found ${block.previousHash.substring(0, 16)}...`,
          validatedAt: new Date()
        };
      }

      // 2. Re-compute and verify hash of this block's content
      const computedHash = this.computeRecordHash(
        block.sequence,
        block.previousHash,
        block.eventType,
        block.entityType,
        block.entityId,
        block.payload,
        block.timestamp
      );

      if (computedHash !== block.recordHash) {
        return {
          isValid: false,
          totalBlocks: allBlocks.length,
          brokenAtSequence: block.sequence,
          errorMessage: `Block payload tampering detected at block #${block.sequence}. Record hash ${block.recordHash.substring(0, 16)}... does not match computed hash ${computedHash.substring(0, 16)}...`,
          validatedAt: new Date()
        };
      }

      expectedPrevHash = block.recordHash;
    }

    return {
      isValid: true,
      totalBlocks: allBlocks.length,
      genesisHash: allBlocks[0].recordHash,
      tipHash: allBlocks[allBlocks.length - 1].recordHash,
      validatedAt: new Date()
    };
  }

  public static async getRecentLedger(limit: number = 20) {
    return prisma.verificationLedger.findMany({
      take: limit,
      orderBy: { sequence: 'desc' }
    });
  }
}
