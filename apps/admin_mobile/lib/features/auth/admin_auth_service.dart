import 'package:supabase_flutter/supabase_flutter.dart';

class AdminAuthService {
  AdminAuthService(this._client);

  final SupabaseClient _client;

  Future<void> signIn({
    required String email,
    required String password,
  }) async {
    await _client.auth.signInWithPassword(
      email: email.trim(),
      password: password,
    );

    final user = _client.auth.currentUser;
    if (user == null || user.appMetadata['role'] != 'admin') {
      await _client.auth.signOut();
      throw const AuthException('Akun ini tidak memiliki akses administrator.');
    }
  }

  Future<void> requestEmailOtp() async {
    final response = await _client.functions.invoke(
      'admin-email-otp',
      body: {'action': 'send'},
    );
    _throwIfFunctionFailed(response);
  }

  Future<void> verifyEmailOtp(String code) async {
    final response = await _client.functions.invoke(
      'admin-email-otp',
      body: {'action': 'verify', 'code': code},
    );
    _throwIfFunctionFailed(response);
  }

  Future<void> signOut() => _client.auth.signOut();

  void _throwIfFunctionFailed(FunctionResponse response) {
    if (response.status < 200 || response.status >= 300) {
      final data = response.data;
      final message = data is Map && data['error'] is String
          ? data['error'] as String
          : 'Permintaan autentikasi gagal.';
      throw AuthException(message);
    }
    if (response.data is Map && response.data['success'] != true) {
      final message = response.data['error'] is String
          ? response.data['error'] as String
          : 'Permintaan autentikasi gagal.';
      throw AuthException(message);
    }
  }
}
