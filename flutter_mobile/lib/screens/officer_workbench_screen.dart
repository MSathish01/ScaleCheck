import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/inspection_provider.dart';
import '../data/models/assigned_job.dart';
import 'inspection_form_screen.dart';
import 'rejection_notice_screen.dart';
import 'qr_scanner_screen.dart';
import 'login_screen.dart';

class OfficerWorkbenchScreen extends StatefulWidget {
  const OfficerWorkbenchScreen({super.key});

  @override
  State<OfficerWorkbenchScreen> createState() => _OfficerWorkbenchScreenState();
}

class _OfficerWorkbenchScreenState extends State<OfficerWorkbenchScreen> {
  String _selectedFilter = 'ALL';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _handleLogout() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Sign Out', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.bold)),
        content: Text(
          'Are you sure you want to sign out of the Legal Metrology field terminal?',
          style: GoogleFonts.plusJakartaSans(fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: GoogleFonts.plusJakartaSans(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE11D48)),
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
            },
            child: Text('Sign Out', style: GoogleFonts.plusJakartaSans(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<InspectionProvider>();
    final user = provider.currentUser;

    // Filter jobs
    final filteredJobs = provider.jobs.where((job) {
      if (_selectedFilter == 'PENDING' && job.status != 'PENDING' && job.status != 'IN_PROGRESS') {
        return false;
      }
      if (_selectedFilter == 'VERIFIED' && job.status != 'VERIFIED') {
        return false;
      }
      if (_selectedFilter == 'REJECTED' && job.status != 'REJECTED') {
        return false;
      }
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchName = job.traderName.toLowerCase().contains(q);
        final matchSerial = job.instrumentSerial.toLowerCase().contains(q);
        final matchApp = job.applicationNumber.toLowerCase().contains(q);
        return matchName || matchSerial || matchApp;
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B192C),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF1E3E62),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.balance, size: 18, color: Color(0xFF38BDF8)),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Field Workbench',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    user?['fullName'] ?? 'Field Officer • LMO',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 11,
                      color: const Color(0xFF94A3B8),
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          // Online/Offline Status Switch
          IconButton(
            tooltip: provider.isOfflineMode ? 'Offline Mode (Click for Online)' : 'Online Mode (Click to test Offline)',
            icon: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: provider.isOfflineMode ? const Color(0xFFD97706).withOpacity(0.2) : const Color(0xFF059669).withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: provider.isOfflineMode ? const Color(0xFFF59E0B) : const Color(0xFF10B981),
                  width: 1,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    provider.isOfflineMode ? Icons.cloud_off : Icons.cloud_done,
                    size: 14,
                    color: provider.isOfflineMode ? const Color(0xFFFBBF24) : const Color(0xFF34D399),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    provider.isOfflineMode ? 'OFFLINE' : 'ONLINE',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: provider.isOfflineMode ? const Color(0xFFFBBF24) : const Color(0xFF34D399),
                    ),
                  ),
                ],
              ),
            ),
            onPressed: () => provider.toggleOfflineMode(),
          ),

          // Logout Action
          IconButton(
            tooltip: 'Sign Out',
            icon: const Icon(Icons.logout, size: 20, color: Color(0xFFCBD5E1)),
            onPressed: _handleLogout,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF0F2B5C),
        foregroundColor: Colors.white,
        elevation: 4,
        icon: const Icon(Icons.qr_code_scanner, size: 20),
        label: Text(
          'Scan QR Seal',
          style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, fontSize: 13),
        ),
        onPressed: () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const QrScannerScreen()));
        },
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          if (!provider.isOfflineMode) {
            await provider.downloadAssignedJobs();
          } else {
            await provider.refreshLocalData();
          }
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Pending Queue Alert Banner (If Any Items Need Syncing)
              if (provider.pendingQueue.isNotEmpty) ...[
                _buildSyncBanner(context, provider),
                const SizedBox(height: 14),
              ],

              // Metric Dashboard Cards
              _buildMetricsRow(provider),
              const SizedBox(height: 16),

              // Search & Filter Bar
              _buildSearchBar(),
              const SizedBox(height: 12),

              // Filter Tabs
              _buildFilterChips(provider),
              const SizedBox(height: 16),

              // Section Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Statutory Inspection Roster (${filteredJobs.length})',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFF0F172A),
                    ),
                  ),
                  if (provider.isLoading)
                    const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                ],
              ),
              const SizedBox(height: 10),

              // Jobs List
              if (filteredJobs.isEmpty)
                _buildEmptyState()
              else
                ...filteredJobs.map((job) => _buildJobCard(context, job)),

              const SizedBox(height: 70), // Bottom padding for FAB
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSyncBanner(BuildContext context, InspectionProvider provider) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFFCD34D)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFD97706).withOpacity(0.08),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          const Icon(Icons.sync_problem, color: Color(0xFFD97706), size: 22),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${provider.pendingQueue.length} Inspections Pending Sync',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF92400E),
                  ),
                ),
                Text(
                  'Saved securely to SQLite. Ready to upload to central ledger.',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 10.5,
                    color: const Color(0xFFB45309),
                  ),
                ),
              ],
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFD97706),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: provider.isSyncing
                ? null
                : () async {
                    final msg = await provider.syncPendingQueue();
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(msg), backgroundColor: const Color(0xFF059669)),
                      );
                    }
                  },
            child: provider.isSyncing
                ? const SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : Text('Sync Now', style: GoogleFonts.plusJakartaSans(fontSize: 11, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricsRow(InspectionProvider provider) {
    final total = provider.jobs.length;
    final verified = provider.jobs.where((j) => j.status == 'VERIFIED').length;
    final rejected = provider.jobs.where((j) => j.status == 'REJECTED').length;
    final pending = total - verified - rejected;

    return Row(
      children: [
        Expanded(
          child: _buildMetricTile(
            label: 'Total Queue',
            count: total.toString(),
            icon: Icons.assignment_outlined,
            color: const Color(0xFF2563EB),
            bg: const Color(0xFFEFF6FF),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildMetricTile(
            label: 'Pending',
            count: pending.toString(),
            icon: Icons.pending_actions_outlined,
            color: const Color(0xFFD97706),
            bg: const Color(0xFFFFFBEB),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildMetricTile(
            label: 'Verified',
            count: verified.toString(),
            icon: Icons.check_circle_outline,
            color: const Color(0xFF059669),
            bg: const Color(0xFFECFDF5),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildMetricTile(
            label: 'Form VIII',
            count: rejected.toString(),
            icon: Icons.cancel_outlined,
            color: const Color(0xFFE11D48),
            bg: const Color(0xFFFFF1F2),
          ),
        ),
      ],
    );
  }

  Widget _buildMetricTile({
    required String label,
    required String count,
    required IconData icon,
    required Color color,
    required Color bg,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(height: 4),
          Text(
            count,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: color,
            ),
          ),
          Text(
            label,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 9.5,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF475569),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: TextField(
        controller: _searchController,
        onChanged: (val) => setState(() => _searchQuery = val),
        style: GoogleFonts.plusJakartaSans(fontSize: 13),
        decoration: InputDecoration(
          hintText: 'Search by trader name, scale serial, or app #...',
          hintStyle: GoogleFonts.plusJakartaSans(fontSize: 12, color: const Color(0xFF94A3B8)),
          prefixIcon: const Icon(Icons.search, size: 18, color: Color(0xFF64748B)),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear, size: 16),
                  onPressed: () {
                    _searchController.clear();
                    setState(() => _searchQuery = '');
                  },
                )
              : null,
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          focusedBorder: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        ),
      ),
    );
  }

  Widget _buildFilterChips(InspectionProvider provider) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildFilterChip('ALL', 'All Jobs (${provider.jobs.length})'),
          const SizedBox(width: 8),
          _buildFilterChip('PENDING', 'Pending'),
          const SizedBox(width: 8),
          _buildFilterChip('VERIFIED', 'Passed & Stamped'),
          const SizedBox(width: 8),
          _buildFilterChip('REJECTED', 'Form VIII Notice'),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final isSelected = _selectedFilter == key;
    return InkWell(
      onTap: () => setState(() => _selectedFilter = key),
      borderRadius: BorderRadius.circular(20),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0F2B5C) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF0F2B5C) : const Color(0xFFCBD5E1),
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
            color: isSelected ? Colors.white : const Color(0xFF475569),
          ),
        ),
      ),
    );
  }

  Widget _buildJobCard(BuildContext context, AssignedJob job) {
    Color statusColor;
    String statusLabel;
    IconData statusIcon;

    switch (job.status) {
      case 'VERIFIED':
        statusColor = const Color(0xFF059669);
        statusLabel = 'STAMPED PASS';
        statusIcon = Icons.check_circle;
        break;
      case 'REJECTED':
        statusColor = const Color(0xFFE11D48);
        statusLabel = 'FORM VIII ISSUED';
        statusIcon = Icons.error;
        break;
      default:
        statusColor = const Color(0xFF2563EB);
        statusLabel = 'STATUTORY PENDING';
        statusIcon = Icons.schedule;
        break;
    }

    // Category Icon
    IconData categoryIcon = Icons.scale;
    if (job.category.toLowerCase().contains('dispenser') || job.category.toLowerCase().contains('fuel')) {
      categoryIcon = Icons.local_gas_station;
    } else if (job.category.toLowerCase().contains('weighbridge')) {
      categoryIcon = Icons.directions_boat_filled;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Category & Status Badge
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(categoryIcon, size: 18, color: const Color(0xFF0F2B5C)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        job.category,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF0F172A),
                        ),
                      ),
                      Text(
                        'App: ${job.applicationNumber} • S/N: ${job.instrumentSerial}',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          color: const Color(0xFF64748B),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: statusColor.withOpacity(0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(statusIcon, size: 12, color: statusColor),
                      const SizedBox(width: 4),
                      Text(
                        statusLabel,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w800,
                          color: statusColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Middle Specs Pill Row
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: _buildSpecItem('Capacity', job.capacity),
                  ),
                  Container(width: 1, height: 22, color: const Color(0xFFCBD5E1)),
                  Expanded(
                    child: _buildSpecItem('Accuracy', job.accuracyClass),
                  ),
                  Container(width: 1, height: 22, color: const Color(0xFFCBD5E1)),
                  Expanded(
                    child: _buildSpecItem('Scheduled', job.scheduledDate ?? 'Today'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),

            // Trader & Address
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.storefront, size: 15, color: Color(0xFF64748B)),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    '${job.traderName} — ${job.premisesAddress}',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 11.5,
                      color: const Color(0xFF334155),
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Action Buttons
            Row(
              children: [
                if (job.status == 'REJECTED') ...[
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        side: const BorderSide(color: Color(0xFFE11D48)),
                        foregroundColor: const Color(0xFFE11D48),
                        backgroundColor: const Color(0xFFFFF1F2),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.description, size: 15),
                      label: Text(
                        'View Form VIII Notice',
                        style: GoogleFonts.plusJakartaSans(fontSize: 11.5, fontWeight: FontWeight.bold),
                      ),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => RejectionNoticeScreen(job: job)),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                ],
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F2B5C),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: Icon(
                      job.status == 'VERIFIED' ? Icons.remove_red_eye : Icons.verified,
                      size: 15,
                    ),
                    label: Text(
                      job.status == 'VERIFIED' ? 'View Stamp & Cert' : 'Perform Verification',
                      style: GoogleFonts.plusJakartaSans(fontSize: 11.5, fontWeight: FontWeight.bold),
                    ),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => InspectionFormScreen(job: job, isEditing: job.status != 'PENDING'),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSpecItem(String title, String val) {
    return Column(
      children: [
        Text(
          title,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 9.5,
            color: const Color(0xFF64748B),
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          val,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF0F172A),
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          const Icon(Icons.inbox_outlined, size: 48, color: Color(0xFF94A3B8)),
          const SizedBox(height: 12),
          Text(
            'No matching statutory jobs',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF334155),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Try changing your filter query or tap refresh.',
            style: GoogleFonts.plusJakartaSans(fontSize: 12, color: const Color(0xFF64748B)),
          ),
        ],
      ),
    );
  }
}
