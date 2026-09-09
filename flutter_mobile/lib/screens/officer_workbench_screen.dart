import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/inspection_provider.dart';
import '../data/models/assigned_job.dart';
import 'inspection_form_screen.dart';
import 'rejection_notice_screen.dart';
import 'qr_scanner_screen.dart';

class OfficerWorkbenchScreen extends StatelessWidget {
  const OfficerWorkbenchScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<InspectionProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Legal Metrology Workbench'),
            Text(
              provider.currentUser?['fullName'] ?? 'Field Officer',
              style: const TextStyle(fontSize: 11, color: Colors.white70, fontWeight: FontWeight.normal),
            ),
          ],
        ),
        actions: [
          // Offline / Online Toggle Button
          IconButton(
            tooltip: provider.isOfflineMode ? 'Currently Offline (Click to go Online)' : 'Online (Click to simulate Offline)',
            icon: Icon(
              provider.isOfflineMode ? Icons.wifi_off : Icons.wifi,
              color: provider.isOfflineMode ? Colors.amberAccent : Colors.lightGreenAccent,
            ),
            onPressed: () => provider.toggleOfflineMode(),
          ),
          // Refresh / Download
          IconButton(
            tooltip: 'Download / Refresh Assignments',
            icon: provider.isLoading
                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Icon(Icons.download),
            onPressed: provider.isOfflineMode ? null : () => provider.downloadAssignedJobs(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF0F2B5C),
        foregroundColor: Colors.white,
        icon: const Icon(Icons.qr_code_scanner),
        label: const Text('Scan QR Seal', style: TextStyle(fontWeight: FontWeight.bold)),
        onPressed: () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const QrScannerScreen()));
        },
      ),
      body: Column(
        children: [
          // Status Mode Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: provider.isOfflineMode ? Colors.amber[100] : const Color(0xFFE0F2FE),
            child: Row(
              children: [
                Icon(
                  provider.isOfflineMode ? Icons.cloud_off : Icons.cloud_done,
                  size: 20,
                  color: provider.isOfflineMode ? Colors.brown : const Color(0xFF0369A1),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    provider.isOfflineMode
                      ? 'OFFLINE MODE: Storing inspections to local SQLite queue.'
                      : 'ONLINE: Connected to Department Central Ledger.',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: provider.isOfflineMode ? Colors.brown[900] : const Color(0xFF0369A1),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Pending Queue Synchronization Bar (if any pending)
          if (provider.pendingQueue.isNotEmpty)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: const Color(0xFFFEF3C7), // Warm yellow
              child: Row(
                children: [
                  const Icon(Icons.sync_problem, color: Color(0xFFB45309), size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      '${provider.pendingQueue.length} inspections stored offline ready to sync.',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF78350F)),
                    ),
                  ),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFB45309),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    ),
                    icon: provider.isSyncing
                        ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.upload, size: 14),
                    label: const Text('Sync Now', style: TextStyle(fontSize: 11)),
                    onPressed: (provider.isOfflineMode || provider.isSyncing)
                        ? null
                        : () async {
                            final msg = await provider.syncPendingQueue();
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
                          },
                  ),
                ],
              ),
            ),

          // Header Stats
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Assigned Field Inspections (${provider.jobs.length})',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.extrabold, color: Color(0xFF1E293B)),
                ),
                Text(
                  'Jurisdiction: ${provider.currentUser?['district'] ?? 'Puducherry'}',
                  style: const TextStyle(fontSize: 11, color: Colors.black54),
                ),
              ],
            ),
          ),

          // Inspection Jobs List
          Expanded(
            child: provider.jobs.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey[400]),
                        const SizedBox(height: 12),
                        const Text('No inspections currently assigned in SQLite queue.', style: TextStyle(color: Colors.black54)),
                        const SizedBox(height: 8),
                        if (!provider.isOfflineMode)
                          OutlinedButton.icon(
                            icon: const Icon(Icons.download, size: 16),
                            label: const Text('Fetch Assigned Jobs'),
                            onPressed: () => provider.downloadAssignedJobs(),
                          ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemCount: provider.jobs.length,
                    itemBuilder: (context, index) {
                      final job = provider.jobs[index];
                      return _JobCard(job: job);
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class _JobCard extends StatelessWidget {
  final AssignedJob job;
  const _JobCard({required this.job});

  Color _getStatusColor(String status) {
    switch (status) {
      case 'CERTIFIED':
        return const Color(0xFF047857);
      case 'INSPECTION_COMPLETED':
        return const Color(0xFF0D9488);
      case 'SCHEDULED':
        return const Color(0xFF1D4ED8);
      case 'REJECTED':
        return const Color(0xFFBE123C);
      default:
        return const Color(0xFFB45309);
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor(job.status);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: App Number & Status Badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  job.applicationNumber,
                  style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, color: Color(0xFF0F2B5C)),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: statusColor.withOpacity(0.3)),
                  ),
                  child: Text(
                    job.status,
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.extrabold, color: statusColor),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Trader & Address
            Text(
              job.traderName,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
            ),
            Text(
              job.premisesAddress,
              style: const TextStyle(fontSize: 11, color: Colors.black54),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 10),

            // Instrument Specifications
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Serial: ${job.instrumentSerial}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                      Text('${job.category} • ${job.instrumentModel}', style: const TextStyle(fontSize: 10, color: Colors.black54)),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(6)),
                    child: Text(job.accuracyClass, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF1D4ED8))),
                  ),
                ],
              ),
            ),

            if (job.status == 'REJECTED' && job.rejectionReason != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: Colors.red[50], borderRadius: BorderRadius.circular(8)),
                child: Text(
                  'Reason: ${job.rejectionReason}',
                  style: TextStyle(fontSize: 10, color: Colors.red[900], fontWeight: FontWeight.w600),
                ),
              ),
            ],

            const SizedBox(height: 12),

            // Actions Buttons Row
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                // If REJECTED: View Notice + Edit/Re-inspect
                if (job.status == 'REJECTED') ...[
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red[800],
                      side: BorderSide(color: Colors.red[300]!),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    ),
                    icon: const Icon(Icons.warning_amber, size: 14),
                    label: const Text('Form VIII Notice', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => RejectionNoticeScreen(job: job)));
                    },
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.amber[800],
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    ),
                    icon: const Icon(Icons.edit, size: 14),
                    label: const Text('Re-Inspect', style: TextStyle(fontSize: 11)),
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => InspectionFormScreen(job: job, isEditing: true)));
                    },
                  ),
                ]
                // If SCHEDULED: Record Observation
                else if (job.status == 'SCHEDULED' || job.status == 'ALLOCATED') ...[
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F2B5C)),
                    icon: const Icon(Icons.assignment, size: 14),
                    label: const Text('Record Observation', style: TextStyle(fontSize: 11)),
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => InspectionFormScreen(job: job, isEditing: false)));
                    },
                  ),
                ]
                // If COMPLETED or CERTIFIED: Edit / View
                else ...[
                  if (job.securitySealNumber != null)
                    Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: Text('Seal: ${job.securitySealNumber}', style: const TextStyle(fontSize: 11, fontFamily: 'monospace', fontWeight: FontWeight.bold)),
                    ),
                  OutlinedButton.icon(
                    icon: const Icon(Icons.edit, size: 14),
                    label: const Text('Amend / Edit', style: TextStyle(fontSize: 11)),
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => InspectionFormScreen(job: job, isEditing: true)));
                    },
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}
