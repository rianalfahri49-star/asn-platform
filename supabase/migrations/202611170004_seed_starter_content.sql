-- Small original starter bank so a newly configured project has practice content.
insert into public.questions (category,topic,question,options,correct_answer,explanation,is_published,is_premium)
select 'TWK','Pancasila','Rumusan Pancasila sebagai dasar negara tercantum dalam bagian mana dari UUD NRI Tahun 1945?','["Batang tubuh pasal 1","Pembukaan alinea keempat","Aturan peralihan","Penjelasan umum","Aturan tambahan"]'::jsonb,'B','Rumusan Pancasila tercantum dalam Pembukaan UUD NRI Tahun 1945 alinea keempat.',true,false
where not exists (select 1 from public.questions where question='Rumusan Pancasila sebagai dasar negara tercantum dalam bagian mana dari UUD NRI Tahun 1945?');

insert into public.questions (category,topic,question,options,correct_answer,explanation,is_published,is_premium)
select 'TWK','Bhinneka Tunggal Ika','Perilaku yang paling mencerminkan semangat Bhinneka Tunggal Ika adalah...','["Memaksakan kebiasaan sendiri","Menghindari kerja sama lintas budaya","Menghargai perbedaan dan bekerja sama","Membatasi pergaulan berdasarkan asal daerah","Menganggap budaya sendiri paling unggul"]'::jsonb,'C','Bhinneka Tunggal Ika mengajarkan persatuan dalam keberagaman dan sikap saling menghormati.',true,false
where not exists (select 1 from public.questions where question='Perilaku yang paling mencerminkan semangat Bhinneka Tunggal Ika adalah...');

insert into public.questions (category,topic,question,options,correct_answer,explanation,is_published,is_premium)
select 'TIU','Deret angka','Tentukan angka berikutnya dari deret 2, 5, 8, 11, ...','["12","13","14","15","16"]'::jsonb,'C','Pola deret bertambah 3 pada setiap langkah, sehingga angka berikutnya adalah 14.',true,false
where not exists (select 1 from public.questions where question='Tentukan angka berikutnya dari deret 2, 5, 8, 11, ...');

insert into public.questions (category,topic,question,options,correct_answer,explanation,is_published,is_premium)
select 'TIU','Analogi verbal','Dokter berhubungan dengan pasien sebagaimana guru berhubungan dengan...','["Buku","Murid","Sekolah","Kelas","Kurikulum"]'::jsonb,'B','Hubungan yang digunakan adalah profesi dengan orang yang menerima layanan atau pengajarannya.',true,false
where not exists (select 1 from public.questions where question='Dokter berhubungan dengan pasien sebagaimana guru berhubungan dengan...');

insert into public.questions (category,topic,question,options,correct_answer,explanation,is_published,is_premium)
select 'TKP','Pelayanan publik','Seorang warga menyampaikan keluhan karena antrean layanan cukup panjang. Apa tindakan terbaik?','["Mendengarkan keluhan, memeriksa kondisi antrean, lalu menjelaskan solusi sesuai prosedur","Meminta warga kembali pada hari lain tanpa penjelasan","Mengabaikan keluhan karena antrean sudah biasa","Mendahulukan warga yang dikenal","Menyalahkan petugas lain di depan warga"]'::jsonb,'A','Respons terbaik berorientasi pada pelayanan, empati, komunikasi yang jelas, dan kepatuhan pada prosedur.',true,false
where not exists (select 1 from public.questions where question='Seorang warga menyampaikan keluhan karena antrean layanan cukup panjang. Apa tindakan terbaik?');

insert into public.questions (category,topic,question,options,correct_answer,explanation,is_published,is_premium)
select 'TKP','Integritas','Kamu menemukan kesalahan data dalam dokumen yang akan segera dikirim. Apa yang sebaiknya dilakukan?','["Membiarkan karena tenggat sudah dekat","Mengubah data tanpa memberi tahu siapa pun","Segera mengonfirmasi dan memperbaiki melalui prosedur yang berlaku","Menghapus dokumen agar tidak diketahui","Menyalahkan rekan kerja yang membuat dokumen"]'::jsonb,'C','Integritas menuntut kejujuran, ketelitian, dan perbaikan kesalahan secara bertanggung jawab.',true,false
where not exists (select 1 from public.questions where question='Kamu menemukan kesalahan data dalam dokumen yang akan segera dikirim.');

insert into public.learning_materials (title,category,summary,content,is_published,is_premium)
select 'Mengenal Tes Wawasan Kebangsaan','TWK','Pengantar materi TWK untuk memulai persiapan SKD.','Fokus belajar TWK meliputi nasionalisme, integritas, bela negara, pilar negara, dan penggunaan bahasa Indonesia. Pelajari konsep, pahami contoh penerapan, lalu latih soal secara konsisten.',true,false
where not exists (select 1 from public.learning_materials where title='Mengenal Tes Wawasan Kebangsaan');

insert into public.learning_materials (title,category,summary,content,is_published,is_premium)
select 'Strategi Dasar Tes Intelegensia Umum','TIU','Cara memulai latihan verbal, numerik, dan figural.','Kelompokkan latihan menjadi penalaran verbal, numerik, dan figural. Catat pola yang sering keliru, kerjakan dari tingkat mudah, dan tingkatkan kesulitan secara bertahap. Biasakan memeriksa kembali proses berpikir.',true,false
where not exists (select 1 from public.learning_materials where title='Strategi Dasar Tes Intelegensia Umum');
