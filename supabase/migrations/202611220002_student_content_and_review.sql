-- Additional original practice content and secure post-exam review.
-- These are practice questions written for this platform, not official exam items.

WITH new_questions(category, topic, question, options, correct_answer, explanation) AS (
  VALUES
  ('TWK','Proklamasi','Makna utama Proklamasi Kemerdekaan bagi bangsa Indonesia adalah...','["Pernyataan kepada dunia bahwa Indonesia merdeka dan berdaulat","Penggantian seluruh peraturan secara otomatis","Pembentukan seluruh kementerian pada hari yang sama","Penghapusan seluruh perbedaan sosial","Penetapan batas wilayah secara rinci"]'::jsonb,'A','Proklamasi menyatakan kemerdekaan Indonesia kepada bangsa sendiri dan dunia serta menjadi awal kehidupan sebagai negara merdeka.'),
  ('TWK','NKRI','Menurut Pasal 1 ayat (1) UUD NRI Tahun 1945, bentuk negara Indonesia adalah...','["Federasi","Serikat","Kesatuan yang berbentuk republik","Monarki konstitusional","Konfederasi"]'::jsonb,'C','Pasal 1 ayat (1) menyatakan Negara Indonesia ialah Negara Kesatuan yang berbentuk Republik.'),
  ('TWK','Persamaan di hadapan hukum','Prinsip persamaan kedudukan warga negara di dalam hukum dan pemerintahan tercantum dalam...','["Pasal 27 ayat (1) UUD NRI Tahun 1945","Pasal 29 ayat (2) UUD NRI Tahun 1945","Pasal 31 ayat (1) UUD NRI Tahun 1945","Pasal 33 ayat (1) UUD NRI Tahun 1945","Pasal 34 ayat (1) UUD NRI Tahun 1945"]'::jsonb,'A','Pasal 27 ayat (1) menegaskan persamaan kedudukan warga negara di dalam hukum dan pemerintahan serta kewajiban menjunjungnya.'),
  ('TWK','Bela negara','Contoh bela negara dalam kehidupan sehari-hari bagi pelajar atau mahasiswa adalah...','["Menyebarkan informasi yang belum terverifikasi","Menaati aturan, belajar sungguh-sungguh, dan menjaga persatuan","Mengutamakan kepentingan kelompok sendiri","Menolak bekerja sama dengan orang berbeda pendapat","Menghindari kegiatan sosial"]'::jsonb,'B','Bela negara dapat diwujudkan melalui perilaku disiplin, tanggung jawab, peningkatan kualitas diri, dan menjaga persatuan.'),
  ('TWK','Integritas','Ketika mengetahui rekan melakukan manipulasi data, sikap yang paling tepat adalah...','["Membiarkan karena bukan tanggung jawab sendiri","Ikut mengubah data agar konsisten","Melaporkan melalui mekanisme yang berlaku disertai informasi faktual","Menyebarkan tuduhan di media sosial","Menghapus bukti agar tidak terjadi konflik"]'::jsonb,'C','Integritas menuntut kejujuran dan keberanian melaporkan dugaan pelanggaran melalui saluran yang tepat berdasarkan fakta.'),
  ('TIU','Persentase','Harga sebuah buku Rp80.000 mendapat potongan 15%. Harga setelah potongan adalah...','["Rp60.000","Rp64.000","Rp68.000","Rp70.000","Rp72.000"]'::jsonb,'C','Potongan 15% dari Rp80.000 adalah Rp12.000. Harga setelah potongan Rp68.000.'),
  ('TIU','Perbandingan','Perbandingan jumlah peserta laki-laki dan perempuan adalah 3 : 5. Jika jumlah seluruh peserta 40 orang, jumlah peserta perempuan adalah...','["15","20","24","25","30"]'::jsonb,'D','Jumlah bagian 8. Satu bagian bernilai 5, sehingga perempuan berjumlah 5 × 5 = 25 orang.'),
  ('TIU','Kecepatan','Sebuah kendaraan menempuh jarak 150 km dalam waktu 3 jam. Kecepatan rata-ratanya adalah...','["40 km/jam","45 km/jam","50 km/jam","55 km/jam","60 km/jam"]'::jsonb,'C','Kecepatan rata-rata adalah jarak dibagi waktu, yaitu 150 km dibagi 3 jam = 50 km/jam.'),
  ('TIU','Silogisme','Semua arsip penting harus disimpan dengan aman. Sebagian dokumen kantor adalah arsip penting. Kesimpulan yang tepat adalah...','["Semua dokumen kantor harus dimusnahkan","Sebagian dokumen kantor harus disimpan dengan aman","Tidak ada dokumen kantor yang penting","Semua arsip penting adalah dokumen kantor","Sebagian arsip penting tidak perlu disimpan"]'::jsonb,'B','Sebagian dokumen kantor termasuk arsip penting, dan semua arsip penting harus disimpan aman.'),
  ('TIU','Deret angka','Tentukan angka berikutnya: 3, 6, 12, 24, ...','["30","36","42","48","54"]'::jsonb,'D','Setiap suku dikalikan 2. Setelah 24, angka berikutnya adalah 48.'),
  ('TIU','Analogi verbal','Kompas : arah memiliki hubungan yang paling dekat dengan...','["Termometer : suhu","Buku : meja","Kertas : tinta","Lampu : kabel","Jam : dinding"]'::jsonb,'A','Kompas digunakan untuk mengetahui arah, sedangkan termometer digunakan untuk mengetahui suhu.'),
  ('TKP','Orientasi pelayanan','Seorang warga lanjut usia kesulitan memahami prosedur layanan digital. Apa tindakan terbaik?','["Meminta warga mencari bantuan sendiri","Menjelaskan dengan bahasa sederhana dan membantu sesuai prosedur serta menjaga kemandirian warga","Menyuruh warga kembali ketika layanan sepi","Mengabaikan karena semua layanan wajib digital","Meminta warga memberikan imbalan atas bantuan"]'::jsonb,'B','Pelayanan yang baik bersifat inklusif, komunikatif, membantu sesuai kewenangan, dan tetap mengikuti prosedur.'),
  ('TKP','Kerja sama','Rekan satu tim tertinggal menyelesaikan tugas yang menjadi tanggung jawab bersama. Apa yang sebaiknya kamu lakukan?','["Langsung melaporkannya tanpa berbicara terlebih dahulu","Membiarkan agar ia belajar dari kesalahan","Mengajak berdiskusi, mencari hambatan, lalu menyepakati bantuan dan pembagian tugas","Mengambil alih seluruh pekerjaan tanpa koordinasi","Menyalahkannya di depan anggota tim"]'::jsonb,'C','Kolaborasi yang efektif dimulai dengan komunikasi, memahami kendala, dan menyepakati dukungan serta tanggung jawab secara jelas.'),
  ('TKP','Adaptasi','Instansi menerapkan aplikasi kerja baru sementara kamu belum terbiasa menggunakannya. Sikap terbaik adalah...','["Menolak menggunakan aplikasi baru","Tetap memakai cara lama tanpa izin","Mempelajari panduan, mengikuti pelatihan, dan meminta bantuan bila menemui kendala","Menunggu sampai rekan lain menyelesaikan semuanya","Mengeluh di grup kerja tanpa mencoba"]'::jsonb,'C','Adaptasi ditunjukkan dengan kemauan belajar, memanfaatkan pelatihan, dan mencari solusi ketika menghadapi perubahan.'),
  ('TKP','Integritas kerja','Vendor memberikan hadiah pribadi setelah kamu membantu proses administrasi pengadaan. Tindakan paling tepat adalah...','["Menerima karena dianggap tanda terima kasih","Menerima lalu membagikannya kepada tim","Menolak dengan sopan dan melaporkan sesuai ketentuan gratifikasi yang berlaku","Menyimpan hadiah tanpa memberi tahu siapa pun","Meminta hadiah dalam bentuk lain"]'::jsonb,'C','Menolak dan melaporkan sesuai ketentuan membantu menjaga independensi, transparansi, dan mencegah konflik kepentingan.')
)
INSERT INTO public.questions(category, topic, question, options, correct_answer, explanation, is_published, is_premium)
SELECT nq.category, nq.topic, nq.question, nq.options, nq.correct_answer, nq.explanation, true, false
FROM new_questions nq
WHERE NOT EXISTS (SELECT 1 FROM public.questions q WHERE q.question = nq.question);

