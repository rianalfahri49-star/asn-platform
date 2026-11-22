import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../theme/app_theme.dart';
import 'admin_students_service.dart';

class StudentsScreen extends StatefulWidget {
  const StudentsScreen({super.key});

  @override
  State<StudentsScreen> createState() => _StudentsScreenState();
}

class _StudentsScreenState extends State<StudentsScreen> {
  final _searchController = TextEditingController();
  late final AdminStudentsService _service;
  final List<AdminStudent> _students = [];
  bool _loading = true;
  bool _loadingMore = false;
  bool _hasMore = true;
  String? _error;
  String _query = '';
  static const _pageSize = 50;

  @override
  void initState() {
    super.initState();
    _service = AdminStudentsService(Supabase.instance.client);
    _load(reset: true);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _load({bool reset = false}) async {
    if (_loadingMore || (_loading && !reset)) return;
    if (reset) {
      setState(() {
        _loading = true;
        _error = null;
        _students.clear();
        _hasMore = true;
      });
    } else {
      setState(() => _loadingMore = true);
    }
    try {
      final page = await _service.list(
        search: _query,
        limit: _pageSize,
        offset: reset ? 0 : _students.length,
      );
      if (!mounted) return;
      setState(() {
        _students.addAll(page);
        _hasMore = page.length == _pageSize;
        _loading = false;
        _loadingMore = false;
        _error = null;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _loadingMore = false;
        _error = error.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  String _date(DateTime? value) {
    if (value == null) return 'Belum ada';
    final local = value.toLocal();
    return '${local.day.toString().padLeft(2, '0')}/'
        '${local.month.toString().padLeft(2, '0')}/${local.year}';
  }

  void _showDetails(AdminStudent student) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      backgroundColor: Colors.white,
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(22, 8, 22, 28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Detail siswa', style: TextStyle(
                fontSize: 20, fontWeight: FontWeight.w800, color: AppTheme.ink)),
              const SizedBox(height: 18),
              _DetailRow(label: 'Nama', value: student.fullName.isEmpty ? 'Belum diisi' : student.fullName),
              _DetailRow(label: 'Email', value: student.email),
              _DetailRow(label: 'Terdaftar', value: _date(student.createdAt)),
              _DetailRow(label: 'Login terakhir', value: _date(student.lastSignInAt)),
              _DetailRow(label: 'Total pengerjaan', value: student.totalAttempts.toString()),
              _DetailRow(label: 'Ujian terakhir', value: _date(student.latestAttemptAt)),
              _DetailRow(label: 'Status akses', value: student.isBlocked ? 'Diblokir sementara' : 'Aktif'),
              const SizedBox(height: 12),
              const Text(
                'Halaman ini bersifat pemantauan. Perubahan status akun belum diaktifkan agar tindakan administratif hanya dilakukan melalui prosedur server yang aman.',
                style: TextStyle(color: AppTheme.muted, fontSize: 12, height: 1.5),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manajemen siswa', style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          IconButton(
            tooltip: 'Muat ulang',
            onPressed: _loading ? null : () => _load(reset: true),
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 12, 18, 8),
            child: TextField(
              controller: _searchController,
              textInputAction: TextInputAction.search,
              onSubmitted: (value) {
                _query = value.trim();
                _load(reset: true);
              },
              decoration: InputDecoration(
                hintText: 'Cari nama atau email siswa',
                prefixIcon: const Icon(Icons.search_rounded),
                suffixIcon: IconButton(
                  tooltip: 'Cari',
                  onPressed: () {
                    _query = _searchController.text.trim();
                    _load(reset: true);
                  },
                  icon: const Icon(Icons.arrow_forward_rounded),
                ),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(15)),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
            child: Row(
              children: [
                Expanded(child: Text(
                  _query.isEmpty ? 'Daftar akun non-admin' : 'Hasil pencarian',
                  style: const TextStyle(color: AppTheme.muted, fontSize: 12),
                )),
                Text('${_students.length} ditampilkan',
                  style: const TextStyle(color: AppTheme.blue, fontWeight: FontWeight.w700, fontSize: 12)),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(mainAxisSize: MainAxisSize.min, children: [
                          const Icon(Icons.lock_outline_rounded, size: 36, color: AppTheme.muted),
                          const SizedBox(height: 12),
                          const Text('Data siswa belum dapat dimuat',
                            style: TextStyle(fontWeight: FontWeight.w800, color: AppTheme.ink)),
                          const SizedBox(height: 8),
                          Text(_error!, textAlign: TextAlign.center,
                            style: const TextStyle(color: AppTheme.muted, fontSize: 12)),
                          const SizedBox(height: 12),
                          FilledButton.icon(onPressed: () => _load(reset: true),
                            icon: const Icon(Icons.refresh), label: const Text('Coba lagi')),
                        ]),
                      ))
                    : _students.isEmpty
                        ? const Center(child: Text('Belum ada akun siswa yang cocok.',
                            style: TextStyle(color: AppTheme.muted)))
                        : RefreshIndicator(
                            onRefresh: () => _load(reset: true),
                            child: ListView.separated(
                              physics: const AlwaysScrollableScrollPhysics(),
                              padding: const EdgeInsets.fromLTRB(18, 8, 18, 24),
                              itemCount: _students.length + (_hasMore ? 1 : 0),
                              separatorBuilder: (_, __) => const SizedBox(height: 10),
                              itemBuilder: (context, index) {
                                if (index == _students.length) {
                                  return Center(
                                    child: Padding(
                                      padding: const EdgeInsets.all(12),
                                      child: OutlinedButton(
                                        onPressed: _loadingMore ? null : () => _load(),
                                        child: Text(_loadingMore ? 'Memuat...' : 'Muat lebih banyak'),
                                      ),
                                    ),
                                  );
                                }
                                final student = _students[index];
                                final name = student.fullName.isEmpty ? 'Tanpa nama' : student.fullName;
                                return Material(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(17),
                                  child: InkWell(
                                    borderRadius: BorderRadius.circular(17),
                                    onTap: () => _showDetails(student),
                                    child: Container(
                                      padding: const EdgeInsets.all(15),
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(17),
                                        border: Border.all(color: const Color(0xFFE8EEF5)),
                                      ),
                                      child: Row(children: [
                                        CircleAvatar(
                                          backgroundColor: AppTheme.blue.withValues(alpha: .1),
                                          child: Text(name.isEmpty ? '?' : name[0].toUpperCase(),
                                            style: const TextStyle(color: AppTheme.blue, fontWeight: FontWeight.w800)),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(name, maxLines: 1, overflow: TextOverflow.ellipsis,
                                              style: const TextStyle(fontWeight: FontWeight.w800, color: AppTheme.ink)),
                                            const SizedBox(height: 3),
                                            Text(student.email, maxLines: 1, overflow: TextOverflow.ellipsis,
                                              style: const TextStyle(fontSize: 12, color: AppTheme.muted)),
                                            const SizedBox(height: 7),
                                            Text('${student.totalAttempts} pengerjaan · Daftar ${_date(student.createdAt)}',
                                              style: const TextStyle(fontSize: 10, color: AppTheme.muted)),
                                          ],
                                        )),
                                        const SizedBox(width: 8),
                                        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                                          _StatusPill(blocked: student.isBlocked),
                                          const SizedBox(height: 6),
                                          const Icon(Icons.chevron_right_rounded, color: AppTheme.muted),
                                        ]),
                                      ]),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.blocked});
  final bool blocked;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
    decoration: BoxDecoration(
      color: blocked ? const Color(0xFFFFF1F2) : const Color(0xFFECFDF5),
      borderRadius: BorderRadius.circular(20),
    ),
    child: Text(blocked ? 'Diblokir' : 'Aktif',
      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800,
        color: blocked ? const Color(0xFFBE123C) : const Color(0xFF047857))),
  );
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      SizedBox(width: 130, child: Text(label,
        style: const TextStyle(color: AppTheme.muted, fontSize: 12))),
      Expanded(child: Text(value,
        style: const TextStyle(color: AppTheme.ink, fontWeight: FontWeight.w600, fontSize: 13))),
    ]),
  );
}
