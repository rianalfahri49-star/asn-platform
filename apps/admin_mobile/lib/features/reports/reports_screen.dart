import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../theme/app_theme.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _attempts = [];
  final _db = Supabase.instance.client;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final rows = await _db.from('exam_attempts').select(
        'id,user_id,title,category,total_questions,correct_answers,score,duration_seconds,completed_at',
      ).order('completed_at', ascending: false).limit(100);
      if (!mounted) return;
      setState(() {
        _attempts = List<Map<String, dynamic>>.from(rows);
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() { _error = error.toString(); _loading = false; });
    }
  }

  String _date(dynamic raw) {
    final date = DateTime.tryParse(raw?.toString() ?? '')?.toLocal();
    if (date == null) return '-';
    return '${date.day.toString().padLeft(2, '0')}/'
      '${date.month.toString().padLeft(2, '0')}/${date.year} '
      '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final total = _attempts.length;
    final average = total == 0 ? 0 : (_attempts.fold<int>(0, (sum, item) =>
      sum + ((item['score'] as num?)?.toInt() ?? 0)) / total).round();
    return Scaffold(
      appBar: AppBar(
        title: const Text('Laporan ujian', style: TextStyle(fontWeight: FontWeight.w800)),
        actions: [IconButton(onPressed: _loading ? null : _load,
          tooltip: 'Muat ulang', icon: const Icon(Icons.refresh_rounded))],
      ),
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : _error != null
          ? Center(child: Padding(padding: const EdgeInsets.all(24), child: Column(
              mainAxisSize: MainAxisSize.min, children: [
                Text(_error!, textAlign: TextAlign.center),
                const SizedBox(height: 12),
                FilledButton(onPressed: _load, child: const Text('Coba lagi')),
              ])))
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(18),
                children: [
                  Row(children: [
                    Expanded(child: _MetricCard(label: 'Pengerjaan dimuat', value: total.toString(),
                      icon: Icons.assignment_turned_in_outlined)),
                    const SizedBox(width: 10),
                    Expanded(child: _MetricCard(label: 'Rata-rata skor', value: average.toString(),
                      icon: Icons.insights_rounded)),
                  ]),
                  const SizedBox(height: 20),
                  const Text('Aktivitas ujian terbaru',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AppTheme.ink)),
                  const SizedBox(height: 10),
                  if (_attempts.isEmpty)
                    const Padding(padding: EdgeInsets.all(30),
                      child: Center(child: Text('Belum ada data pengerjaan ujian.',
                        style: TextStyle(color: AppTheme.muted))))
                  else
                    ..._attempts.map((item) {
                      final score = (item['score'] as num?)?.toInt() ?? 0;
                      final correct = (item['correct_answers'] as num?)?.toInt() ?? 0;
                      final totalQ = (item['total_questions'] as num?)?.toInt() ?? 0;
                      final duration = (item['duration_seconds'] as num?)?.toInt() ?? 0;
                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(15),
                        decoration: BoxDecoration(color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE8EEF5))),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Row(children: [
                            Expanded(child: Text(item['title']?.toString() ?? 'Simulasi SKD',
                              style: const TextStyle(fontWeight: FontWeight.w800, color: AppTheme.ink))),
                            Text(score.toString(), style: const TextStyle(
                              color: AppTheme.blue, fontSize: 20, fontWeight: FontWeight.w900)),
                          ]),
                          const SizedBox(height: 5),
                          Text('${item['category'] ?? 'SKD'} · $correct/$totalQ benar',
                            style: const TextStyle(color: AppTheme.muted, fontSize: 12)),
                          const SizedBox(height: 5),
                          Text('Peserta: ${item['user_id'] ?? '-'}',
                            maxLines: 1, overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: AppTheme.muted, fontSize: 10)),
                          const SizedBox(height: 8),
                          Row(children: [
                            const Icon(Icons.schedule_rounded, size: 14, color: AppTheme.muted),
                            const SizedBox(width: 5),
                            Text(_date(item['completed_at']),
                              style: const TextStyle(color: AppTheme.muted, fontSize: 11)),
                            const Spacer(),
                            Text('${(duration ~/ 60)} menit',
                              style: const TextStyle(color: AppTheme.muted, fontSize: 11)),
                          ]),
                        ]),
                      );
                    }),
                  const SizedBox(height: 12),
                  const Text('Laporan menampilkan maksimal 100 pengerjaan terbaru. Identitas peserta menggunakan ID akun agar email pribadi tidak ditampilkan pada daftar laporan.',
                    style: TextStyle(color: AppTheme.muted, fontSize: 11, height: 1.5)),
                ],
              ),
            ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.label, required this.value, required this.icon});
  final String label, value;
  final IconData icon;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(15),
    decoration: BoxDecoration(color: Colors.white,
      borderRadius: BorderRadius.circular(17),
      border: Border.all(color: const Color(0xFFE8EEF5))),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Icon(icon, color: AppTheme.blue),
      const SizedBox(height: 12),
      Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppTheme.ink)),
      Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.muted)),
    ]),
  );
}
