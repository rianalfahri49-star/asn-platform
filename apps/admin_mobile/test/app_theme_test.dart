import 'package:flutter_test/flutter_test.dart';
import 'package:sukses_cpns_admin/theme/app_theme.dart';

void main() {
  test('admin theme uses Material 3 and the Sukses CPNS brand palette', () {
    final theme = AppTheme.light;

    expect(theme.useMaterial3, isTrue);
    expect(theme.colorScheme.primary, AppTheme.blue);
    expect(theme.colorScheme.secondary, AppTheme.emerald);
    expect(theme.scaffoldBackgroundColor, AppTheme.background);
  });
}
