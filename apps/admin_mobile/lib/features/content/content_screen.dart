import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../theme/app_theme.dart';

class ContentScreen extends StatefulWidget {
  const ContentScreen({super.key});

  @override
  State<ContentScreen> createState() => _ContentScreenState();
}

class _ContentScreenState extends State<ContentScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  final _db = Supabase.instance.client;
  bool _loadingQuestions = true;
  bool _loadingMaterials = true;
  String? _questionError;
  String? _materialError;
  List<Map<String, dynamic>> _questions = [];
  List<Map<String, dynamic>> _materials = [];

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
    _loadQuestions();
    _loadMaterials();
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _loadQuestions() async {
    setState(() => _loadingQuestions = true);
    try {
      final data = await _db.from('questions').select(
        'id,category,topic,question,options,correct_answer,explanation,is_published,is_premium,created_at',
      ).order('created_at', ascending: false).limit(150);
      if (!mounted) return;
      setState(() {
        _questions = List<Map<String, dynamic>>.from(data);
        _questionError = null;
        _loadingQuestions = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _questionError = error.toString();
        _loadingQuestions = false;
      });
    }
  }

  Future<void> _loadMaterials() async {
    setState(() => _loadingMaterials = true);
    try {
      final data = await _db.from('learning_materials').select(
        'id,title,category,summary,content,is_published,is_premium,video_url,created_at',
      ).order('created_at', ascending: false).limit(150);
      if (!mounted) return;
      setState(() {
        _materials = List<Map<String, dynamic>>.from(data);
        _materialError = null;
        _loadingMaterials = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _materialError = error.toString();
        _loadingMaterials = false;
      });
    }
  }

  Future<void> _editQuestion([Map<String, dynamic>? item]) async {
    final formKey = GlobalKey<FormState>();
    String category = item?['category'] as String? ?? 'TWK';
    String topic = item?['topic'] as String? ?? '';
    String question = item?['question'] as String? ?? '';
    final options = List<String>.from(item?['options'] as List? ?? const []);
    while (options.length < 5) { options.add(''); }
    String answer = item?['correct_answer'] as String? ?? 'A';
    String explanation = item?['explanation'] as String? ?? '';
    bool published = item?['is_published'] as bool? ?? false;
    bool premium = item?['is_premium'] as bool? ?? false;
    bool saving = false;

    await showModalBottomSheet<void>(
      context: context, isScrollControlled: true, showDragHandle: true,
      backgroundColor: Colors.white,
      builder: (sheetContext) => StatefulBuilder(
        builder: (context, refresh) => Padding(
          padding: EdgeInsets.fromLTRB(20, 8, 20, MediaQuery.of(context).viewInsets.bottom + 24),
          child: Form(
            key: formKey,
            child: SingleChildScrollView(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(item == null ? 'Tambah soal' : 'Edit soal',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: category, decoration: const InputDecoration(labelText: 'Kategori'),
                  items: ['TWK','TIU','TKP'].map((v) => DropdownMenuItem(value: v, child: Text(v))).toList(),
                  onChanged: (v) => refresh(() => category = v ?? category),
                ),
                TextFormField(initialValue: topic, decoration: const InputDecoration(labelText: 'Topik'),
                  onChanged: (v) => topic = v),
                TextFormField(initialValue: question, minLines: 2, maxLines: 4,
                  decoration: const InputDecoration(labelText: 'Pertanyaan'),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Pertanyaan wajib diisi' : null,
                  onChanged: (v) => question = v),
                for (var i = 0; i < 5; i++)
                  TextFormField(initialValue: options[i], decoration: InputDecoration(labelText: 'Pilihan ${'ABCDE'[i]}'),
                    onChanged: (v) => options[i] = v),
                DropdownButtonFormField<String>(
                  value: answer, decoration: const InputDecoration(labelText: 'Kunci jawaban'),
                  items: ['A','B','C','D','E'].map((v) => DropdownMenuItem(value: v, child: Text(v))).toList(),
                  onChanged: (v) => refresh(() => answer = v ?? answer),
                ),
                TextFormField(initialValue: explanation, minLines: 2, maxLines: 4,
                  decoration: const InputDecoration(labelText: 'Pembahasan'),
                  onChanged: (v) => explanation = v),
                SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('Terbitkan soal'),
                  value: published, onChanged: (v) => refresh(() => published = v)),
                SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('Konten premium'),
                  value: premium, onChanged: (v) => refresh(() => premium = v)),
                const SizedBox(height: 12),
                SizedBox(width: double.infinity, child: FilledButton(
                  onPressed: saving ? null : () async {
                    if (!formKey.currentState!.validate()) return;
                    if (options.where((v) => v.trim().isNotEmpty).length < 2) {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Isi minimal dua pilihan jawaban.')));
                      return;
                    }
                    refresh(() => saving = true);
                    final payload = {
                      'category': category, 'topic': topic.trim(), 'question': question.trim(),
                      'options': options.where((v) => v.trim().isNotEmpty).toList(),
                      'correct_answer': answer, 'explanation': explanation.trim(),
                      'is_published': published, 'is_premium': premium,
                    };
                    try {
                      if (item == null) {
                        await _db.from('questions').insert(payload);
                      } else {
                        await _db.from('questions').update(payload).eq('id', item['id']);
                      }
                      if (sheetContext.mounted) Navigator.pop(sheetContext);
                      await _loadQuestions();
                    } catch (error) {
                      refresh(() => saving = false);
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
                    }
                  },
                  child: Text(saving ? 'Menyimpan...' : 'Simpan soal'),
                )),
              ]),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _editMaterial([Map<String, dynamic>? item]) async {
    final formKey = GlobalKey<FormState>();
    String title = item?['title'] as String? ?? '';
    String category = item?['category'] as String? ?? 'TWK';
    String summary = item?['summary'] as String? ?? '';
    String content = item?['content'] as String? ?? '';
    String video = item?['video_url'] as String? ?? '';
    bool published = item?['is_published'] as bool? ?? false;
    bool premium = item?['is_premium'] as bool? ?? false;
    bool saving = false;

    await showModalBottomSheet<void>(
      context: context, isScrollControlled: true, showDragHandle: true,
      backgroundColor: Colors.white,
      builder: (sheetContext) => StatefulBuilder(
        builder: (context, refresh) => Padding(
          padding: EdgeInsets.fromLTRB(20, 8, 20, MediaQuery.of(context).viewInsets.bottom + 24),
          child: Form(
            key: formKey,
            child: SingleChildScrollView(child: Column(
              crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(item == null ? 'Tambah materi' : 'Edit materi',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                const SizedBox(height: 16),
                TextFormField(initialValue: title, decoration: const InputDecoration(labelText: 'Judul'),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Judul wajib diisi' : null,
                  onChanged: (v) => title = v),
                DropdownButtonFormField<String>(
                  value: category, decoration: const InputDecoration(labelText: 'Kategori'),
                  items: ['TWK','TIU','TKP','PPPK','STRATEGI'].map((v) => DropdownMenuItem(value: v, child: Text(v))).toList(),
                  onChanged: (v) => category = v ?? category),
                TextFormField(initialValue: summary, minLines: 2, maxLines: 3,
                  decoration: const InputDecoration(labelText: 'Ringkasan'),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Ringkasan wajib diisi' : null,
                  onChanged: (v) => summary = v),
                TextFormField(initialValue: content, minLines: 5, maxLines: 12,
                  decoration: const InputDecoration(labelText: 'Isi materi'),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Isi materi wajib diisi' : null,
                  onChanged: (v) => content = v),
                TextFormField(initialValue: video, decoration: const InputDecoration(labelText: 'URL video (opsional)'),
                  keyboardType: TextInputType.url, onChanged: (v) => video = v),
                SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('Terbitkan materi'),
                  value: published, onChanged: (v) => refresh(() => published = v)),
                SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('Konten premium'),
                  value: premium, onChanged: (v) => refresh(() => premium = v)),
                const SizedBox(height: 12),
                SizedBox(width: double.infinity, child: FilledButton(
                  onPressed: saving ? null : () async {
                    if (!formKey.currentState!.validate()) return;
                    refresh(() => saving = true);
                    final payload = {
                      'title': title.trim(), 'category': category, 'summary': summary.trim(),
                      'content': content.trim(), 'video_url': video.trim().isEmpty ? null : video.trim(),
                      'is_published': published, 'is_premium': premium,
                    };
                    try {
                      if (item == null) {
                        await _db.from('learning_materials').insert(payload);
                      } else {
                        await _db.from('learning_materials').update(payload).eq('id', item['id']);
                      }
                      if (sheetContext.mounted) Navigator.pop(sheetContext);
                      await _loadMaterials();
                    } catch (error) {
                      refresh(() => saving = false);
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
                    }
                  },
                  child: Text(saving ? 'Menyimpan...' : 'Simpan materi'),
                )),
              ],
            )),
          ),
        ),
      ),
    );
  }

  Future<void> _delete(String table, String id, String label) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Hapus $label?'),
        content: const Text('Data yang dihapus tidak dapat dipulihkan.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Batal')),
          FilledButton(onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Hapus')),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await _db.from(table).delete().eq('id', id);
      if (!mounted) return;
      if (table == 'questions') {
        await _loadQuestions();
      } else {
        await _loadMaterials();
      }
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Kelola konten', style: TextStyle(fontWeight: FontWeight.w800)),
      bottom: TabBar(controller: _tabs, tabs: const [Tab(text: 'Bank soal'), Tab(text: 'Materi')]),
    ),
    body: TabBarView(controller: _tabs, children: [
      _buildList(
        loading: _loadingQuestions, error: _questionError, items: _questions,
        empty: 'Belum ada soal.', onRefresh: _loadQuestions,
        onAdd: () => _editQuestion(),
        itemBuilder: (item) => _ContentCard(
          title: item['question']?.toString() ?? '',
          subtitle: '${item['category']} · ${item['topic'] ?? 'Tanpa topik'}',
          published: item['is_published'] == true, premium: item['is_premium'] == true,
          onEdit: () => _editQuestion(item),
          onDelete: () => _delete('questions', item['id'].toString(), 'soal'),
        ),
      ),
      _buildList(
        loading: _loadingMaterials, error: _materialError, items: _materials,
        empty: 'Belum ada materi.', onRefresh: _loadMaterials,
        onAdd: () => _editMaterial(),
        itemBuilder: (item) => _ContentCard(
          title: item['title']?.toString() ?? '',
          subtitle: '${item['category']} · ${item['summary'] ?? ''}',
          published: item['is_published'] == true, premium: item['is_premium'] == true,
          onEdit: () => _editMaterial(item),
          onDelete: () => _delete('learning_materials', item['id'].toString(), 'materi'),
        ),
      ),
    ]),
  );

  Widget _buildList({
    required bool loading, required String? error,
    required List<Map<String, dynamic>> items, required String empty,
    required Future<void> Function() onRefresh, required VoidCallback onAdd,
    required Widget Function(Map<String, dynamic>) itemBuilder,
  }) {
    if (loading) return const Center(child: CircularProgressIndicator());
    if (error != null) return Center(child: Padding(
      padding: const EdgeInsets.all(24), child: Text(error, textAlign: TextAlign.center)));
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(18, 16, 18, 28),
        children: [
          SizedBox(width: double.infinity, child: FilledButton.icon(
            onPressed: onAdd, icon: const Icon(Icons.add_rounded),
            label: const Text('Tambah konten'),
          )),
          const SizedBox(height: 14),
          if (items.isEmpty) Padding(
            padding: const EdgeInsets.all(30),
            child: Center(child: Text(empty, style: const TextStyle(color: AppTheme.muted))),
          ) else ...items.map(itemBuilder),
        ],
      ),
    );
  }
}