WITH new_materials(category,title,summary,content) AS (
 VALUES
 ('TWK','Proklamasi Kemerdekaan dan maknanya','Memahami arti Proklamasi 17 Agustus 1945 bagi kehidupan bernegara.','Proklamasi Kemerdekaan dibacakan pada 17 Agustus 1945. Maknanya antara lain pernyataan kemerdekaan, berakhirnya status penjajahan secara politik, dan dimulainya kehidupan bangsa Indonesia sebagai negara merdeka. Pahami hubungan Proklamasi dengan Pembukaan UUD NRI Tahun 1945 serta tanggung jawab mengisi kemerdekaan.'),
 ('TWK','NKRI dan bentuk negara','Mengenali prinsip Negara Kesatuan Republik Indonesia.','Pasal 1 ayat (1) UUD NRI Tahun 1945 menyatakan bahwa Indonesia adalah Negara Kesatuan yang berbentuk Republik. Prinsip negara kesatuan menekankan satu kedaulatan negara, sementara penyelenggaraan pemerintahan daerah diatur dalam kerangka otonomi sesuai konstitusi dan undang-undang.'),
 ('TWK','Hak dan kewajiban warga negara','Mempelajari prinsip persamaan kedudukan dalam hukum dan pemerintahan.','Pasal 27 ayat (1) UUD NRI Tahun 1945 menegaskan persamaan kedudukan warga negara di dalam hukum dan pemerintahan serta kewajiban menjunjung hukum dan pemerintahan tanpa kecuali. Pelajari hubungan hak dan kewajiban sebagai dua hal yang berjalan beriringan.'),
 ('TIU','Aritmetika dasar dan persentase','Strategi menyelesaikan soal hitung cepat secara runtut.','Persentase berarti per seratus. Untuk menghitung p% dari suatu nilai, kalikan nilai dengan p/100. Pada soal diskon, kurangi harga awal dengan nilai diskon. Pada soal kenaikan, tambahkan nilai kenaikan ke nilai awal. Perhatikan apakah persentase dihitung dari nilai awal atau nilai setelah perubahan.'),
 ('TIU','Perbandingan dan skala','Memahami rasio, proporsi, dan pembagian berdasarkan perbandingan.','Dalam rasio a:b, jumlah bagian adalah a+b. Jika total diketahui, nilai satu bagian diperoleh dengan membagi total dengan jumlah bagian. Kalikan nilai satu bagian dengan koefisien yang ditanyakan. Pastikan total bagian dan satuan tetap konsisten.'),
 ('TKP','Kerja sama dan komunikasi efektif','Mengembangkan perilaku kolaboratif dalam situasi kerja.','Kerja sama yang baik dibangun melalui tujuan bersama, pembagian peran yang jelas, komunikasi terbuka, dan saling menghargai. Ketika terjadi hambatan, klarifikasi masalah terlebih dahulu, dengarkan sudut pandang rekan, lalu sepakati langkah penyelesaian dan tindak lanjut.'),
 ('TKP','Adaptasi terhadap perubahan','Membangun kesiapan belajar saat prosedur atau teknologi berubah.','Adaptasi ditunjukkan dengan sikap terbuka, kemauan mempelajari hal baru, dan kemampuan menyesuaikan cara kerja tanpa mengabaikan aturan. Gunakan panduan dan pelatihan resmi, catat kendala, serta sampaikan umpan balik yang membangun.'),
 ('TKP','Integritas dan pencegahan konflik kepentingan','Memahami kejujuran, akuntabilitas, dan sikap terhadap gratifikasi.','Integritas berarti konsisten antara nilai, ucapan, dan tindakan. Hindari penyalahgunaan kewenangan, manipulasi data, dan konflik kepentingan. Jika menghadapi pemberian yang berpotensi menjadi gratifikasi, tolak atau laporkan sesuai ketentuan instansi dan peraturan yang berlaku.')
)
INSERT INTO public.learning_materials(category,title,summary,content,is_published,is_premium)
SELECT m.category,m.title,m.summary,m.content,true,false
FROM new_materials m
WHERE NOT EXISTS (SELECT 1 FROM public.learning_materials x WHERE x.title=m.title);

CREATE OR REPLACE FUNCTION public.get_exam_review(p_attempt_id uuid)
RETURNS TABLE(
  question_id uuid,
  category text,
  topic text,
  question text,
  options jsonb,
  selected_answer text,
  correct_answer text,
  explanation text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_answers jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT ea.answers INTO v_answers
  FROM public.exam_attempts ea
  WHERE ea.id = p_attempt_id AND ea.user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Exam attempt not found';
  END IF;

  RETURN QUERY
  SELECT q.id, q.category, q.topic, q.question, q.options,
         v_answers ->> q.id::text, q.correct_answer, q.explanation
  FROM public.questions q
  WHERE q.id IN (SELECT key::uuid FROM jsonb_each(v_answers))
  ORDER BY q.category, q.created_at, q.id;
END;
$function$;

REVOKE ALL ON FUNCTION public.get_exam_review(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_exam_review(uuid) TO authenticated;
