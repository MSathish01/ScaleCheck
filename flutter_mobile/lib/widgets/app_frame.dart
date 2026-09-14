import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/inspection_provider.dart';

enum DeviceViewMode { phone, tablet, fluid }

class AppFrameNotifier extends ChangeNotifier {
  static final AppFrameNotifier instance = AppFrameNotifier();
  DeviceViewMode mode = DeviceViewMode.phone;

  void setMode(DeviceViewMode newMode) {
    mode = newMode;
    notifyListeners();
  }
}

class AppFrame extends StatelessWidget {
  final Widget child;

  const AppFrame({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: AppFrameNotifier.instance,
      builder: (context, _) {
        final screenWidth = MediaQuery.of(context).size.width;
        final screenHeight = MediaQuery.of(context).size.height;
        final viewMode = AppFrameNotifier.instance.mode;

        // If on actual mobile device or narrow browser window, render native full-width
        if (screenWidth <= 640) {
          return child;
        }

        // On desktop browser, render the executive GovTech workbench container
        double targetWidth;
        switch (viewMode) {
          case DeviceViewMode.phone:
            targetWidth = 412;
            break;
          case DeviceViewMode.tablet:
            targetWidth = 680;
            break;
          case DeviceViewMode.fluid:
            targetWidth = (screenWidth * 0.75).clamp(480, 960);
            break;
        }

        return Scaffold(
          backgroundColor: const Color(0xFF070F1E),
          body: Stack(
            children: [
              // Ambient Decorative Background Gradients
              Positioned(
                top: -120,
                left: -100,
                child: Container(
                  width: 500,
                  height: 500,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        const Color(0xFF1E3E62).withOpacity(0.4),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
              Positioned(
                bottom: -150,
                right: -100,
                child: Container(
                  width: 600,
                  height: 600,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        const Color(0xFF00ADB5).withOpacity(0.15),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),

              // Main Desktop Layout
              Column(
                children: [
                  // Top GovTech Command Bar
                  _buildDesktopTopBar(context, viewMode),

                  // Center Workspace Area (Bezel Frame + Optional Info Side Panel)
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          // Left Companion Panel (if large screen >= 1150px)
                          if (screenWidth >= 1150) ...[
                            _buildSideInfoPanel(context),
                            const SizedBox(width: 36),
                          ],

                          // Device Bezel / Screen Container
                          Flexible(
                            child: _buildDeviceViewport(
                              child: child,
                              width: targetWidth,
                              screenHeight: screenHeight,
                              viewMode: viewMode,
                            ),
                          ),

                          // Right Companion Panel (if large screen >= 1350px)
                          if (screenWidth >= 1350) ...[
                            const SizedBox(width: 36),
                            _buildSideActionsPanel(context),
                          ],
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDesktopTopBar(BuildContext context, DeviceViewMode currentMode) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF0B192C).withOpacity(0.95),
        border: const Border(
          bottom: BorderSide(color: Color(0xFF1E293B), width: 1),
        ),
      ),
      child: Row(
        children: [
          // National Emblem & Title
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: const Color(0xFF1E3E62),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.3)),
            ),
            child: const Icon(Icons.balance, color: Color(0xFF38BDF8), size: 18),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Text(
                    'ScaleCheck Mobile',
                    style: GoogleFonts.plusJakartaSans(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.2,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0284C7).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: const Color(0xFF38BDF8), width: 0.8),
                    ),
                    child: Text(
                      'FIELD SUITE',
                      style: GoogleFonts.plusJakartaSans(
                        color: const Color(0xFF38BDF8),
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
              Text(
                'Department of Consumer Affairs • Legal Metrology Division',
                style: GoogleFonts.plusJakartaSans(
                  color: const Color(0xFF94A3B8),
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),

          const Spacer(),

          // System Status Indicators
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: const Color(0xFF064E3B).withOpacity(0.3),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF059669)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 7,
                  height: 7,
                  decoration: const BoxDecoration(
                    color: Color(0xFF34D399),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  'API Port 5000: Live',
                  style: GoogleFonts.plusJakartaSans(
                    color: const Color(0xFF6EE7B7),
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),

          // Device Viewport Toggle Buttons
          Container(
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildModeButton(
                  icon: Icons.smartphone,
                  label: 'Phone',
                  isSelected: currentMode == DeviceViewMode.phone,
                  onTap: () => AppFrameNotifier.instance.setMode(DeviceViewMode.phone),
                ),
                _buildModeButton(
                  icon: Icons.tablet_mac,
                  label: 'Tablet',
                  isSelected: currentMode == DeviceViewMode.tablet,
                  onTap: () => AppFrameNotifier.instance.setMode(DeviceViewMode.tablet),
                ),
                _buildModeButton(
                  icon: Icons.laptop_mac,
                  label: 'Responsive',
                  isSelected: currentMode == DeviceViewMode.fluid,
                  onTap: () => AppFrameNotifier.instance.setMode(DeviceViewMode.fluid),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModeButton({
    required IconData icon,
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(7),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF2563EB) : Colors.transparent,
          borderRadius: BorderRadius.circular(7),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 14,
              color: isSelected ? Colors.white : const Color(0xFF94A3B8),
            ),
            const SizedBox(width: 5),
            Text(
              label,
              style: GoogleFonts.plusJakartaSans(
                color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDeviceViewport({
    required Widget child,
    required double width,
    required double screenHeight,
    required DeviceViewMode viewMode,
  }) {
    if (viewMode == DeviceViewMode.fluid) {
      return Container(
        width: width,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.5),
              blurRadius: 32,
              offset: const Offset(0, 16),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: child,
      );
    }

    // Modern Phone/Tablet Bezel
    final isPhone = viewMode == DeviceViewMode.phone;
    final borderRadius = isPhone ? 42.0 : 28.0;

    return Center(
      child: Container(
        width: width,
        constraints: BoxConstraints(
          maxHeight: screenHeight - 110,
        ),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(borderRadius),
          border: Border.all(color: const Color(0xFF334155), width: 3.5),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF000000).withOpacity(0.7),
              blurRadius: 40,
              spreadRadius: 4,
              offset: const Offset(0, 20),
            ),
            BoxShadow(
              color: const Color(0xFF38BDF8).withOpacity(0.08),
              blurRadius: 60,
              spreadRadius: 2,
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(borderRadius - 4),
          child: Stack(
            children: [
              // Screen Content
              Positioned.fill(child: child),

              // Realistic Phone Speaker & Dynamic Camera Notch (Only in Phone Mode)
              if (isPhone)
                Align(
                  alignment: Alignment.topCenter,
                  child: Container(
                    margin: const EdgeInsets.only(top: 8),
                    width: 96,
                    height: 18,
                    decoration: BoxDecoration(
                      color: const Color(0xFF090D16),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: Color(0xFF1E293B),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Container(
                          width: 32,
                          height: 4,
                          decoration: BoxDecoration(
                            color: const Color(0xFF334155),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSideInfoPanel(BuildContext context) {
    return Container(
      width: 280,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: const Color(0xFF0B192C).withOpacity(0.75),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF1E293B)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              const Icon(Icons.verified_user, color: Color(0xFF38BDF8), size: 20),
              const SizedBox(width: 8),
              Text(
                'Statutory Compliance',
                style: GoogleFonts.plusJakartaSans(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _buildInfoItem(
            icon: Icons.shield_outlined,
            title: 'Tamper-Evident Stamps',
            desc: 'Cryptographic SHA-256 seal verification on scale plates.',
          ),
          const SizedBox(height: 12),
          _buildInfoItem(
            icon: Icons.offline_bolt_outlined,
            title: 'Offline-First SQLite',
            desc: 'Field officers record tests in remote mandi zones without network.',
          ),
          const SizedBox(height: 12),
          _buildInfoItem(
            icon: Icons.rule_folder_outlined,
            title: 'Form VIII Generation',
            desc: 'Instant statutory rejection notices under LM Act 2009 Section 24.',
          ),
          const SizedBox(height: 12),
          _buildInfoItem(
            icon: Icons.pin_drop_outlined,
            title: 'Rule 24 Geo-Fencing',
            desc: 'Latches exact GPS coordinates for statutory proof of inspection.',
          ),
        ],
      ),
    );
  }

  Widget _buildSideActionsPanel(BuildContext context) {
    return Container(
      width: 250,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0B192C).withOpacity(0.75),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Quick Demonstrations',
            style: GoogleFonts.plusJakartaSans(
              color: Colors.white,
              fontWeight: FontWeight.w700,
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 12),
          _buildQuickActionButton(
            label: 'Toggle Network Mode',
            icon: Icons.wifi,
            color: const Color(0xFF2563EB),
            onTap: () {
              context.read<InspectionProvider>().toggleOfflineMode();
            },
          ),
          const SizedBox(height: 8),
          _buildQuickActionButton(
            label: 'Reload Sample Jobs',
            icon: Icons.refresh,
            color: const Color(0xFF059669),
            onTap: () {
              context.read<InspectionProvider>().refreshLocalData();
            },
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '💡 Pro-Tip:',
                  style: GoogleFonts.plusJakartaSans(
                    color: const Color(0xFFFBBF24),
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Switch between Phone and Tablet frames above to test responsive form inputs and table layouts.',
                  style: GoogleFonts.plusJakartaSans(
                    color: const Color(0xFF94A3B8),
                    fontSize: 11,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoItem({
    required IconData icon,
    required String title,
    required String desc,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: const Color(0xFF38BDF8), size: 16),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: GoogleFonts.plusJakartaSans(
                  color: const Color(0xFFE2E8F0),
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Text(
                desc,
                style: GoogleFonts.plusJakartaSans(
                  color: const Color(0xFF94A3B8),
                  fontSize: 10.5,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActionButton({
    required String label,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
        decoration: BoxDecoration(
          color: color.withOpacity(0.15),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withOpacity(0.4)),
        ),
        child: Row(
          children: [
            Icon(icon, size: 15, color: color),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                label,
                style: GoogleFonts.plusJakartaSans(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
