"use client";

import Link from "next/link";
import HomeAuthActions from "./home-auth-actions";
import {
  ArrowRight, ArrowUpRight, BookOpen, Brain, CheckCircle2, Clock3,
  GraduationCap, Layers3, ShieldCheck, Sparkles, Target, Trophy, Zap,
} from "lucide-react";

const features = [
  { icon: BookOpen, title: "Materi terstruktur", text: "Pelajari konsep TWK, TIU, dan TKP dengan alur yang lebih mudah diikuti." },
  { icon: Brain, title: "Bank soal", text: "Latihan berdasarkan kategori dan topik untuk mengasah kemampuan." },
  { icon: Clock3, title: "Simulasi CAT", text: "Biasakan diri mengerjakan soal dengan batas waktu dan navigasi ujian." },
  { icon: Target, title: "Evaluasi progres", text: "Lihat hasil latihan dan kenali bagian yang perlu kamu tingkatkan." },
  { icon: ShieldCheck, title: "Akun personal", text: "Riwayat pengerjaan tersimpan di akun agar progres tidak tercecer." },
  { icon: Trophy, title: "Peringkat", text: "Jadikan pencapaian sebagai motivasi untuk belajar lebih konsisten." },
];

const subjects = [
  { code: "TWK", title: "Tes Wawasan Kebangsaan", text: "Nasionalisme, integritas, bela negara, pilar negara, dan bahasa Indonesia.", icon: "W", tone: "mint", topics: ["Nasionalisme", "Integritas", "Bela negara"] },
  { code: "TIU", title: "Tes Intelegensia Umum", text: "Verbal, numerik, figural, logika, dan penalaran analitis.", icon: "∑", tone: "blue", topics: ["Verbal", "Numerik", "Figural"] },
  { code: "TKP", title: "Tes Karakteristik Pribadi", text: "Pelayanan publik, jejaring kerja, sosial budaya, dan profesionalisme.", icon: "♡", tone: "peach", topics: ["Pelayanan", "Profesional", "Adaptasi"] },
];