class _ContentCard extends StatelessWidget {
  const _ContentCard({
    required this.title, required this.subtitle, required this.published,
    required this.premium, required this.onEdit, required this.onDelete,
  });
  final String title, subtitle;
  final bool published, premium;
  final VoidCallback onEdit, onDelete;

  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(bottom: 10),
    padding: const EdgeInsets.all(15),
    decoration: BoxDecoration(color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: const Color(0xFFE8EEF5))),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Wrap(spacing: 6, children: [
        _Tag(label: published ? 'Terbit' : 'Draft', color: published ? Colors.green : Colors.orange),
        if (premium) const _Tag(label: 'Premium', color: Colors.deepOrange),
      ]),
      const SizedBox(height: 8),
      Text(title, maxLines: 3, overflow: TextOverflow.ellipsis,
        style: const TextStyle(fontWeight: FontWeight.w800, color: AppTheme.ink)),
      const SizedBox(height: 4),
      Text(subtitle, maxLines: 2, overflow: TextOverflow.ellipsis,
        style: const TextStyle(fontSize: 12, color: AppTheme.muted)),
      const SizedBox(height: 10),
      Row(mainAxisAlignment: MainAxisAlignment.end, children: [
        TextButton.icon(onPressed: onEdit, icon: const Icon(Icons.edit_outlined, size: 16),
          label: const Text('Edit')),
        TextButton.icon(onPressed: onDelete, icon: const Icon(Icons.delete_outline, size: 16),
          style: TextButton.styleFrom(foregroundColor: Colors.red),
          label: const Text('Hapus')),
      ]),
    ]),
  );
}

class _Tag extends StatelessWidget {
  const _Tag({required this.label, required this.color});
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(color: color.withValues(alpha: .1),
      borderRadius: BorderRadius.circular(20)),
    child: Text(label, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w800)),
  );
}
