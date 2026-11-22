import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../theme/app_theme.dart';

class PaymentsScreen extends StatefulWidget {
  const PaymentsScreen({super.key});

  @override
  State<PaymentsScreen> createState() => _PaymentsScreenState();
}

class _PaymentsScreenState extends State<PaymentsScreen> {
  final _db = Supabase.instance.client;
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _orders = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final rows = await _db.from('payment_orders').select(
        'id,user_id,order_id,package_id,amount,status,payment_url,created_at,paid_at',
      ).order('created_at', ascending: false).limit(100);
      if (!mounted) return;
      setState(() { _orders = List<Map<String, dynamic>>.from(rows); _loading = false; });
    } catch (error) {
      if (!mounted) return;
      setState(() { _error = error.toString(); _loading = false; });
    }
  }

  String _currency(dynamic value) {
    final amount = (value as num?)?.toInt() ?? 0;
    final digits = amount.toString();
    final buffer = StringBuffer();
    for (var i = 0; i < digits.length; i++) {
      if (i > 0 && (digits.length - i) % 3 == 0) buffer.write('.');
      buffer.write(digits[i]);
    }
    return 'Rp$buffer';
  }

  String _date(dynamic raw) {
    final d = DateTime.tryParse(raw?.toString() ?? '')?.toLocal();
    if (d == null) return '-';
    return '${d.day.toString().padLeft(2,'0')}/${d.month.toString().padLeft(2,'0')}/${d.year}';
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'paid': return const Color(0xFF047857);
      case 'failed':
      case 'refunded': return const Color(0xFFBE123C);
      case 'expired': return const Color(0xFF64748B);
      default: return const Color(0xFFB45309);
    }
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'paid': return 'Berhasil';
      case 'failed': return 'Gagal';
      case 'refunded': return 'Dikembalikan';
      case 'expired': return 'Kedaluwarsa';
      default: return 'Menunggu';
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Transaksi pembayaran',
      style: TextStyle(fontWeight: FontWeight.w800)),
      actions: [IconButton(onPressed: _loading ? null : _load,
        icon: const Icon(Icons.refresh_rounded))]),
    body: _loading
      ? const Center(child: CircularProgressIndicator())
      : _error != null
        ? Center(child: Padding(padding: const EdgeInsets.all(24),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
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
                Text('${_orders.length} transaksi terbaru',
                  style: const TextStyle(color: AppTheme.muted, fontSize: 12)),
                const SizedBox(height: 12),
                if (_orders.isEmpty)
                  const Padding(padding: EdgeInsets.all(28),
                    child: Center(child: Text('Belum ada transaksi.')))
                else
                  ..._orders.map((order) {
                    final status = order['status']?.toString() ?? 'pending';
                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(15),
                      decoration: BoxDecoration(color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE8EEF5))),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Row(children: [
                          Expanded(child: Text(order['package_id']?.toString() ?? 'Paket',
                            style: const TextStyle(fontWeight: FontWeight.w800, color: AppTheme.ink))),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                            decoration: BoxDecoration(
                              color: _statusColor(status).withValues(alpha: .1),
                              borderRadius: BorderRadius.circular(20)),
                            child: Text(_statusLabel(status),
                              style: TextStyle(color: _statusColor(status),
                                fontSize: 10, fontWeight: FontWeight.w800)),
                          ),
                        ]),
                        const SizedBox(height: 8),
                        Text(_currency(order['amount']),
                          style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w900, color: AppTheme.blue)),
                        const SizedBox(height: 5),
                        Text('Order: ${order['order_id'] ?? '-'}',
                          style: const TextStyle(fontSize: 11, color: AppTheme.muted)),
                        Text('Peserta ID: ${order['user_id'] ?? '-'}',
                          maxLines: 1, overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 10, color: AppTheme.muted)),
                        const SizedBox(height: 5),
                        Text('Dibuat ${_date(order['created_at'])}'
                          '${order['paid_at'] == null ? '' : ' · Dibayar ${_date(order['paid_at'])}'}',
                          style: const TextStyle(fontSize: 11, color: AppTheme.muted)),
                      ]),
                    );
                  }),
                const SizedBox(height: 10),
                const Text('Tampilan ini hanya untuk pemantauan. Status pembayaran tidak dapat diubah dari aplikasi; status harus berasal dari webhook penyedia pembayaran yang tervalidasi.',
                  style: TextStyle(color: AppTheme.muted, fontSize: 11, height: 1.5)),
              ],
            ),
          ),
  );
}
