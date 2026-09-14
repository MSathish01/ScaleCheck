import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/inspection_provider.dart';
import 'officer_workbench_screen.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController(text: 'lmo@scalecheck.gov.in');
  final TextEditingController _passwordController = TextEditingController(text: 'Officer@123');
  bool _obscurePassword = true;
  String _selectedRole = 'LMO';

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final provider = context.read<InspectionProvider>();
    try {
      await provider.login(_emailController.text.trim(), _passwordController.text.trim());
      if (mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const OfficerWorkbenchScreen()),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Server offline or auth mismatch. You can continue in Offline Field Mode.',
              style: GoogleFonts.plusJakartaSans(fontSize: 12, fontWeight: FontWeight.w600),
            ),
            backgroundColor: const Color(0xFFD97706),
            duration: const Duration(seconds: 4),
            action: SnackBarAction(
              label: 'Go Offline',
              textColor: Colors.white,
              onPressed: () => _handleOfflineLogin(_selectedRole),
            ),
          ),
        );
      }
    }
  }

  Future<void> _handleOfflineLogin([String role = 'LMO']) async {
    if (mounted) ScaffoldMessenger.of(context).hideCurrentSnackBar();
    final provider = context.read<InspectionProvider>();
    await provider.loginOffline(role: role);
    if (mounted) {
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const OfficerWorkbenchScreen()),
      );
    }
  }

  void _selectRole(String role) {
    setState(() {
      _selectedRole = role;
      if (role == 'LMO') {
        _emailController.text = 'lmo.puducherry@gov.in';
        _passwordController.text = 'Officer@123';
      } else if (role == 'GATC') {
        _emailController.text = 'gatc.south@testlab.org';
        _passwordController.text = 'Gatc@123';
      } else {
        _emailController.text = 'trader.mandi@chennai.com';
        _passwordController.text = 'Trader@123';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<InspectionProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Emblem & Official Branding Header
                Center(
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [Color(0xFF0F2B5C), Color(0xFF1E3E62)],
                          ),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF0F2B5C).withOpacity(0.35),
                              blurRadius: 20,
                              offset: const Offset(0, 10),
                            ),
                          ],
                          border: Border.all(color: const Color(0xFFD4AF37), width: 2), // Official Gold Border
                        ),
                        child: const Icon(Icons.balance, size: 40, color: Colors.white),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: Color(0xFF059669),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.verified, size: 14, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Title & Subtitle
                Center(
                  child: Column(
                    children: [
                      Text(
                        'ScaleCheck Mobile',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF0B192C),
                          letterSpacing: -0.4,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Legal Metrology Field Officer & Verification Suite',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: const Color(0xFF64748B),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Text(
                          'Govt. of India • DoCA e-Governance',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF475569),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Role Quick Switcher Card
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.bolt, color: Color(0xFFD97706), size: 16),
                          const SizedBox(width: 6),
                          Text(
                            'Select Demo Role / Profile:',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF1E293B),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: _buildRoleSelector(
                              roleId: 'LMO',
                              title: 'LMO Inspector',
                              icon: Icons.shield,
                              isSelected: _selectedRole == 'LMO',
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _buildRoleSelector(
                              roleId: 'GATC',
                              title: 'GATC Lab',
                              icon: Icons.science,
                              isSelected: _selectedRole == 'GATC',
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _buildRoleSelector(
                              roleId: 'TRADER',
                              title: 'Trader',
                              icon: Icons.store,
                              isSelected: _selectedRole == 'TRADER',
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Main Credential Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0F172A).withOpacity(0.06),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Email Field
                      TextField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: const Color(0xFF0F172A),
                        ),
                        decoration: InputDecoration(
                          labelText: 'Official ID / Government Email',
                          prefixIcon: const Icon(Icons.badge_outlined, color: Color(0xFF2563EB), size: 20),
                          hintText: 'e.g. lmo@scalecheck.gov.in',
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Password Field
                      TextField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: const Color(0xFF0F172A),
                        ),
                        decoration: InputDecoration(
                          labelText: 'Password',
                          prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF2563EB), size: 20),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                              color: const Color(0xFF94A3B8),
                              size: 20,
                            ),
                            onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Primary Sign In Button
                      ElevatedButton(
                        onPressed: provider.isLoading ? null : _handleLogin,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0B192C),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 15),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 2,
                        ),
                        child: provider.isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.login, size: 18),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Sign In & Access Field Queue',
                                    style: GoogleFonts.plusJakartaSans(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 14,
                                    ),
                                  ),
                                ],
                              ),
                      ),
                      const SizedBox(height: 12),

                      // Offline Direct Mode Button
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 13),
                          side: const BorderSide(color: Color(0xFFD97706), width: 1.5),
                          backgroundColor: const Color(0xFFFFFBEB),
                          foregroundColor: const Color(0xFFB45309),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: const Icon(Icons.offline_bolt, size: 18, color: Color(0xFFD97706)),
                        label: Text(
                          'Continue in Offline Field Mode',
                          style: GoogleFonts.plusJakartaSans(
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                          ),
                        ),
                        onPressed: provider.isLoading ? null : () => _handleOfflineLogin(_selectedRole),
                      ),
                      const SizedBox(height: 20),

                      // Registration Section Divider
                      Row(
                        children: [
                          const Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 10),
                            child: Text(
                              'NEW STAKEHOLDER REGISTRATION',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                color: const Color(0xFF64748B),
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          const Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                        ],
                      ),
                      const SizedBox(height: 14),

                      // Two Registration Options: Shop Owner & Officer
                      Row(
                        children: [
                          Expanded(
                            child: InkWell(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => const RegisterScreen(initialRole: 'TRADER'),
                                  ),
                                );
                              },
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFEFF6FF),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: const Color(0xFFBFDBFE)),
                                ),
                                child: Column(
                                  children: [
                                    const Icon(Icons.storefront, color: Color(0xFF2563EB), size: 22),
                                    const SizedBox(height: 6),
                                    Text(
                                      'Shop Owner',
                                      style: GoogleFonts.plusJakartaSans(
                                        fontSize: 11.5,
                                        fontWeight: FontWeight.w800,
                                        color: const Color(0xFF1E40AF),
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      'Register Scales',
                                      style: GoogleFonts.plusJakartaSans(
                                        fontSize: 9.5,
                                        color: const Color(0xFF3B82F6),
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: InkWell(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => const RegisterScreen(initialRole: 'LMO'),
                                  ),
                                );
                              },
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF0FDF4),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: const Color(0xFFBBF7D0)),
                                ),
                                child: Column(
                                  children: [
                                    const Icon(Icons.shield_outlined, color: Color(0xFF059669), size: 22),
                                    const SizedBox(height: 6),
                                    Text(
                                      'Field Officer',
                                      style: GoogleFonts.plusJakartaSans(
                                        fontSize: 11.5,
                                        fontWeight: FontWeight.w800,
                                        color: const Color(0xFF065F46),
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      'Legal Metrology',
                                      style: GoogleFonts.plusJakartaSans(
                                        fontSize: 9.5,
                                        color: const Color(0xFF10B981),
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Footer Metadata
                Center(
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 7,
                        height: 7,
                        decoration: const BoxDecoration(
                          color: Color(0xFF10B981),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Statutory Legal Metrology Rules (2011) Compliant',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRoleSelector({
    required String roleId,
    required String title,
    required IconData icon,
    required bool isSelected,
  }) {
    return InkWell(
      onTap: () => _selectRole(roleId),
      borderRadius: BorderRadius.circular(10),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0F2B5C) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? const Color(0xFF0F2B5C) : const Color(0xFFE2E8F0),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 16,
              color: isSelected ? Colors.white : const Color(0xFF64748B),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              textAlign: TextAlign.center,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? Colors.white : const Color(0xFF334155),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
