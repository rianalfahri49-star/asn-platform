import 'package:supabase_flutter/supabase_flutter.dart';

class DashboardMetrics {
  const DashboardMetrics({
    required this.students,
    required this.questions,
    required this.materials,
    required this.examAttempts,
    this.errors = const {},
  });

  final int students;
  final int questions;
  final int materials;
  final int examAttempts;
  final Map<String, String> errors;
}

class AdminDashboardService {
  AdminDashboardService(this._client);

  final SupabaseClient _client;

  Future<DashboardMetrics> loadMetrics() async {
    final results = await Future.wait([
      _count('profiles'),
      _count('questions'),
      _count('learning_materials'),
      _count('exam_attempts'),
    ]);

    final errors = <String, String>{};
    const names = ['Siswa', 'Soal', 'Materi', 'Pengerjaan ujian'];
    for (var i = 0; i < results.length; i++) {
      if (results[i].error != null) errors[names[i]] = results[i].error!;
    }

    return DashboardMetrics(
      students: results[0].count,
      questions: results[1].count,
      materials: results[2].count,
      examAttempts: results[3].count,
      errors: errors,
    );
  }

  Future<_CountResult> _count(String table) async {
    try {
      final count = await _client.from(table).count(CountOption.exact);
      return _CountResult(count, null);
    } on PostgrestException catch (error) {
      return _CountResult(0, error.message);
    } catch (error) {
      return _CountResult(0, error.toString());
    }
  }
}

class _CountResult {
  const _CountResult(this.count, this.error);
  final int count;
  final String? error;
}
