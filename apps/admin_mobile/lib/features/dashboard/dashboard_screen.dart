import 'package:flutter/material.dart';

import '../../theme/app_theme.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  static const _stats = [
    _DashboardStat('Total Siswa', '2.450', Icons.groups_2_outlined, AppTheme.blue),
    _DashboardStat('Bank Soal', '1.250', Icons.quiz_outlined, AppTheme.emerald),
    _DashboardStat('Materi', '86', Icons.menu_book_outlined, Color(0xFFF59E0B)),
    _DashboardStat('Tryout Aktif', '24', Icons.assignment_outlined, Color(0xFF8B5CF6)),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'SUKSES CPNS',
              style: TextStyle(
                color: AppTheme.blue,
                fontSize: 11,
                fontWeight: FontWeight.w800,
                letterSpacing: 1.4,
              ),
            ),
            Text(
              'Dashboard Admin',
              style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Notifikasi',
            onPressed: () {},
            icon: const Icon(Icons.notifications_none_rounded),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: ListView(
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
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Selamat datang kembali 👋',
                  style: TextStyle(color: Colors.white70, fontSize: 13),
                ),
                SizedBox(height: 8),
                Text(
                  'Pantau perkembangan
Sukses CPNS hari ini.',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 23,
                    height: 1.2,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                SizedBox(height: 18),
                Row(
                  children: [
                    Icon(Icons.insights_rounded, color: Colors.white, size: 18),
                    SizedBox(width: 8),
                    Text(
                      'Ringkasan aktivitas platform',
                      style: TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 26),
          const Text(
            'Ringkasan platform',
            style: TextStyle(
              color: AppTheme.ink,
              fontSize: 17,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 14),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _stats.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.35,
            ),
            itemBuilder: (context, index) {
              final stat = _stats[index];
              return Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFE8EEF5)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Icon(stat.icon, color: stat.color, size: 22),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          stat.value,
                          style: const TextStyle(
                            color: AppTheme.ink,
                            fontSize: 23,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        Text(
                          stat.label,
                          style: const TextStyle(
                            color: AppTheme.muted,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 26),
          const Text(
            'Menu cepat',
            style: TextStyle(
              color: AppTheme.ink,
              fontSize: 17,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 14),
          const _QuickAction(
            icon: Icons.person_add_alt_1_rounded,
            title: 'Kelola siswa',
            subtitle: 'Lihat dan atur akun pengguna',
          ),
          const _QuickAction(
            icon: Icons.library_books_outlined,
            title: 'Bank soal',
            subtitle: 'Kelola soal TWK, TIU, dan TKP',
          ),
          const _QuickAction(
            icon: Icons.menu_book_outlined,
            title: 'Materi belajar',
            subtitle: 'Atur materi dan pembelajaran',
          ),
          const SizedBox(height: 12),
          const Text(
            'Angka di atas merupakan data contoh untuk rancangan UI, belum terhubung ke database.',
            style: TextStyle(color: AppTheme.muted, fontSize: 11),
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard_rounded),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.groups_outlined),
            label: 'Siswa',
          ),
          NavigationDestination(
            icon: Icon(Icons.library_books_outlined),
            label: 'Konten',
          ),
          NavigationDestination(
            icon: Icon(Icons.bar_chart_rounded),
            label: 'Laporan',
          ),
          NavigationDestination(
            icon: Icon(Icons.menu_rounded),
            label: 'Lainnya',
          ),
        ],
      ),
    );
  }
}

class _DashboardStat {
  const _DashboardStat(this.label, this.value, this.icon, this.color);

  final String label;
  final String value;
  final IconData icon;
  final Color color;
}

class _QuickAction extends StatelessWidget {
  const _QuickAction({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE8EEF5)),
      ),
      child: Row(
        children: [
          Container(
            height: 44,
            width: 44,
            decoration: BoxDecoration(
              color: AppTheme.blue.withOpacity(0.09),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: AppTheme.blue),
          ),
          const SizedBox(width: 13),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 3),
                Text(
                  subtitle,
                  style: const TextStyle(color: AppTheme.muted, fontSize: 12),
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded, color: AppTheme.muted),
        ],
      ),
    );
  }
}
