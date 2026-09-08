import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { config } from '../config';
import { LedgerService } from '../services/LedgerService';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const {
        email,
        phone,
        password,
        fullName,
        role,
        state,
        district,
        organizationName,
        tradeLicenseNo,
        gstin,
        jurisdiction,
        approvalNumber,
        address
      } = req.body;

      if (!email || !phone || !password || !fullName || !role || !state || !district) {
        res.status(400).json({ success: false, message: 'All required registration fields must be provided.' });
        return;
      }

      const validRoles = ['TRADER', 'LMO', 'GATC', 'STATE_ADMIN', 'CENTRAL_ADMIN'];
      if (!validRoles.includes(role)) {
        res.status(400).json({ success: false, message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
        return;
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(409).json({ success: false, message: 'A user with this email address already exists.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await prisma.user.create({
        data: {
          email,
          phone,
          passwordHash,
          fullName,
          role,
          state,
          district,
          profile: {
            create: {
              organizationName: organizationName || null,
              tradeLicenseNo: tradeLicenseNo || null,
              gstin: gstin || null,
              jurisdiction: jurisdiction || null,
              approvalNumber: approvalNumber || null,
              address: address || null,
              isVerified: role === 'TRADER' ? true : false // Admins verify LMOs/GATCs
            }
          }
        },
        include: {
          profile: true
        }
      });

      // Write registration event to tamper-evident ledger
      await LedgerService.appendEntry({
        eventType: 'STAKEHOLDER_REGISTERED',
        entityType: 'USER',
        entityId: user.id,
        payload: {
          userId: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          state: user.state,
          district: user.district,
          organization: organizationName || null
        },
        actorId: user.id
      });

      const tokenPayload = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        state: user.state,
        district: user.district
      };

      const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '24h' });
      const refreshToken = jwt.sign({ id: user.id }, config.jwtRefreshSecret, { expiresIn: '7d' });

      res.status(201).json({
        success: true,
        message: 'Stakeholder registration successful.',
        data: {
          token,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            fullName: user.fullName,
            role: user.role,
            state: user.state,
            district: user.district,
            profile: user.profile
          }
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, message: 'Internal server error during registration.', error: error.message });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required.' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true }
      });

      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid credentials.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid credentials.' });
        return;
      }

      const tokenPayload = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        state: user.state,
        district: user.district
      };

      const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '24h' });
      const refreshToken = jwt.sign({ id: user.id }, config.jwtRefreshSecret, { expiresIn: '7d' });

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          token,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            fullName: user.fullName,
            role: user.role,
            state: user.state,
            district: user.district,
            profile: user.profile
          }
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Internal server error during login.', error: error.message });
    }
  }

  public static async getMe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { profile: true }
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          fullName: user.fullName,
          role: user.role,
          state: user.state,
          district: user.district,
          profile: user.profile
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error retrieving profile.', error: error.message });
    }
  }

  public static async getOfficers(req: Request, res: Response): Promise<void> {
    try {
      const { role, state } = req.query;

      const whereClause: any = {
        role: { in: ['LMO', 'GATC'] }
      };

      if (role) whereClause.role = String(role);
      if (state) whereClause.state = String(state);

      const officers = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          state: true,
          district: true,
          profile: true
        }
      });

      res.status(200).json({ success: true, data: officers });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Error fetching officers.', error: error.message });
    }
  }
}
