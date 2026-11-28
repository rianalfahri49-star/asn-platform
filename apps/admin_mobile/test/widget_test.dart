import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('basic Flutter widget test runner is configured', (tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: Scaffold(body: Text('Sukses CPNS Admin')),
    ));

    expect(find.text('Sukses CPNS Admin'), findsOneWidget);
  });
}
