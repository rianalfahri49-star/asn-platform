import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../theme/app_theme.dart';
import 'admin_dashboard_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late final AdminDashboardService _service;
  late Future<DashboardMetrics> _metrics;

  @override
  void initState() {
    super.initState();
    _service = AdminDashboardService(Supabase.instance.client);
    _metrics = _service.loadMetrics();
  }

  Future<void> _refresh() async {
    final next = _service.loadMetrics();
    setState(() => _metrics = next);
    await next;
  }

  Future<void> _signOut() async {
    await Supabase.instance.client.auth.signOut();
    if (!mounted) return;
    Navigator.of(context).pushNamedAndRemoveUntil('/', (_) => false);
  }

  @override
  Widget build(BuildContext context) {
    final email = Supabase.instance.client.auth.currentUser?.email ?? 'Administrator';

    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('SUKSES CPNS', style: TextStyle(
              color: AppTheme.blue, fontSize: 11,
              fontWeight: FontWeight.w800, letterSpacing: 1.4,
            )),
            Text('Dashboard Admin', style: TextStyle(
              fontSize: 19, fontWeight: FontWeight.w800,
            )),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Keluar',
            onPressed: _signOut,
            icon: const Icon(Icons.logout_rounded),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Selamat datang kembali 👋',
                    style: TextStyle(color: Colors.white70, fontSize: 13)),
                  const SizedBox(height: 8),
                  const Text('Pantau perkembangan platform belajar Sukses CPNS.',
                    style: TextStyle(color: Colors.white, fontSize: 23,
                      height: 1.2, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 18),
                  Row(children: [
                    const Icon(Icons.verified_user_outlined,
                      color: Colors.white, size: 17),
                    const SizedBox(width: 8),
                    Expanded(child: Text(email,
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                      overflow: TextOverflow.ellipsis)),
                  ]),
                ],
              ),
            ),
            const SizedBox(height: 26),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Ringkasan platform', style: TextStyle(
                  color: AppTheme.ink, fontSize: 17, fontWeight: FontWeight.w800)),
                IconButton(
                  tooltip: 'Muat ulang data',
                  onPressed: _refresh,
                  icon: const Icon(Icons.refresh_rounded),
                ),
              ],
            ),
            const SizedBox(height: 8),
            FutureBuilder<DashboardMetrics>(
              future: _metrics,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting &&
                    !snapshot.hasData) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 42),
                    child: Center(child: CircularProgressIndicator()),
                  );
                }
                if (snapshot.hasError) {
                  return _ErrorPanel(
                    message: 'Data dashboard belum dapat dimuat. Periksa koneksi dan kebijakan akses Supabase.',
                    onRetry: _refresh,
                  );
                }
                final data = snapshot.data;
                if (data == null) {
                  return _ErrorPanel(message: 'Belum ada data yang dapat ditampilkan.',
                    onRetry: _refresh);
                }
                final stats = [
                  _DashboardStat('Akun terdaftar', data.students,
                    Icons.groups_2_outlined, AppTheme.blue),
                  _DashboardStat('Bank soal', data.questions,
                    Icons.quiz_outlined, AppTheme.emerald),
                  _DashboardStat('Materi belajar', data.materials,
                    Icons.menu_book_outlined, const Color(0xFFF59E0B)),
                  _DashboardStat('Pengerjaan ujian', data.examAttempts,
                    Icons.assignment_outlined, const Color(0xFF8B5CF6)),
                ];
                return Column(
                  children: [
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: stats.length,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2, crossAxisSpacing: 12,
                        mainAxisSpacing: 12, childAspectRatio: 1.35,
                      ),
                      itemBuilder: (context, index) => _StatCard(stat: stats[index]),
                    ),
                    if (data.errors.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF7ED),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFFFED7AA)),
                        ),
                        child: const Text(
                          'Sebagian data belum bisa dibaca. Pastikan tabel tersedia dan kebijakan RLS mengizinkan admin yang sudah terverifikasi.',
                          style: TextStyle(fontSize: 12, color: Color(0xFF9A3412)),
                        ),
                      ),
                    ],
                  ],
                );
              },
            ),
            const SizedBox(height: 26),
            const Text('Menu administrasi', style: TextStyle(
              color: AppTheme.ink, fontSize: 17, fontWeight: FontWeight.w800)),
            const SizedBox(height: 12),
            const _ModuleTile(
              icon: Icons.people_alt_outlined, title: 'Manajemen siswa',
              subtitle: 'Daftar akun, status, dan aktivitas siswa',
            ),
            const _ModuleTile(
              icon: Icons.library_books_outlined, title: 'Bank soal',
              subtitle: 'Kelola soal TWK, TIU, dan TKP',
            ),
            const _ModuleTile(
              icon: Icons.menu_book_outlined, title: 'Materi belajar',
              subtitle: 'Kelola materi dan kategori pembelajaran',
            ),
            const _ModuleTile(
              icon: Icons.analytics_outlined, title: 'Laporan dan hasil',
              subtitle: 'Pantau hasil ujian dan perkembangan siswa',
            ),
            const SizedBox(height: 12),
            const Text(
              'Angka ringkasan diambil langsung dari jumlah baris tabel Supabase. '
              'Akun terdaftar mencakup semua profil; pemisahan siswa dan admin '
              'akan diterapkan setelah skema peran profil dipastikan.',
              style: TextStyle(color: AppTheme.muted, fontSize: 11, height: 1.5),
            ),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard_rounded), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.groups_outlined), label: 'Siswa'),
          NavigationDestination(icon: Icon(Icons.library_books_outlined), label: 'Konten'),
          NavigationDestination(icon: Icon(Icons.bar_chart_rounded), label: 'Laporan'),
          NavigationDestination(icon: Icon(Icons.menu_rounded), label: 'Lainnya'),
        ],
      ),
    );
  }
}

