import 'package:supabase_flutter/supabase_flutter.dart';

class AdminStudent {
  const AdminStudent({
    required this.id,
    required this.email,
    required this.fullName,
    required this.createdAt,
    required this.totalAttempts,
    this.lastSignInAt,
    this.bannedUntil,
    this.latestAttemptAt,
  });

  final String id;
  final String email;
  final String fullName;
  final DateTime? createdAt;
  final DateTime? lastSignInAt;
  final DateTime? bannedUntil;
  final int totalAttempts;
  final DateTime? latestAttemptAt;

  bool get isBlocked => bannedUntil != null && bannedUntil!.isAfter(DateTime.now());

  factory AdminStudent.fromMap(Map<String, dynamic> map) => AdminStudent(
    id: map['id'] as String,
    email: (map['email'] as String?) ?? '',
    fullName: (map['full_name'] as String?) ?? '',
    createdAt: DateTime.tryParse(map['created_at']?.toString() ?? ''),
    lastSignInAt: DateTime.tryParse(map['last_sign_in_at']?.toString() ?? ''),
    bannedUntil: DateTime.tryParse(map['banned_until']?.toString() ?? ''),
    totalAttempts: (map['total_attempts'] as num?)?.toInt() ?? 0,
    latestAttemptAt: DateTime.tryParse(map['latest_attempt_at']?.toString() ?? ''),
  );
}

class AdminStudentsService {
  AdminStudentsService(this._client);
  final SupabaseClient _client;

  Future<List<AdminStudent>> list({String search = '', int limit = 50, int offset = 0}) async {
    final response = await _client.rpc('admin_list_students', params: {
      'p_search': search.trim(),
      'p_limit': limit,
      'p_offset': offset,
    });
    final rows = (response as List).cast<Map<String, dynamic>>();
    return rows.map(AdminStudent.fromMap).toList(growable: false);
  }
}
