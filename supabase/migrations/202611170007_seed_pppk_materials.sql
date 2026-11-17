-- Starter content for PPPK preparation.
insert into public.learning_materials (title,category,summary,content,is_published,is_premium)
select 'Kompetensi Teknis PPPK','PPPK','Panduan awal memahami kompetensi teknis sesuai jabatan yang dilamar.','Kompetensi teknis berkaitan dengan pengetahuan, keterampilan, dan perilaku spesifik jabatan. Mulailah dari uraian jabatan dan kisi-kisi resmi instansi, petakan kompetensi utama, lalu susun latihan berbasis tugas nyata. Materi dan kisi-kisi dapat berbeda menurut formasi.',true,false
where not exists (select 1 from public.learning_materials where title='Kompetensi Teknis PPPK');

insert into public.learning_materials (title,category,summary,content,is_published,is_premium)
select 'Kompetensi Manajerial PPPK','PPPK','Pengantar kompetensi pengelolaan pekerjaan dan kerja sama.','Kompetensi manajerial dapat mencakup integritas, kerja sama, komunikasi, orientasi hasil, pelayanan publik, pengembangan diri dan orang lain, pengelolaan perubahan, serta pengambilan keputusan. Pelajari indikator perilaku dan gunakan contoh situasi kerja untuk berlatih.',true,false
where not exists (select 1 from public.learning_materials where title='Kompetensi Manajerial PPPK');

insert into public.learning_materials (title,category,summary,content,is_published,is_premium)
select 'Kompetensi Sosial Kultural PPPK','PPPK','Belajar membangun pelayanan yang inklusif di tengah keberagaman.','Kompetensi sosial kultural menekankan kemampuan berinteraksi secara efektif dalam masyarakat yang beragam. Latih kepekaan terhadap perbedaan, komunikasi yang menghargai, penyelesaian konflik secara adil, dan pelayanan tanpa diskriminasi.',true,false
where not exists (select 1 from public.learning_materials where title='Kompetensi Sosial Kultural PPPK');