export default function Home() {
  return (
    <main className="celadon-home" id="home">
      <header className="celadon-header">
        <div className="celadon-container celadon-nav">
          <Link href="/" className="celadon-brand" aria-label="Sukses CPNS beranda">
            <span className="celadon-brand-mark"><GraduationCap size={22} /></span>
            <span>Sukses<span>CPNS</span></span>
          </Link>
          <nav className="celadon-links" aria-label="Navigasi utama">
            <a href="#fitur">Fitur</a>
            <a href="#materi">Materi SKD</a>
            <Link href="/latihan">Latihan</Link>
            <Link href="/simulasi">Tryout CAT</Link>
            <Link href="/peringkat">Peringkat</Link>
          </nav>
          <div className="celadon-actions">
            <HomeAuthActions />
            <Link href="/latihan" className="celadon-button celadon-button-primary">Mulai belajar <ArrowUpRight size={16} /></Link>
          </div>
          <details className="celadon-mobile-menu">
            <summary aria-label="Buka menu"><span></span><span></span><span></span></summary>
            <div className="celadon-mobile-panel">
              <a href="#fitur">Fitur</a><a href="#materi">Materi SKD</a>
              <Link href="/latihan">Latihan</Link><Link href="/simulasi">Tryout CAT</Link>
              <Link href="/peringkat">Peringkat</Link><Link href="/masuk">Masuk / Daftar</Link>
            </div>
          </details>
        </div>
      </header>

      <section className="celadon-hero">
        <div className="celadon-container celadon-hero-grid">
          <div className="celadon-hero-copy">
            <span className="celadon-eyebrow"><Sparkles size={14} /> Ruang persiapan seleksi ASN</span>
            <h1>Langkah kecil hari ini, <em>ASN impian</em> esok hari.</h1>
            <p>Persiapkan dirimu menghadapi seleksi CPNS dengan materi terstruktur, latihan soal, simulasi CAT, dan evaluasi kemampuan dalam satu platform.</p>
            <div className="celadon-hero-buttons">
              <Link href="/masuk" className="celadon-button celadon-button-primary">Mulai perjalananmu <ArrowRight size={17} /></Link>
              <a href="#fitur" className="celadon-button celadon-button-quiet">Jelajahi fitur</a>
            </div>
            <div className="celadon-proof">
              <span><CheckCircle2 size={16} /> Belajar fleksibel</span>
              <span><CheckCircle2 size={16} /> Ramah mobile</span>
              <span><CheckCircle2 size={16} /> Progres terukur</span>
            </div>
          </div>

          <div className="celadon-visual" aria-label="Ilustrasi dashboard belajar Sukses CPNS">
            <div className="celadon-float celadon-float-top"><span className="celadon-float-icon">✦</span><span><b>Target belajar</b><small>Konsisten setiap hari</small></span></div>
            <div className="celadon-board">
              <div className="celadon-board-head"><span>RUANG BELAJARMU</span><span className="celadon-live"><i></i> Siap dimulai</span></div>
              <h2>Siap hadapi SKD?</h2>
              <p>Atur ritme, tingkatkan kemampuan.</p>
              {subjects.map((subject, index) => (
                <div className="celadon-subject-row" key={subject.code}>
                  <span className={"celadon-subject-icon " + subject.tone}>{subject.icon}</span>
                  <span><b>{subject.code}</b><small>{subject.title}</small></span>
                  <strong>0{index + 1}</strong>
                </div>
              ))}
              <div className="celadon-board-foot"><span>Mulai dari satu soal</span><span className="celadon-arrow-circle"><ArrowUpRight size={18} /></span></div>
            </div>
            <div className="celadon-float celadon-float-bottom"><span className="celadon-check">✓</span><span><b>Progres terukur</b><small>Kenali perkembanganmu</small></span></div>
          </div>
        </div>
      </section>

      <section className="celadon-trust">
        <div className="celadon-container">
          <p>Satu platform untuk seluruh perjalanan persiapanmu</p>
          <div><span>Belajar</span><i></i><span>Berlatih</span><i></i><span>Simulasi</span><i></i><span>Evaluasi</span><i></i><span>Berkembang</span></div>
        </div>
      </section>

      <section className="celadon-section" id="fitur">
        <div className="celadon-container">
          <div className="celadon-section-heading">
            <span className="celadon-kicker">FITUR UTAMA</span>
            <h2>Semua yang kamu butuhkan untuk persiapan SKD.</h2>
            <p>Belajar lebih fokus dengan fitur yang menemani setiap tahap persiapan.</p>
          </div>
          <div className="celadon-feature-grid">
            {features.map(({ icon: Icon, title, text }) => (
              <article className="celadon-feature-card" key={title}>
                <span className="celadon-feature-icon"><Icon size={22} /></span>
                <h3>{title}</h3><p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="celadon-section celadon-material-section" id="materi">
        <div className="celadon-container">
          <div className="celadon-split-heading">
            <div><span className="celadon-kicker">RUANG BELAJAR</span><h2>Kenali tiga bagian utama SKD.</h2></div>
            <p>Mulai dari materi yang paling ingin kamu kuasai. Belajar bertahap, lalu ukur kemampuan lewat latihan.</p>
          </div>
          <div className="celadon-material-grid">
            {subjects.map((subject) => (
              <article className="celadon-material-card" key={subject.code}>
                <div className="celadon-material-top"><span className={"celadon-code " + subject.tone}>{subject.code}</span><span className="celadon-material-symbol"><Layers3 size={20} /></span></div>
                <h3>{subject.title}</h3><p>{subject.text}</p>
                <div className="celadon-topic-list">{subject.topics.map(topic => <span key={topic}>{topic}</span>)}</div>
                <Link href="/materi" className="celadon-text-link">Jelajahi materi <ArrowUpRight size={15} /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="celadon-section">
        <div className="celadon-container celadon-tryout">
          <div>
            <span className="celadon-kicker">SIMULASI CAT</span>
            <h2>Biasakan diri dengan suasana ujian.</h2>
            <p>Coba simulasi dengan soal yang tersedia di platform. Hasil pengerjaan akan tersimpan pada akunmu.</p>
            <ul><li><CheckCircle2 size={17} /> Latihan berdasarkan kategori</li><li><CheckCircle2 size={17} /> Timer dan navigasi soal</li><li><CheckCircle2 size={17} /> Penilaian dari server</li></ul>
            <Link href="/simulasi" className="celadon-button celadon-button-primary">Lihat simulasi CAT <ArrowRight size={17} /></Link>
          </div>
          <div className="celadon-tryout-card">
            <div className="celadon-tryout-top"><span>PREVIEW SIMULASI</span><span className="celadon-tag">CAT SKD</span></div>
            <div className="celadon-tryout-question"><span>01 / 03</span><h3>Manakah tindakan yang menunjukkan semangat persatuan?</h3><div className="celadon-answer"><b>A</b> Mengutamakan kelompok sendiri</div><div className="celadon-answer celadon-answer-active"><b>B</b> Menghargai perbedaan dan bekerja sama <CheckCircle2 size={17} /></div><div className="celadon-answer"><b>C</b> Menghindari diskusi</div></div>
            <div className="celadon-tryout-foot"><span><Clock3 size={15} /> Waktu latihan</span><b>Terukur dan terarah</b></div>
          </div>
        </div>
      </section>

      <section className="celadon-section celadon-dashboard-section">
        <div className="celadon-container">
          <div className="celadon-section-heading"><span className="celadon-kicker">DASHBOARD SISWA</span><h2>Progres belajar dalam satu pandangan.</h2><p>Masuk ke akunmu untuk melihat riwayat, hasil latihan, dan perkembangan belajar.</p></div>
          <div className="celadon-dashboard-preview">
            <div className="celadon-dashboard-sidebar"><div className="celadon-brand small"><span className="celadon-brand-mark"><GraduationCap size={17}/></span><b>SuksesCPNS</b></div><span>MENU BELAJAR</span><b className="active">▦ &nbsp; Ringkasan</b><span>▤ &nbsp; Materi</span><span>✎ &nbsp; Latihan soal</span><span>◷ &nbsp; Tryout</span><span>AKUN</span><span>♙ &nbsp; Profil saya</span></div>
            <div className="celadon-dashboard-main">
              <div className="celadon-dashboard-welcome"><div><small>RUANG BELAJAR PRIBADI</small><h3>Hai, Pejuang CPNS! ✦</h3><p>Semua perkembangan belajarmu tersimpan dalam akun.</p></div><span className="celadon-avatar">S</span></div>
              <div className="celadon-dashboard-stats"><div><small>Materi tersedia</small><b>TWK · TIU · TKP</b></div><div><small>Riwayat latihan</small><b>Tersimpan</b></div><div><small>Evaluasi</small><b>Terukur</b></div></div>
              <div className="celadon-dashboard-lower"><div><b>Fokus belajar</b><p>TWK <span>Wawasan kebangsaan</span></p><p>TIU <span>Penalaran umum</span></p><p>TKP <span>Karakteristik pribadi</span></p></div><div className="celadon-goal"><span>✦</span><b>Target kesiapan</b><p>Bangun konsistensi melalui latihan rutin.</p></div></div>
            </div>
          </div>
          <div className="celadon-dashboard-cta"><Link href="/akun" className="celadon-button celadon-button-primary">Buka dashboard siswa <ArrowRight size={16}/></Link></div>
        </div>
      </section>

      <section className="celadon-section">
        <div className="celadon-container celadon-final-cta">
          <span className="celadon-kicker">MULAI PERJALANANMU</span>
          <h2>Persiapan hebat dimulai dari langkah pertama.</h2>
          <p>Buat akun dan siapkan rutinitas belajar yang lebih terarah bersama Sukses CPNS.</p>
          <div><Link href="/masuk" className="celadon-button celadon-button-primary">Masuk / Daftar <ArrowRight size={17}/></Link><Link href="/materi" className="celadon-button celadon-button-quiet">Lihat materi</Link></div>
        </div>
      </section>

      <footer className="celadon-footer"><div className="celadon-container celadon-footer-inner">
        <Link href="/" className="celadon-brand"><span className="celadon-brand-mark"><GraduationCap size={21}/></span><span>Sukses<span>CPNS</span></span></Link>
        <p>Platform belajar independen untuk persiapan seleksi CPNS dan PPPK. Bukan situs resmi pemerintah atau BKN.</p>
        <div><Link href="/kebijakan-privasi">Kebijakan privasi</Link><Link href="/syarat-ketentuan">Syarat & ketentuan</Link><Link href="/paket">Paket belajar</Link></div>
        <small>© {new Date().getFullYear()} Sukses CPNS</small>
      </div></footer>
    </main>
  );
}
