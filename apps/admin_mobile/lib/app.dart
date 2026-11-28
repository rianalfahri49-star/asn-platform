import 'package:flutter/material.dart';

import 'features/auth/login_screen.dart';
import 'theme/app_theme.dart';

class SuksesCpnsAdminApp extends StatelessWidget {
  const SuksesCpnsAdminApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sukses CPNS Admin',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: const LoginScreen(),
    );
  }
}