class _DashboardStat {
  const _DashboardStat(this.label, this.value, this.icon, this.color);
  final String label;
  final int value;
  final IconData icon;
  final Color color;
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.stat});
  final _DashboardStat stat;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white, borderRadius: BorderRadius.circular(20),
      border: Border.all(color: const Color(0xFFE8EEF5)),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Icon(stat.icon, color: stat.color, size: 22),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(stat.value.toString(), style: const TextStyle(
            color: AppTheme.ink, fontSize: 23, fontWeight: FontWeight.w800)),
          Text(stat.label, style: const TextStyle(
            color: AppTheme.muted, fontSize: 12)),
        ]),
      ],
    ),
  );
}

class _ModuleTile extends StatelessWidget {
  const _ModuleTile({required this.icon, required this.title, required this.subtitle});
  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(bottom: 10),
    padding: const EdgeInsets.all(15),
    decoration: BoxDecoration(
      color: Colors.white, borderRadius: BorderRadius.circular(18),
      border: Border.all(color: const Color(0xFFE8EEF5)),
    ),
    child: Row(children: [
      Container(
        height: 44, width: 44,
        decoration: BoxDecoration(
          color: AppTheme.blue.withValues(alpha: 0.09),
          borderRadius: BorderRadius.circular(14)),
        child: Icon(icon, color: AppTheme.blue),
      ),
      const SizedBox(width: 13),
      Expanded(child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 3),
          Text(subtitle, style: const TextStyle(color: AppTheme.muted, fontSize: 12)),
        ],
      )),
      const Icon(Icons.chevron_right_rounded, color: AppTheme.muted),
    ]),
  );
}

class _ErrorPanel extends StatelessWidget {
  const _ErrorPanel({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(18),
    decoration: BoxDecoration(
      color: const Color(0xFFFFF7ED), borderRadius: BorderRadius.circular(18)),
    child: Column(children: [
      Text(message, textAlign: TextAlign.center,
        style: const TextStyle(color: AppTheme.ink, fontSize: 13)),
      const SizedBox(height: 12),
      OutlinedButton.icon(
        onPressed: onRetry, icon: const Icon(Icons.refresh_rounded),
        label: const Text('Coba lagi'),
      ),
    ]),
  );
}
